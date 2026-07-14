const DEFAULT_SMS_LIMIT = 500;
const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
function json(body, status = 200) { return new Response(JSON.stringify(body, null, 2), { status, headers: JSON_HEADERS }); }
function parseJson(text) { try { return JSON.parse(text); } catch (_) { return text; } }
function endpoint(env) { return env.NOCODB_SMS_ENDPOINT || env.NOCODB_NOTIFICATIONS_ENDPOINT || ""; }
function token(env) { return env.NOCODB_TOKEN || ""; }
function sigmaBase(env) { return (env.SIGMA_API_URL || "https://user.sigmasms.ru/api").replace(/\/+$/, ""); }
function sigmaToken(env) { return env.SIGMA_API_TOKEN || env.SIGMA_TOKEN || ""; }
function checkCronAuth(request, env) {
  const secret = env.SMS_CRON_SECRET || "";
  if (!secret) return { ok: false, status: 500, body: { ok: false, error: "SMS_CRON_SECRET is not set" } };
  const provided = request.headers.get("x-cron-secret") || new URL(request.url).searchParams.get("secret") || "";
  if (provided !== secret) return { ok: false, status: 401, body: { ok: false, error: "Неверный SMS_CRON_SECRET" } };
  return { ok: true };
}
function normRecord(rec) { const fields = rec.fields || rec; const id = rec.id || (rec.id_fields && (rec.id_fields.Id || rec.id_fields.id)) || fields.Id || fields.id || ""; return { id: String(id), fields }; }
async function listSms(env) {
  if (!endpoint(env)) return { ok: false, setupRequired: true, records: [], error: "Не задан NOCODB_SMS_ENDPOINT" };
  const url = new URL(endpoint(env));
  url.searchParams.set("limit", String(DEFAULT_SMS_LIMIT));
  const res = await fetch(url.toString(), { headers: { "xc-token": token(env) } });
  const text = await res.text(); const data = parseJson(text);
  if (!res.ok) return { ok: false, error: "NocoDB SMS list error", status: res.status, nocodbResponse: data };
  const raw = Array.isArray(data) ? data : (data.records || data.list || []);
  return { ok: true, records: raw.map(normRecord) };
}
async function patchSms(env, id, fields) {
  const payload = [{ id: Number(id) || id, fields }];
  const res = await fetch(endpoint(env), { method: "PATCH", headers: { "Content-Type": "application/json", "xc-token": token(env) }, body: JSON.stringify(payload) });
  const text = await res.text(); const data = parseJson(text);
  return { ok: res.ok, status: res.status, response: data, payload };
}
async function patchSmsSafe(env, id, extendedFields, fallbackFields) {
  const full = await patchSms(env, id, extendedFields);
  if (full.ok || !fallbackFields) return full;
  const fallback = await patchSms(env, id, fallbackFields);
  return { ...fallback, extendedFailed: full };
}
function compactJson(value, max = 1800) { try { return JSON.stringify(value || {}).slice(0, max); } catch (_) { return String(value || "").slice(0, max); } }
function nowYekaterinburgParts() {
  const parts = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Yekaterinburg", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}
function isDue(fields, now) {
  const status = String(fields["Статус"] || "");
  if (status !== "Запланировано") return false;
  const d = String(fields["Дата отправки"] || "").slice(0, 10);
  const t = String(fields["Время отправки"] || "00:00").slice(0, 5);
  if (!d || !t) return false;
  return `${d} ${t}` <= `${now.date} ${now.time}`;
}
function normalizePhone(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) digits = "7" + digits.slice(1);
  if (digits.length === 10 && digits.startsWith("9")) digits = "7" + digits;
  return digits;
}
function cleanText(value, max = 900) { return String(value || "").replace(/[<>]/g, "").trim().slice(0, max); }
function firstSigmaItem(data) {
  if (Array.isArray(data)) return data[0];
  if (Array.isArray(data?.data)) return data.data[0];
  if (Array.isArray(data?.items)) return data.items[0];
  if (Array.isArray(data?.sendings)) return data.sendings[0];
  if (Array.isArray(data?.result)) return data.result[0];
  return data;
}
function sigmaId(x) { return cleanText(x?.id || x?._id || x?.uuid || x?.sendingId || x?.messageId || x?.groupId || "", 120); }
function sigmaState(x) { const s = x?.state || {}; return { status: cleanText(s.status || x?.status || x?.stateStatus || "", 120), error: cleanText(s.error || x?.error || x?.message || x?.errorMessage || "", 700) }; }
function isSigmaFailed(status, errorText) { return /failed|error|rejected|declined|cancel/i.test(String(status || "")) || Boolean(errorText && errorText !== "false"); }
function sigmaStatusText(status, errorText) {
  if (errorText && errorText !== "false") return errorText;
  const s = String(status || "").toLowerCase();
  const map = { pending: "В очереди", queued: "В очереди", created: "Создано", processing: "Обрабатывается", sent: "Отправлено", delivered: "Доставлено", failed: "Ошибка", error: "Ошибка", canceled: "Отменено", rejected: "Отклонено" };
  return map[s] || status || "Принято SIGMA";
}
async function sendSigmaSms(env, to, message) {
  const token = sigmaToken(env);
  if (!token) return { ok: false, provider: "sigma", error: "Не задан SIGMA_API_TOKEN" };
  const phone = normalizePhone(to);
  if (!phone || phone.length !== 11 || !phone.startsWith("7")) return { ok: false, provider: "sigma", error: "Неверный телефон. Нужен формат 79XXXXXXXXX", to: phone };
  const sender = cleanText(env.SIGMA_SENDER || env.SMS_SENDER || "", 80);
  const payload = { text: message };
  if (sender) payload.sender = sender;
  const requestBody = { recipient: "+" + phone, type: "sms", payload };
  const url = new URL(`${sigmaBase(env)}/sendings`);
  url.searchParams.set("return", "each");
  const res = await fetch(url.toString(), { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": token }, body: JSON.stringify(requestBody) });
  const raw = await res.text(); let data; try { data = JSON.parse(raw); } catch (_) { data = { raw }; }
  const item = firstSigmaItem(data);
  const id = sigmaId(item || data);
  const state = sigmaState(item || data);
  const errorText = state.error || data.message || data.error || data.name || data.raw || "";
  const ok = res.ok && Boolean(id) && !isSigmaFailed(state.status, errorText);
  return { ok, provider: "sigma", smsId: id, id, status: state.status || (ok ? "created" : "error"), statusText: sigmaStatusText(state.status, errorText), cost: item?.cost ?? data.cost ?? "", balance: data.balance ?? "", result: data, error: ok ? "" : (sigmaStatusText(state.status, errorText) || `SIGMA не подтвердила отправку. HTTP ${res.status}`) };
}
export async function onRequestGet({ request, env }) { return runSmsCron({ request, env, source: "http" }); }
export async function onRequestPost({ request, env }) { return runSmsCron({ request, env, source: "http" }); }
async function runSmsCron({ request, env, source }) {
  const auth = checkCronAuth(request, env); if (!auth.ok) return json(auth.body, auth.status);
  if (!token(env)) return json({ ok: false, error: "NOCODB_TOKEN is missing" }, 500);
  if (!endpoint(env)) return json({ ok: false, setupRequired: true, error: "Не задан NOCODB_SMS_ENDPOINT" }, 200);
  const listed = await listSms(env);
  if (!listed.ok) return json(listed, 500);
  const now = nowYekaterinburgParts();
  const due = listed.records.filter((r) => isDue(r.fields || {}, now));
  const results = [];
  for (const record of due.slice(0, 25)) {
    const f = record.fields || {};
    const to = normalizePhone(f["Телефон"] || "");
    const message = cleanText(f["Текст SMS"] || "");
    if (!to || !message) {
      const error = !to ? "Нет телефона" : "Нет текста SMS";
      await patchSms(env, record.id, { "Статус": "Ошибка", "Ошибка": error });
      results.push({ id: record.id, ok: false, error });
      continue;
    }
    await patchSms(env, record.id, { "Статус": "Отправляется", "Ошибка": "" });
    const sent = await sendSigmaSms(env, to, message);
    if (sent.ok) {
      const base = { "Статус": "Отправлено", "Дата фактической отправки": new Date().toISOString(), "Ошибка": "" };
      const extended = { ...base, "ID SIGMA": sent.smsId || "", "Статус доставки": sent.status || "created", "Ответ сервиса": compactJson(sent.result || sent), "Стоимость SMS": String(sent.cost ?? ""), "Баланс после отправки": String(sent.balance ?? ""), "Дата проверки статуса": new Date().toISOString() };
      await patchSmsSafe(env, record.id, extended, base);
    } else {
      const base = { "Статус": "Ошибка", "Ошибка": sent.error || "Ошибка отправки" };
      const extended = { ...base, "Статус доставки": sent.status || "ERROR", "Ответ сервиса": compactJson(sent.result || sent), "Дата проверки статуса": new Date().toISOString() };
      await patchSmsSafe(env, record.id, extended, base);
    }
    results.push({ id: record.id, to, ok: sent.ok, error: sent.error || "", provider: "sigma", smsId: sent.smsId || "", deliveryStatus: sent.status || "" });
  }
  return json({ ok: true, source, provider: "sigma", now, checked: listed.records.length, due: due.length, processed: results.length, results });
}
export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ ok: false, error: "Only GET/POST" }, 405);
}
