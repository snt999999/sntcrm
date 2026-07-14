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
function stripHtml(text) {
  return String(text || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 900);
}
function explainNonJson(text, response) {
  const raw = String(text || "").slice(0, 1200);
  const plain = /<\s*!doctype html|<\s*html/i.test(raw) ? stripHtml(raw) : raw.slice(0, 900);
  return {
    ok: false,
    error: "Apps Script вернул не JSON",
    hint: "Проверьте Web App URL /exec, доступ Anyone и публикацию новой версии Apps Script.",
    status: response.status,
    contentType: response.headers.get("content-type") || "",
    rawSnippet: plain
  };
}
async function parseAppsScriptResponse(response) {
  const text = await response.text();
  const cleaned = String(text || "").replace(/^\uFEFF/, "").trim();
  try { return JSON.parse(cleaned); } catch (_) { return explainNonJson(cleaned, response); }
}
export async function onRequestPost(context) {
  const { request, env } = context;
  const auth = checkAdmin(request, env);
  if (!auth.ok) return json(auth.body, auth.status);
  if (!env.GOOGLE_DRIVE_UPLOAD_URL) return json({ ok: false, error: "GOOGLE_DRIVE_UPLOAD_URL is not set" }, 500);
  let body;
  try { body = await request.json(); } catch (_) { return json({ ok: false, error: "Invalid JSON" }, 400); }
  const fileId = String(body.fileId || body.id || String(body.key || "").replace(/^drive:/, "")).trim();
  if (!fileId) return json({ ok: false, error: "Не указан fileId" }, 400);
  const payload = { action: "delete", token: env.GOOGLE_DRIVE_UPLOAD_TOKEN || "", fileId };
  const response = await fetch(env.GOOGLE_DRIVE_UPLOAD_URL, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  });
  const data = await parseAppsScriptResponse(response);
  if (!response.ok || !data.ok) return json({ ok: false, error: data.error || "Ошибка удаления в Google Drive", hint: data.hint || "", details: data }, 500);
  return json({ ok: true, deleted: fileId });
}
export async function onRequest(context) {
  if (context.request.method !== "POST") return json({ ok: false, error: "Only POST" }, 405);
  return onRequestPost(context);
}
