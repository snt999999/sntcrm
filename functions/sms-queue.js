const DEFAULT_SMS_LIMIT = 1000;
const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };

function json(body, status = 200) { return new Response(JSON.stringify(body, null, 2), { status, headers: JSON_HEADERS }); }
function parseJson(text) { try { return JSON.parse(text); } catch (_) { return text; } }
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
function endpoint(env) { return env.NOCODB_SMS_ENDPOINT || env.NOCODB_NOTIFICATIONS_ENDPOINT || ""; }
function token(env) { return env.NOCODB_TOKEN || ""; }
function normRecord(rec) { const fields = rec.fields || rec; const id = rec.id || (rec.id_fields && (rec.id_fields.Id || rec.id_fields.id)) || fields.Id || fields.id || ""; return { id: String(id), fields }; }

async function listSms(env, limit = DEFAULT_SMS_LIMIT) {
  if (!endpoint(env)) return { ok: false, setupRequired: true, records: [], error: "Не задан NOCODB_SMS_ENDPOINT" };
  const url = new URL(endpoint(env));
  url.searchParams.set("limit", String(limit));
  const res = await fetch(url.toString(), { headers: { "xc-token": token(env) } });
  const text = await res.text();
  const data = parseJson(text);
  if (!res.ok) return { ok: false, error: "NocoDB SMS list error", status: res.status, nocodbResponse: data };
  const raw = Array.isArray(data) ? data : (data.records || data.list || []);
  return { ok: true, records: raw.map(normRecord) };
}
async function createSms(env, fields) {
  if (!endpoint(env)) return { ok: false, setupRequired: true, error: "Не задан NOCODB_SMS_ENDPOINT" };
  const res = await fetch(endpoint(env), { method: "POST", headers: { "Content-Type": "application/json", "xc-token": token(env) }, body: JSON.stringify([{ fields }]) });
  const text = await res.text();
  const data = parseJson(text);
  if (!res.ok) return { ok: false, error: "NocoDB SMS create error", status: res.status, nocodbResponse: data, sentFields: fields };
  return { ok: true, nocodbResponse: data };
}
async function patchSms(env, id, fields) {
  if (!endpoint(env)) return { ok: false, setupRequired: true, error: "Не задан NOCODB_SMS_ENDPOINT" };
  const payload = [{ id: Number(id) || id, fields }];
  const res = await fetch(endpoint(env), { method: "PATCH", headers: { "Content-Type": "application/json", "xc-token": token(env) }, body: JSON.stringify(payload) });
  const text = await res.text();
  const data = parseJson(text);
  if (!res.ok) return { ok: false, error: "NocoDB SMS update error", status: res.status, nocodbResponse: data, sentPayload: payload };
  return { ok: true, nocodbResponse: data };
}
async function patchSmsSafe(env, id, extendedFields, fallbackFields) {
  const full = await patchSms(env, id, extendedFields);
  if (full.ok || !fallbackFields) return full;
  const fallback = await patchSms(env, id, fallbackFields);
  return { ...fallback, extendedFailed: full };
}
function compactJson(value, max = 1800) { try { return JSON.stringify(value || {}).slice(0, max); } catch (_) { return String(value || "").slice(0, max); } }
function cleanText(value, max = 900) { return String(value || "").replace(/[<>]/g, "").trim().slice(0, max); }
function cleanDate(value) { return String(value || "").slice(0, 10); }
function cleanTime(value) { return String(value || "").slice(0, 5); }
function normalizePhone(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 11 && digits.startsWith("8")) digits = "7" + digits.slice(1);
  if (digits.length === 10 && digits.startsWith("9")) digits = "7" + digits;
  return digits;
}
function buildFields(body) {
  const phone = normalizePhone(body.phone || body.to || body["Телефон"] || "");
  const date = cleanDate(body.date || body.sendDate || body["Дата отправки"] || "");
  const time = cleanTime(body.time || body.sendTime || body["Время отправки"] || "");
  const message = cleanText(body.message || body.text || body["Текст SMS"] || "");
  if (!phone) throw new Error("Не указан телефон клиента");
  if (!message) throw new Error("Не указан текст SMS");
  if (!date || !time) throw new Error("Укажите дату и время отправки SMS");
  return {
    "ID заявки": cleanText(body.recordId || body.requestId || body["ID заявки"] || "", 80),
    "ФИО": cleanText(body.client || body.name || body["ФИО"] || "", 160),
    "Компания": cleanText(body.company || body["Компания"] || "", 160),
    "Телефон": phone,
    "Канал": "sms",
    "Тип уведомления": cleanText(body.type || body.template || body["Тип уведомления"] || "Напоминание", 120),
    "Текст SMS": message,
    "Дата отправки": date,
    "Время отправки": time,
    "Статус": cleanText(body.status || "Запланировано", 60),
    "Ошибка": "",
    "Дата фактической отправки": "",
    "Создано": new Date().toISOString()
  };
}
export async function onRequestGet({ request, env }) {
  const auth = checkAdmin(request, env); if (!auth.ok) return json(auth.body, auth.status);
  if (!token(env)) return json({ ok: false, error: "NOCODB_TOKEN is missing" }, 500);
  const url = new URL(request.url);
  const listed = await listSms(env, Number(url.searchParams.get("limit") || DEFAULT_SMS_LIMIT));
  return json(listed, listed.ok || listed.setupRequired ? 200 : 500);
}
export async function onRequestPost({ request, env }) {
  const auth = checkAdmin(request, env); if (!auth.ok) return json(auth.body, auth.status);
  if (!token(env)) return json({ ok: false, error: "NOCODB_TOKEN is missing" }, 500);
  let body; try { body = await request.json(); } catch (_) { return json({ ok: false, error: "Invalid JSON" }, 400); }
  try {
    const action = String(body.action || "schedule").toLowerCase();
    if (action === "schedule") {
      const result = await createSms(env, buildFields(body));
      return json(result, result.ok || result.setupRequired ? 200 : 500);
    }
    if (["cancel", "restore", "mark_sent", "mark_error", "reschedule"].includes(action)) {
      if (!body.id) return json({ ok: false, error: "Не указан id SMS" }, 400);
      let fields = {};
      if (action === "cancel") fields = { "Статус": "Отменено", "Ошибка": cleanText(body.reason || "Отменено вручную") };
      if (action === "restore") fields = { "Статус": "Запланировано", "Ошибка": "" };
      if (action === "mark_sent") fields = { "Статус": "Отправлено", "Дата фактической отправки": new Date().toISOString(), "Ошибка": "" };
      if (action === "mark_error") fields = { "Статус": "Ошибка", "Ошибка": cleanText(body.error || "Ошибка отправки") };
      if (action === "reschedule") fields = { "Статус": "Запланировано", "Дата отправки": cleanDate(body.date), "Время отправки": cleanTime(body.time), "Ошибка": "" };
      let result;
      if (action === "mark_sent") {
        const extended = {
          ...fields,
          "ID SIGMA": cleanText(body.smsId || body.sms_id || body.sigmaId || "", 100),
          "Статус доставки": cleanText(body.deliveryStatus || body.smsStatus || "OK", 120),
          "Стоимость SMS": cleanText(body.cost || body.smsCost || "", 80),
          "Баланс после отправки": cleanText(body.balance || "", 80),
          "Ответ сервиса": compactJson(body.serviceResponse || body.result || body),
          "Дата проверки статуса": new Date().toISOString()
        };
        result = await patchSmsSafe(env, body.id, extended, fields);
      } else if (action === "mark_error") {
        const extended = { ...fields, "Статус доставки": cleanText(body.deliveryStatus || body.smsStatus || "ERROR", 120), "Ответ сервиса": compactJson(body.serviceResponse || body.result || body), "Дата проверки статуса": new Date().toISOString() };
        result = await patchSmsSafe(env, body.id, extended, fields);
      } else {
        result = await patchSms(env, body.id, fields);
      }
      return json(result, result.ok || result.setupRequired ? 200 : 500);
    }
    return json({ ok: false, error: "Неизвестное действие SMS-очереди" }, 400);
  } catch (error) {
    return json({ ok: false, error: error.message || String(error) }, 500);
  }
}
export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ ok: false, error: "Only GET/POST" }, 405);
}
