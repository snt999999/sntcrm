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
  const url = new URL(request.url);
  const provided = (
    request.headers.get("x-admin-password") ||
    url.searchParams.get("password") ||
    url.searchParams.get("adminPassword") ||
    ""
  ).trim();
  if (!provided) return { ok: false, status: 401, body: { ok: false, error: "Не передан пароль", hint: "Проверка Google Drive открыта напрямую без пароля администратора. Открывайте её кнопкой из админки или передайте ?password=..." } };
  if (!allowedPasswords(env).has(provided)) return { ok: false, status: 401, body: { ok: false, error: "Неверный пароль" } };
  return { ok: true };
}
function stripHtml(text) {
  return String(text || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 1200);
}
async function parse(response) {
  const text = await response.text();
  const cleaned = String(text || "").replace(/^\uFEFF/, "").trim();
  try { return JSON.parse(cleaned); }
  catch (_) { return { ok: false, error: "Apps Script вернул не JSON", hint: "Чаще всего это неправильная ссылка, доступ не Anyone или не опубликована новая версия Apps Script.", status: response.status, contentType: response.headers.get("content-type") || "", rawSnippet: /<\s*html|<\s*!doctype/i.test(cleaned) ? stripHtml(cleaned) : cleaned.slice(0, 1200) }; }
}
export async function onRequest(context) {
  const { request, env } = context;
  const auth = checkAdmin(request, env);
  if (!auth.ok) return json(auth.body, auth.status);
  if (!env.GOOGLE_DRIVE_UPLOAD_URL) return json({ ok: false, error: "GOOGLE_DRIVE_UPLOAD_URL is not set", hint: "В Cloudflare Pages добавьте переменную GOOGLE_DRIVE_UPLOAD_URL со ссылкой Apps Script /exec." }, 500);
  if (!env.GOOGLE_DRIVE_UPLOAD_TOKEN) return json({ ok: false, error: "GOOGLE_DRIVE_UPLOAD_TOKEN is not set", hint: "В Cloudflare Pages добавьте переменную GOOGLE_DRIVE_UPLOAD_TOKEN. Точно такой же токен должен быть в Apps Script." }, 500);
  const payload = { action: "health", token: env.GOOGLE_DRIVE_UPLOAD_TOKEN };
  let response;
  try {
    response = await fetch(env.GOOGLE_DRIVE_UPLOAD_URL, { method: "POST", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
  } catch (error) {
    return json({ ok: false, error: "Не удалось обратиться к Apps Script: " + error.message }, 502);
  }
  const data = await parse(response);
  return json({ ok: !!(response.ok && data.ok), status: response.status, appsScript: data, urlLooksOk: String(env.GOOGLE_DRIVE_UPLOAD_URL || "").includes("/exec") }, response.ok && data.ok ? 200 : 500);
}
