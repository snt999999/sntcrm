const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };

export async function onRequestPost({ request, env }) {
  try {
    const password = request.headers.get("x-admin-password") || "";
    if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) {
      return json({ ok: false, error: "Неверный пароль администратора" }, 401);
    }

    const body = await request.json().catch(() => ({}));
    const channel = String(body.channel || "sms").toLowerCase();
    const message = cleanText(body.message || body.text || "");
    const to = normalizePhone(body.to || body.phone || body.chatId || "");

    if (!message) return json({ ok: false, error: "Пустой текст уведомления" }, 400);

    if (channel === "sms") {
      if (!to) return json({ ok: false, error: "Не указан номер телефона клиента" }, 400);
      const smsPayload = await sendSigmaSms({ env, to, message });
      if (!body.skipSmsLog && !body.queueId) await logDirectSms({ env, body, to, message, smsPayload });
      return json(smsPayload, 200);
    }

    if (channel === "telegram" || channel === "admin_telegram") {
      const chatId = to || env.TELEGRAM_ADMIN_CHAT_ID || "";
      if (!chatId) return json({ ok: false, error: "Не указан TELEGRAM_ADMIN_CHAT_ID" }, 400);
      return await sendTelegram({ env, chatId, message });
    }

    return json({ ok: false, error: "Неизвестный канал уведомлений: " + channel }, 400);
  } catch (error) {
    return json({ ok: false, error: error.message || String(error) }, 500);
  }
}

export async function onRequestGet({ request, env }) {
  const password = request.headers.get("x-admin-password") || "";
  if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) {
    return json({ ok: false, error: "Неверный пароль администратора" }, 401);
  }
  return json({
    ok: true,
    sms: Boolean(env.SIGMA_API_TOKEN || env.SIGMA_TOKEN),
    telegram: Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_ADMIN_CHAT_ID),
    provider: "sigma",
    apiBase: sigmaBase(env),
    sender: env.SIGMA_SENDER || env.SMS_SENDER || "",
    senderMode: env.SIGMA_SENDER ? "account_sender" : "account_default_or_tariff",
    testMode: false
  });
}

