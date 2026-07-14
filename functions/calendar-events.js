function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
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
function parseJson(text) {
  try { return JSON.parse(text); } catch (_) { return null; }
}
function isoDay(value) {
  const s = String(value || "").slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
}
function todayYekaterinburg() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yekaterinburg", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
function addDays(dateStr, days) {
  const d = new Date((dateStr || todayYekaterinburg()) + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
async function readInput(request) {
  const url = new URL(request.url);
  if (request.method === "GET") {
    return {
      action: url.searchParams.get("action") || "health",
      dateFrom: url.searchParams.get("dateFrom") || "",
      dateTo: url.searchParams.get("dateTo") || ""
    };
  }
  try { return await request.json(); } catch (_) { return {}; }
}
async function callAppsScript(env, payload) {
  const endpoint = env.GOOGLE_CALENDAR_IMPORT_URL;
  const token = env.GOOGLE_CALENDAR_IMPORT_TOKEN;
  if (!endpoint) return { ok: false, error: "GOOGLE_CALENDAR_IMPORT_URL не задан в Cloudflare Pages" };
  if (!token) return { ok: false, error: "GOOGLE_CALENDAR_IMPORT_TOKEN не задан в Cloudflare Pages" };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ ...payload, token })
  });
  const text = await response.text();
  const data = parseJson(text);
  if (!data) {
    return {
      ok: false,
      status: response.status,
      error: "Apps Script вернул не JSON. Проверьте, что Web App опубликован как /exec и доступен Anyone.",
      responsePreview: text.slice(0, 800),
      urlLooksOk: String(endpoint).includes("/exec")
    };
  }
  if (!response.ok || data.ok === false) {
    return { ok: false, status: response.status, error: data.error || "Ошибка Apps Script", appsScript: data };
  }
  return { ok: true, status: response.status, ...data };
}
export async function onRequest(context) {
  const { request, env } = context;
  const auth = checkAdmin(request, env);
  if (!auth.ok) return json(auth.body, auth.status);
  const input = await readInput(request);
  const action = input.action || "health";
  const from = isoDay(input.dateFrom) || todayYekaterinburg();
  const to = isoDay(input.dateTo) || addDays(from, 7);
  try {
    const result = await callAppsScript(env, { action, dateFrom: from, dateTo: to });
    return json(result, result.ok ? 200 : 500);
  } catch (error) {
    return json({ ok: false, error: error.message || "Ошибка функции календаря" }, 500);
  }
}
