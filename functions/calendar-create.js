function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}
function allowedPasswords(env) {
  const builtin = ["Bebelya9", "Bebelya91", "BebelyaA", "BebelyaNP", "BebelyaNK", "BebelyaD"];
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
function cleanText(value, max = 2000) { return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, max); }

function calendarMoney(value) {
  if (value === null || value === undefined || value === "") return "";
  const raw = String(value).replace(/[^0-9,.-]/g, "").replace(",", ".");
  const n = Number(raw);
  if (!Number.isFinite(n)) return String(value).trim();
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
}
function calendarAutoServices(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch (_) { return []; }
}
function buildCalendarServicesSummary(fields = {}) {
  const services = calendarAutoServices(fields["Авто услуги"]);
  const lines = [];
  let total = 0;
  let hasTotal = false;
  services.forEach((item, index) => {
    const name = cleanText(item.name || item.service || item.title || "Услуга", 300);
    const material = cleanText(item.material || item.film || item["Материал"] || "", 250);
    const priceRaw = item.price ?? item.amount ?? item.sum ?? item.total ?? item["Сумма"];
    const price = calendarMoney(priceRaw);
    const n = Number(String(priceRaw ?? "").replace(/[^0-9,.-]/g, "").replace(",", "."));
    if (Number.isFinite(n)) { total += n; hasTotal = true; }
    let line = `${index + 1}. ${name}`;
    if (material) line += ` — материал: ${material}`;
    if (price) line += ` — ${price} ₽`;
    lines.push(line);
  });
  if (!lines.length) {
    const service = cleanText(fields["Услуга"] || "", 500);
    if (service) {
      let line = `1. ${service}`;
      const material = cleanText(fields["Пленка"] || fields["Плёнка"] || "", 250);
      const m2 = cleanText(fields["Итоговый м2"] || fields["м2"] || "", 80);
      const price = calendarMoney(fields["Общая стоимость"] || fields["Сумма"] || fields["Стоимость"] || "");
      if (material) line += ` — материал: ${material}`;
      if (m2) line += ` — ${m2} м²`;
      if (price) line += ` — ${price} ₽`;
      lines.push(line);
    }
  }
  const explicitTotal = calendarMoney(fields["Общая стоимость"] || fields["Сумма"] || fields["Стоимость"] || "");
  const totalText = explicitTotal || (hasTotal ? calendarMoney(total) : "");
  return { lines, text: lines.join("\n"), totalText };
}
function enrichCalendarFields(fields = {}) {
  const out = { ...(fields || {}) };
  const summary = buildCalendarServicesSummary(out);
  if (summary.text) out["Услуги и суммы"] = summary.text;
  if (summary.totalText) out["Общая стоимость"] = summary.totalText;
  return out;
}
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
  const fields = enrichCalendarFields(input.fields || {});
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