function smsEndpoint(env) { return env.NOCODB_SMS_ENDPOINT || env.NOCODB_NOTIFICATIONS_ENDPOINT || ""; }
function nocodbToken(env) { return env.NOCODB_TOKEN || ""; }
function sigmaBase(env) { return (env.SIGMA_API_URL || "https://user.sigmasms.ru/api").replace(/\/+$/, ""); }
function sigmaToken(env) { return env.SIGMA_API_TOKEN || env.SIGMA_TOKEN || ""; }
function yDateTimeParts() {
  const parts = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Yekaterinburg", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}
function compactJson(value, max = 3000) { try { return JSON.stringify(value || {}).slice(0, max); } catch (_) { return String(value || "").slice(0, max); } }
async function createSmsLog(env, fields) {
  if (!smsEndpoint(env) || !nocodbToken(env)) return { ok: false, skipped: true, error: "NOCODB_SMS_ENDPOINT/NOCODB_TOKEN не заданы" };
  const res = await fetch(smsEndpoint(env), {
    method: "POST",
    headers: { "Content-Type": "application/json", "xc-token": nocodbToken(env) },
    body: JSON.stringify([{ fields }])
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch (_) { data = text; }
  return { ok: res.ok, status: res.status, response: data };
}
async function logDirectSms({ env, body, to, message, smsPayload }) {
  if (!smsEndpoint(env) || !nocodbToken(env)) return;
  const now = yDateTimeParts();
  const baseFields = {
    "ID заявки": cleanText(body.recordId || body.requestId || "TEST-" + Date.now(), 80),
    "ФИО": cleanText(body.client || body.name || "Тестовая отправка", 160),
    "Компания": cleanText(body.company || "", 160),
    "Телефон": normalizePhone(to),
    "Канал": "sms",
    "Тип уведомления": cleanText(body.type || "Тестовая / ручная отправка", 120),
    "Текст SMS": message,
    "Дата отправки": now.date,
    "Время отправки": now.time,
    "Статус": smsPayload?.ok ? "Отправлено" : "Ошибка",
    "Ошибка": smsPayload?.ok ? "" : cleanText(smsPayload?.error || "Ошибка отправки", 700),
    "Дата фактической отправки": smsPayload?.ok ? new Date().toISOString() : "",
    "Создано": new Date().toISOString()
  };
  const extendedFields = {
    ...baseFields,
    "ID SIGMA": cleanText(smsPayload?.smsId || smsPayload?.id || "", 120),
    "Статус доставки": cleanText(smsPayload?.statusText || smsPayload?.status || "", 160),
    "Стоимость SMS": cleanText(smsPayload?.cost ?? "", 80),
    "Баланс после отправки": cleanText(smsPayload?.balance ?? "", 80),
    "Ответ сервиса": compactJson(smsPayload?.result || smsPayload),
    "Дата проверки статуса": new Date().toISOString()
  };
  const full = await createSmsLog(env, extendedFields);
  if (!full.ok) await createSmsLog(env, baseFields);
}

async function sendSigmaSms({ env, to, message }) {
  const token = sigmaToken(env);
  if (!token) return { ok: false, provider: "sigma", error: "Не задан SIGMA_API_TOKEN в Cloudflare" };
  const phone = normalizePhone(to);
  if (!phone || phone.length !== 11 || !phone.startsWith("7")) {
    return { ok: false, provider: "sigma", error: "Неверный телефон. Нужен формат 79XXXXXXXXX", to: phone };
  }
  const recipient = "+" + phone;
  const sender = cleanText(env.SIGMA_SENDER || env.SMS_SENDER || "", 80);
  const payload = { text: message };
  if (sender) payload.sender = sender;
  const requestBody = { recipient, type: "sms", payload };
  const url = new URL(`${sigmaBase(env)}/sendings`);
  url.searchParams.set("return", "each");
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": token },
    body: JSON.stringify(requestBody)
  });
  const raw = await response.text();
  let data; try { data = JSON.parse(raw); } catch (_) { data = { raw }; }
  const item = firstSigmaItem(data);
  const id = sigmaId(item || data);
  const state = sigmaState(item || data);
  const errorText = state.error || data.message || data.error || data.name || data.raw || "";
  const ok = response.ok && Boolean(id) && !isSigmaFailed(state.status, errorText);
  return {
    ok,
    provider: "sigma",
    to: phone,
    recipient,
    sender,
    smsId: id,
    id,
    status: state.status || (ok ? "created" : "error"),
    statusText: sigmaStatusText(state.status, errorText),
    cost: item?.cost ?? data.cost ?? "",
    balance: data.balance ?? "",
    result: data,
    request: { ...requestBody, payload: { ...payload, text: message } },
    error: ok ? "" : (sigmaStatusText(state.status, errorText) || `SIGMA не подтвердила отправку. HTTP ${response.status}`)
  };
}
function firstSigmaItem(data) {
  if (Array.isArray(data)) return data[0];
  if (Array.isArray(data?.data)) return data.data[0];
  if (Array.isArray(data?.items)) return data.items[0];
  if (Array.isArray(data?.sendings)) return data.sendings[0];
  if (Array.isArray(data?.result)) return data.result[0];
  return data;
}
function sigmaId(x) { return cleanText(x?.id || x?._id || x?.uuid || x?.sendingId || x?.messageId || x?.groupId || "", 120); }
function sigmaState(x) { const s = x?.state || {}; return { status: cleanText(s.status || x?.status || x?.stateStatus || "", 120), error: cleanText(s.error || x?.error || x?.errorMessage || "", 700) }; }
function isSigmaFailed(status, errorText) { return /failed|error|rejected|declined|cancel/i.test(String(status || "")) || Boolean(errorText && errorText !== "false"); }
function sigmaStatusText(status, errorText) {
  if (errorText && errorText !== "false") return errorText;
  const s = String(status || "").toLowerCase();
  if (!s) return "Принято SIGMA";
  const map = { pending: "В очереди", queued: "В очереди", created: "Создано", processing: "Обрабатывается", sent: "Отправлено", delivered: "Доставлено", failed: "Ошибка", error: "Ошибка", canceled: "Отменено", rejected: "Отклонено" };
  return map[s] || status;
}
async function sendTelegram({ env, chatId, message }) {
  const token = env.TELEGRAM_BOT_TOKEN || "";
  if (!token) return json({ ok: false, error: "Не задан TELEGRAM_BOT_TOKEN в Cloudflare" }, 400);
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message, disable_web_page_preview: true })
  });
  const data = await response.json().catch(() => ({}));
  return json({ ok: Boolean(data.ok), provider: "telegram", chatId, result: data, error: data.ok ? "" : (data.description || "Telegram не подтвердил отправку") }, 200);
}
function normalizePhone(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) digits = "7" + digits.slice(1);
  if (digits.length === 10 && digits.startsWith("9")) digits = "7" + digits;
  return digits;
}
function cleanText(value, max = 900) { return String(value || "").replace(/[<>]/g, "").trim().slice(0, max); }
function json(data, status = 200) { return new Response(JSON.stringify(data, null, 2), { status, headers: JSON_HEADERS }); }
