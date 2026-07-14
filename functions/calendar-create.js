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
function parseJson(text) { try { return JSON.parse(text); } catch (_) { return null; } }
function endpointFromEnv(env) { return env.GOOGLE_CALENDAR_SYNC_URL || env.GOOGLE_CALENDAR_EXPORT_URL || env.GOOGLE_CALENDAR_IMPORT_URL || ""; }
function tokenFromEnv(env) { return env.GOOGLE_CALENDAR_SYNC_TOKEN || env.GOOGLE_CALENDAR_EXPORT_TOKEN || env.GOOGLE_CALENDAR_IMPORT_TOKEN || ""; }
async function callAppsScript(env, payload) {
  const endpoint = endpointFromEnv(env);
  const token = tokenFromEnv(env);
  if (!endpoint) return { ok: false, error: "GOOGLE_CALENDAR_IMPORT_URL / GOOGLE_CALENDAR_SYNC_URL не задан в Cloudflare Pages" };
  if (!token) return { ok: false, error: "GOOGLE_CALENDAR_IMPORT_TOKEN / GOOGLE_CALENDAR_SYNC_TOKEN не задан в Cloudflare Pages" };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ ...payload, token })
  });
  const text = await response.text();
  const data = parseJson(text);
  if (!data) {
    return { ok: false, status: response.status, error: "Apps Script вернул не JSON. Проверьте Web App URL /exec и доступ Anyone.", responsePreview: text.slice(0, 800) };
  }
  if (!response.ok || data.ok === false) {
    return { ok: false, status: response.status, error: data.error || "Ошибка Apps Script", appsScript: data };
  }
  return { ok: true, status: response.status, ...data };
}
export async function onRequestPost(context) {
  const { request, env } = context;
  const auth = checkAdmin(request, env);
  if (!auth.ok) return json(auth.body, auth.status);
  let input = {};
  try { input = await request.json(); } catch (_) { return json({ ok: false, error: "Invalid JSON" }, 400); }
  const fields = input.fields || {};
  if (!fields["Имя клиента"] && !fields["Телефон"]) return json({ ok: false, error: "Недостаточно данных для события календаря" }, 400);
  if (!fields["Дата записи"] || !fields["Время записи"]) return json({ ok: false, error: "Для Google Календаря нужны дата и время записи" }, 400);
  const result = await callAppsScript(env, {
    action: input.action || (input.eventId ? "upsert" : "create"),
    eventId: input.eventId || "",
    recordId: input.recordId || "",
    source: input.source || "admin",
    fields
  });
  return json(result, result.ok ? 200 : 500);
}
export async function onRequestGet(context) {
  const { request, env } = context;
  const auth = checkAdmin(request, env);
  if (!auth.ok) return json(auth.body, auth.status);
  const result = await callAppsScript(env, { action: "health" });
  return json(result, result.ok ? 200 : 500);
}
export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ ok: false, error: "Only GET/POST" }, 405);
}
