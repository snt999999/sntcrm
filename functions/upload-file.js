function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

function allowedPasswords(env) {
  const builtin = ["sergey41", "roman41", "nikitaK41", "dima41", "nikitaP41", "andrey41"];
  const extra = String(env.USER_PASSWORDS || "").split(/[;,\n]/).map((x) => x.trim()).filter(Boolean);
  if (env.ADMIN_PASSWORD) builtin.push(String(env.ADMIN_PASSWORD));
  return new Set([...builtin, ...extra]);
}
function checkAdmin(request, env) {
  const provided = (request.headers.get("x-admin-password") || "").trim();
  if (!provided) return { ok: false, status: 401, body: { ok: false, error: "Не передан пароль" } };
  if (!allowedPasswords(env).has(provided)) return { ok: false, status: 401, body: { ok: false, error: "Неверный пароль" } };
  return { ok: true };
}

function safeText(value, max = 300) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
}

function fileTypeByMime(mime, name) {
  const m = String(mime || "").toLowerCase();
  const n = String(name || "").toLowerCase();
  if (m.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|heic)$/i.test(n)) return "фото";
  if (m.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm)$/i.test(n)) return "видео";
  if (m.includes("pdf") || /\.pdf$/i.test(n)) return "pdf";
  return "документ";
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function isLikelyHtml(text) {
  return /<\s*!doctype html|<\s*html|<\s*head|<\s*body/i.test(String(text || ""));
}

function stripHtml(text) {
  return String(text || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 900);
}

function explainNonJson(text, response) {
  const raw = String(text || "").slice(0, 1200);
  const plain = isLikelyHtml(raw) ? stripHtml(raw) : raw.slice(0, 900);
  let hint = "Apps Script вернул не JSON. Обычно это значит, что указан не Web App URL /exec, доступ Web App не стоит Anyone, либо после правки Apps Script не была опубликована новая версия.";
  if (/accounts\.google|ServiceLogin|Sign in|Войдите|Авториз/i.test(raw)) {
    hint = "Google вернул страницу входа. В Apps Script надо Deploy → Manage deployments → Web app: Execute as Me, Who has access: Anyone, затем New version / Deploy. В Cloudflare вставлять URL, который заканчивается на /exec.";
  } else if (/not found|404|не найден/i.test(raw)) {
    hint = "Google вернул 404. Скорее всего, в GOOGLE_DRIVE_UPLOAD_URL вставлена неправильная ссылка. Нужен Web App URL из Apps Script, обычно он заканчивается на /exec.";
  } else if (/Authorization is required|У вас нет доступа|You need access|Access denied|permission/i.test(raw)) {
    hint = "Недостаточно доступа к Apps Script. Разверните Web App с доступом Anyone и выполнением от имени Me.";
  }
  return {
    ok: false,
    error: "Apps Script вернул не JSON",
    hint,
    status: response.status,
    contentType: response.headers.get("content-type") || "",
    rawSnippet: plain
  };
}

async function parseAppsScriptResponse(response) {
  const text = await response.text();
  const cleaned = String(text || "").replace(/^\uFEFF/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    return explainNonJson(cleaned, response);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const auth = checkAdmin(request, env);
  if (!auth.ok) return json(auth.body, auth.status);
  if (!env.GOOGLE_DRIVE_UPLOAD_URL) {
    return json({ ok: false, error: "GOOGLE_DRIVE_UPLOAD_URL is not set. Подключите Google Apps Script Web App URL, который заканчивается на /exec." }, 500);
  }

  let form;
  try { form = await request.formData(); } catch (_) { return json({ ok: false, error: "Нужен multipart/form-data" }, 400); }
  const requestId = safeText(form.get("requestId"), 80);
  if (!requestId) return json({ ok: false, error: "Не указан номер заявки" }, 400);
  const formFiles = form.getAll("files").filter((x) => x && typeof x === "object" && "name" in x);
  if (!formFiles.length) return json({ ok: false, error: "Файлы не выбраны" }, 400);

  // Apps Script имеет лимиты на размер запроса. Для бесплатной схемы лучше грузить умеренные файлы.
  const totalSize = formFiles.reduce((sum, f) => sum + Number(f.size || 0), 0);
  if (totalSize > 25 * 1024 * 1024) {
    return json({ ok: false, error: "Слишком большой объём файлов за один раз. Для Google Apps Script загружайте партиями до 20–25 МБ." }, 413);
  }

  const payload = {
    action: "upload",
    token: env.GOOGLE_DRIVE_UPLOAD_TOKEN || "",
    requestId,
    client: safeText(form.get("client"), 200),
    phone: safeText(form.get("phone"), 80),
    address: safeText(form.get("address"), 300),
    service: safeText(form.get("service"), 200),
    status: safeText(form.get("status"), 80),
    uploadedAt: new Date().toISOString(),
    files: []
  };

  for (const file of formFiles) {
    const originalName = safeText(file.name || "file", 180) || "file";
    const contentType = file.type || "application/octet-stream";
    payload.files.push({
      name: originalName,
      originalName,
      contentType,
      fileType: fileTypeByMime(contentType, originalName),
      size: file.size || 0,
      base64: arrayBufferToBase64(await file.arrayBuffer())
    });
  }

  let driveResponse;
  try {
    driveResponse = await fetch(env.GOOGLE_DRIVE_UPLOAD_URL, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return json({ ok: false, error: "Не удалось отправить файл в Google Apps Script: " + error.message }, 502);
  }

  const data = await parseAppsScriptResponse(driveResponse);
  if (!driveResponse.ok || !data.ok) {
    return json({
      ok: false,
      error: data.error || "Ошибка Google Drive",
      hint: data.hint || "Проверьте Apps Script deployment и переменные Cloudflare.",
      details: data
    }, 500);
  }
  return json({ ok: true, uploaded: data.uploaded || [], warning: data.warning || "" });
}

export async function onRequest(context) {
  if (context.request.method !== "POST") return json({ ok: false, error: "Only POST" }, 405);
  return onRequestPost(context);
}
