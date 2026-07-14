const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
function json(body, status = 200) { return new Response(JSON.stringify(body, null, 2), { status, headers: JSON_HEADERS }); }
function parseJson(text) { try { return JSON.parse(text); } catch (_) { return text; } }
function cleanText(value, max = 900) { return String(value || "").replace(/[<>]/g, "").trim().slice(0, max); }
function endpoint(env) { return env.NOCODB_SMS_ENDPOINT || env.NOCODB_NOTIFICATIONS_ENDPOINT || ""; }
function token(env) { return env.NOCODB_TOKEN || ""; }
function sigmaBase(env) { return (env.SIGMA_API_URL || "https://user.sigmasms.ru/api").replace(/\/+$/, ""); }
function sigmaToken(env) { return env.SIGMA_API_TOKEN || env.SIGMA_TOKEN || ""; }
async function patchSms(env, id, fields) {
  if (!endpoint(env) || !token(env)) return { ok: false, skipped: true, error: "NOCODB_SMS_ENDPOINT/NOCODB_TOKEN не заданы" };
  const payload = [{ id: Number(id) || id, fields }];
  const res = await fetch(endpoint(env), { method: "PATCH", headers: { "Content-Type": "application/json", "xc-token": token(env) }, body: JSON.stringify(payload) });
  const text = await res.text();
  return { ok: res.ok, status: res.status, response: parseJson(text), payload };
}
async function patchSmsSafe(env, id, extendedFields, fallbackFields) {
  const full = await patchSms(env, id, extendedFields);
  if (full.ok || !fallbackFields) return full;
  const fallback = await patchSms(env, id, fallbackFields);
  return { ...fallback, extendedFailed: full };
}
function compactJson(value, max = 3000) { try { return JSON.stringify(value || {}).slice(0, max); } catch (_) { return String(value || "").slice(0, max); } }
function sigmaState(data) { const s = data?.state || {}; return { status: cleanText(s.status || data?.status || data?.stateStatus || "", 120), error: cleanText(s.error || data?.error || data?.message || data?.errorMessage || "", 700) }; }
function sigmaStatusText(status, errorText) {
  if (errorText && errorText !== "false") return errorText;
  const s = String(status || "").toLowerCase();
  const map = { pending: "В очереди", queued: "В очереди", created: "Создано", processing: "Обрабатывается", sent: "Отправлено", delivered: "Доставлено", failed: "Ошибка", error: "Ошибка", canceled: "Отменено", rejected: "Отклонено" };
  return map[s] || status || "Статус получен";
}
function isFailed(status, errorText) { return /failed|error|rejected|declined|cancel/i.test(String(status || "")) || Boolean(errorText && errorText !== "false"); }
async function checkSigmaStatus(env, sigmaId) {
  const token = sigmaToken(env);
  if (!token) return { ok: false, apiOk: false, provider: "sigma", error: "Не задан SIGMA_API_TOKEN" };
  if (!sigmaId) return { ok: false, apiOk: false, provider: "sigma", error: "Не указан ID SIGMA" };
  const url = new URL(`${sigmaBase(env)}/sendings/${encodeURIComponent(sigmaId)}`);
  url.searchParams.set("$scope", "full");
  const res = await fetch(url.toString(), { method: "GET", headers: { "Accept": "application/json", "Authorization": token } });
  const raw = await res.text();
  let data; try { data = JSON.parse(raw); } catch (_) { data = { raw }; }
  const state = sigmaState(data);
  const statusText = sigmaStatusText(state.status, state.error);
  const apiOk = res.ok && Boolean(data) && !data.raw;
  const delivered = /delivered|достав/i.test(String(state.status || statusText));
  const failed = !apiOk || isFailed(state.status, state.error);
  return { ok: apiOk, apiOk, delivered, failed, provider: "sigma", smsId: sigmaId, id: sigmaId, statusCode: state.status || "", statusText, rawStatusText: state.status || "", cost: data.cost ?? data.price ?? "", result: data, error: apiOk ? "" : (statusText || `SIGMA не вернула статус. HTTP ${res.status}`) };
}
export async function onRequestPost({ request, env }) {
  const password = request.headers.get("x-admin-password") || "";
  if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) return json({ ok: false, error: "Неверный пароль администратора" }, 401);
  let body; try { body = await request.json(); } catch (_) { body = {}; }
  const url = new URL(request.url);
  const smsId = cleanText(body.smsId || body.sms_id || body.id || body.sigmaId || url.searchParams.get("smsId") || url.searchParams.get("id") || "", 120);
  const nocodbId = cleanText(body.nocodbId || body.recordId || "", 100);
  const checked = await checkSigmaStatus(env, smsId);
  if (nocodbId && smsId) {
    const base = { "Статус доставки": cleanText(checked.statusText || checked.statusCode || "", 160), "Дата проверки статуса": new Date().toISOString() };
    if (checked.delivered) base["Статус"] = "Доставлено";
    if (checked.failed && !checked.delivered) base["Статус"] = "Ошибка";
    const extended = { ...base, "ID SIGMA": smsId, "Стоимость SMS": String(checked.cost ?? ""), "Ответ сервиса": compactJson(checked.result || checked) };
    const patched = await patchSmsSafe(env, nocodbId, extended, base);
    checked.nocodbUpdate = patched;
  }
  return json(checked, checked.apiOk ? 200 : 502);
}
export async function onRequestGet(ctx) { return onRequestPost(ctx); }
export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ ok: false, error: "Only GET/POST" }, 405);
}
