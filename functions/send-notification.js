const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
function json(body, status = 200) { return new Response(JSON.stringify(body, null, 2), { status, headers: JSON_HEADERS }); }
function parseJson(text) { try { return JSON.parse(text); } catch (_) { return text; } }
function cleanText(value, max = 2000) { return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, max); }
function normalizePhone(value) { let d = String(value || "").replace(/\D/g, ""); if (d.length === 11 && d.startsWith("8")) d = "7" + d.slice(1); if (d.length === 10 && d.startsWith("9")) d = "7" + d; return d; }
function toNumber(value) { if (value === "" || value === null || value === undefined) return null; const n = Number(String(value).replace(/\s/g, "").replace(",", ".")); return Number.isFinite(n) ? n : null; }
function dateOnly(value) { return String(value || "").slice(0, 10) || null; }
function timeOnly(value) { return String(value || "").slice(0, 5) || null; }
function allowedPasswords(env) { const builtin = ["Bebelya9", "Bebelya91", "Bebelya"]; const extra = String(env.USER_PASSWORDS || "").split(/[;,\n]/).map((x) => x.trim()).filter(Boolean); if (env.ADMIN_PASSWORD) builtin.push(String(env.ADMIN_PASSWORD)); return new Set([...builtin, ...extra]); }
function checkAdmin(request, env) { const provided = (request.headers.get("x-admin-password") || "").trim(); if (!provided) return { ok: false, status: 401, body: { ok: false, error: "Не передан пароль" } }; if (!allowedPasswords(env).has(provided)) return { ok: false, status: 401, body: { ok: false, error: "Неверный пароль" } }; return { ok: true }; }
function sbUrl(env) {
  // Cloudflare variable SUPABASE_URL may be pasted either as:
  // https://xxxx.supabase.co OR https://xxxx.supabase.co/rest/v1
  // We always normalize it to the project root, because our requests add /rest/v1 themselves.
  let value = String(env.SUPABASE_URL || "").trim();
  value = value.replace(/\/+$/, "");
  value = value.replace(/\/rest\/v1$/i, "");
  value = value.replace(/\/auth\/v1$/i, "");
  value = value.replace(/\/storage\/v1$/i, "");
  return value;
}
function sbKey(env) { return env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY || ""; }
function checkSupabaseEnv(env) { if (!sbUrl(env)) return "SUPABASE_URL is missing"; if (!sbKey(env)) return "SUPABASE_SECRET_KEY is missing"; return ""; }
async function sbFetch(env, path, options = {}) { const err = checkSupabaseEnv(env); if (err) throw new Error(err); const headers = { "apikey": sbKey(env), "Authorization": "Bearer " + sbKey(env), "Accept": "application/json", ...(options.headers || {}) }; if (options.body !== undefined && !headers["Content-Type"]) headers["Content-Type"] = "application/json"; const res = await fetch(sbUrl(env) + path, { ...options, headers }); const text = await res.text(); const data = text ? parseJson(text) : null; if (!res.ok) { const msg = (data && (data.message || data.error || data.hint || data.details)) || text || `Supabase HTTP ${res.status}`; const e = new Error(msg); e.status = res.status; e.response = data; throw e; } return data; }
function asArr(data) { return Array.isArray(data) ? data : (data ? [data] : []); }
function oldFieldsFrom(meta) { return (meta && typeof meta === "object" && meta.old_fields && typeof meta.old_fields === "object") ? meta.old_fields : {}; }
function mergeOldFields(meta, incoming) { const old = { ...oldFieldsFrom(meta) }; for (const [k,v] of Object.entries(incoming || {})) { if (String(k).startsWith("__")) continue; old[k] = v; } return old; }
function ruDate(value) { const d = String(value || "").slice(0,10); if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return String(value || "").replace(/^(\d{2}\.\d{2})(?:\.\d{4})?.*$/, "$1"); return `${d.slice(8,10)}.${d.slice(5,7)}`; }
function amountString(v) { if (v === null || v === undefined || v === "") return ""; const n = Number(v); return Number.isFinite(n) ? String(n).replace(/\.00$/, "") : String(v); }
function localPartsFromIso(iso) { if (!iso) return { date: "", time: "" }; const d = new Date(iso); if (Number.isNaN(d.getTime())) return { date: String(iso).slice(0,10), time: String(iso).slice(11,16) }; const parts = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Yekaterinburg", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d); const p = Object.fromEntries(parts.map(x => [x.type, x.value])); return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` }; }
function makeStartAt(date, time) { const d = dateOnly(date); const t = timeOnly(time) || "10:00"; return d ? `${d}T${t}:00+05:00` : null; }
function parseAutoServices(value) { if (Array.isArray(value)) return value; if (!value) return []; try { const x = JSON.parse(value); return Array.isArray(x) ? x : []; } catch (_) { return []; } }
function fieldsFromZayavka(row) { const client = row.clients || row.client || {}; const old = { ...oldFieldsFrom(row.meta) }; const fields = { ...old }; fields["Имя клиента"] = fields["Имя клиента"] ?? client.name ?? ""; fields["Телефон"] = fields["Телефон"] ?? client.phone ?? ""; fields["Компания"] = fields["Компания"] ?? row.meta?.company ?? ""; fields["Направление"] = row.direction || fields["Направление"] || "Архитектура"; fields["Статус"] = row.status || fields["Статус"] || "Новая заявка"; fields["Услуга"] = row.service || fields["Услуга"] || ""; fields["Дата записи"] = row.visit_date || fields["Дата записи"] || ""; fields["Время записи"] = String(row.visit_time || fields["Время записи"] || "").slice(0,5); fields["Адрес"] = row.address ?? fields["Адрес"] ?? ""; fields["Итоговый м2"] = fields["Итоговый м2"] ?? amountString(row.total_m2); fields["м2"] = fields["м2"] ?? amountString(row.total_m2); fields["Пленка"] = fields["Пленка"] ?? row.material ?? ""; fields["Плёнка"] = fields["Плёнка"] ?? row.material ?? ""; fields["Авто услуги"] = fields["Авто услуги"] ?? JSON.stringify(row.auto_services || []); fields["Общая стоимость"] = fields["Общая стоимость"] ?? amountString(row.total_amount); fields["Комментарий клиента"] = row.client_comment ?? fields["Комментарий клиента"] ?? ""; fields["Комментарий администратора"] = row.admin_comment ?? fields["Комментарий администратора"] ?? ""; fields["Google Calendar Event ID"] = row.calendar_event_id ?? fields["Google Calendar Event ID"] ?? ""; fields["Cal Booking ID"] = row.external_id ?? fields["Cal Booking ID"] ?? ""; if (row.deleted_at) { fields["Удалено"] = true; fields["Дата удаления"] = fields["Дата удаления"] || row.deleted_at; fields["Причина отмены"] = fields["Причина отмены"] || row.deleted_reason || ""; } return fields; }
function normRecord(row) { return { id: String(row.id), fields: fieldsFromZayavka(row) }; }
async function findClientByPhone(env, phone) { const norm = normalizePhone(phone); if (!norm) return null; const data = await sbFetch(env, `/rest/v1/clients?select=*&phone_norm=eq.${encodeURIComponent(norm)}&deleted_at=is.null&limit=1`); return asArr(data)[0] || null; }
async function upsertClient(env, fields) { const phone = cleanText(fields["Телефон"] || fields.phone || "", 80); const norm = normalizePhone(phone); if (!norm) throw new Error("Телефон клиента обязателен"); const existing = await findClientByPhone(env, phone); const payload = { name: cleanText(fields["Имя клиента"] || fields.name || existing?.name || "Клиент", 180), phone: phone || norm, source: cleanText(fields["Источник"] || existing?.source || "CRM", 120), comment: cleanText(fields["Комментарий клиента"] || existing?.comment || "", 2000), admin_comment: cleanText(fields["Комментарий администратора"] || existing?.admin_comment || "", 2000), deleted_at: null }; if (existing?.id) { const updated = await sbFetch(env, `/rest/v1/clients?id=eq.${encodeURIComponent(existing.id)}&select=*`, { method: "PATCH", headers: { "Prefer": "return=representation" }, body: JSON.stringify(payload) }); return asArr(updated)[0] || existing; } try { const created = await sbFetch(env, `/rest/v1/clients?select=*`, { method: "POST", headers: { "Prefer": "return=representation" }, body: JSON.stringify(payload) }); return asArr(created)[0]; } catch (e) { const again = await findClientByPhone(env, phone); if (again) return again; throw e; } }
function fieldsToZayavkaPayload(fields, oldMeta = {}) { const merged = mergeOldFields(oldMeta, fields); const direction = cleanText(fields["Направление"] || merged["Направление"] || "Архитектура", 80); const date = fields.hasOwnProperty("Дата записи") ? dateOnly(fields["Дата записи"]) : undefined; const time = fields.hasOwnProperty("Время записи") ? timeOnly(fields["Время записи"]) : undefined; const autoServices = fields.hasOwnProperty("Авто услуги") ? parseAutoServices(fields["Авто услуги"]) : undefined; const payload = { meta: { ...(oldMeta || {}), old_fields: merged, company: cleanText(merged["Компания"] || "", 220), responsible: cleanText(merged["Ответственный"] || "", 160), installers: cleanText(merged["Монтажники"] || "", 300), files: merged["Файлы"] || "", history: merged["История изменений"] || "", comments_json: merged["Комментарии"] || "" } }; if (fields.hasOwnProperty("Направление")) payload.direction = direction; if (fields.hasOwnProperty("Статус")) payload.status = cleanText(fields["Статус"] || "Новая заявка", 100); if (fields.hasOwnProperty("Услуга")) { payload.service = cleanText(fields["Услуга"], 500); payload.title = payload.service; } if (date !== undefined) payload.visit_date = date; if (time !== undefined) payload.visit_time = time; if (date !== undefined || time !== undefined) payload.start_at = makeStartAt(date ?? merged["Дата записи"], time ?? merged["Время записи"]); if (fields.hasOwnProperty("Адрес")) payload.address = cleanText(fields["Адрес"], 500); if (fields.hasOwnProperty("Итоговый м2") || fields.hasOwnProperty("м2")) payload.total_m2 = toNumber(fields["Итоговый м2"] ?? fields["м2"]); if (fields.hasOwnProperty("Пленка") || fields.hasOwnProperty("Плёнка")) payload.material = cleanText(fields["Пленка"] ?? fields["Плёнка"], 250); if (autoServices !== undefined) payload.auto_services = autoServices; if (fields.hasOwnProperty("Общая стоимость")) payload.total_amount = toNumber(fields["Общая стоимость"]); if (fields.hasOwnProperty("Комментарий клиента")) payload.client_comment = cleanText(fields["Комментарий клиента"], 5000); if (fields.hasOwnProperty("Комментарий администратора")) payload.admin_comment = cleanText(fields["Комментарий администратора"], 5000); if (fields.hasOwnProperty("Google Calendar Event ID")) payload.calendar_event_id = cleanText(fields["Google Calendar Event ID"], 300); if (fields.hasOwnProperty("Cal Booking ID")) payload.external_id = cleanText(fields["Cal Booking ID"], 300); if (fields.__moveToTrash === true || fields["Удалено"] === true || String(fields["Удалено"]).toLowerCase() === "true") { payload.deleted_at = new Date().toISOString(); payload.deleted_reason = cleanText(fields["Причина отмены"] || "Удалено вручную", 1000); } if (fields["Удалено"] === false || String(fields["Удалено"]).toLowerCase() === "false") { payload.deleted_at = null; payload.deleted_reason = ""; } return payload; }
async function getZayavka(env, id) { const data = await sbFetch(env, `/rest/v1/zayavki?select=*,clients(*)&id=eq.${encodeURIComponent(id)}&limit=1`); return asArr(data)[0] || null; }
async function syncServiceRows(env, zayavkaId, fields) { if (!fields.hasOwnProperty("Авто услуги")) return; const list = parseAutoServices(fields["Авто услуги"]); await sbFetch(env, `/rest/v1/zayavka_services?zayavka_id=eq.${encodeURIComponent(zayavkaId)}`, { method: "DELETE" }); if (!list.length) return; const rowDirection = cleanText(fields["Направление"] || "Авто", 80); const rows = list.map((s, i) => ({ zayavka_id: zayavkaId, direction: rowDirection, service_name: cleanText(s.name || s.service || "Услуга", 300), material: cleanText(s.material || "", 250), amount: toNumber(s.price || s.amount || s.sum), sort_order: i })); await sbFetch(env, `/rest/v1/zayavka_services`, { method: "POST", body: JSON.stringify(rows) }); }
function smsTemplate(type, fields) { const d = ruDate(fields["Дата записи"] || ""); const t = timeOnly(fields["Время записи"] || "") || ""; const dt = d && t ? `${d} в ${t}` : `${d} ${t}`.trim(); if (type === "confirmation") return `СОЛНЦАНЕТ: запись оформлена на ${dt}.`; if (type === "reminder_day") return d && t ? `СОЛНЦАНЕТ: напоминаем о записи ${d} в ${t}.` : `СОЛНЦАНЕТ: напоминаем о записи ${d}.`; if (type === "reminder_2h") return "СОЛНЦАНЕТ: до записи осталось 2 часа."; if (type === "reschedule") return `СОЛНЦАНЕТ: запись перенесена на ${dt}.`; if (type === "review") return "Спасибо, что выбрали СОЛНЦАНЕТ! Оставьте отзыв: https://clck.su/solncanet"; return ""; }
function smsTypeLabel(type) { return { confirmation: "Подтверждение записи", reminder_day: "Напоминание за день", reminder_2h: "Напоминание за 2 часа", reschedule: "Перенос записи", review: "Благодарность + отзыв" }[type] || type; }
function typeFromLabel(label) { const s = String(label || "").toLowerCase(); if (s.includes("день") || s.includes("24")) return "reminder_day"; if (s.includes("2 час") || s.includes("2ч")) return "reminder_2h"; if (s.includes("подтверж") || s.includes("оформ")) return "confirmation"; if (s.includes("перен")) return "reschedule"; if (s.includes("отзыв") || s.includes("благодар")) return "review"; return "custom"; }
async function cancelFutureAutoSms(env, zayavkaId) { if (!zayavkaId) return; await sbFetch(env, `/rest/v1/sms_queue?zayavka_id=eq.${encodeURIComponent(zayavkaId)}&status=eq.queued&sms_type=in.(confirmation,reminder_day,reminder_2h)`, { method: "PATCH", body: JSON.stringify({ status: "cancelled", cancelled_at: new Date().toISOString(), error: "Пересоздано после изменения заявки" }) }); }
async function createSms(env, fields) { const phone = normalizePhone(fields["Телефон"] || ""); const sendAt = makeStartAt(fields["Дата отправки"], fields["Время отправки"]); if (!phone || !sendAt || !fields["Текст SMS"]) return null; const smsType = typeFromLabel(fields["Тип уведомления"]); const row = { zayavka_id: fields.__zayavka_id || null, client_id: fields.__client_id || null, phone, sms_type: smsType, status: statusToDb(fields["Статус"] || "Запланировано"), send_at: sendAt, template_name: smsTypeLabel(smsType), message: cleanText(fields["Текст SMS"], 1000), manual_only: ["reschedule","review","custom"].includes(smsType), meta: { old_fields: Object.fromEntries(Object.entries(fields).filter(([k]) => !String(k).startsWith("__"))) } }; const data = await sbFetch(env, `/rest/v1/sms_queue?select=*`, { method: "POST", headers: { "Prefer": "return=representation" }, body: JSON.stringify(row) }); return asArr(data)[0] || null; }
function statusToDb(status) { const s = String(status || "").toLowerCase(); if (s.includes("отмен")) return "cancelled"; if (s.includes("ошиб")) return "failed"; if (s.includes("отправл")) return "sent"; if (s.includes("отправляется")) return "sending"; return "queued"; }
function statusFromDb(status) { return { queued: "Запланировано", sending: "Отправляется", sent: "Отправлено", failed: "Ошибка", cancelled: "Отменено", skipped: "Пропущено" }[status] || status || "Запланировано"; }
async function scheduleAutoSms(env, row, options = {}) { const includeConfirmation = options.includeConfirmation !== false; const fields = fieldsFromZayavka(row); const phone = normalizePhone(fields["Телефон"] || ""); const date = dateOnly(fields["Дата записи"]); const time = timeOnly(fields["Время записи"]); if (!phone || !date || !time) return []; const start = new Date(makeStartAt(date, time)); if (Number.isNaN(start.getTime())) return []; const now = new Date(); const slots = []; if (includeConfirmation) slots.push({ type: "confirmation", at: new Date(now.getTime() + 60 * 1000) }); const reminderDayAt = new Date(start.getTime() - 24 * 60 * 60 * 1000); if (start.getTime() - now.getTime() > 24 * 60 * 60 * 1000) slots.push({ type: "reminder_day", at: reminderDayAt }); slots.push({ type: "reminder_2h", at: new Date(start.getTime() - 2 * 60 * 60 * 1000) }); const created = []; for (const slot of slots) { if (slot.at <= now) continue; const p = localPartsFromIso(slot.at.toISOString()); const old = { "ID заявки": row.id, "ФИО": fields["Имя клиента"] || "", "Компания": fields["Компания"] || "", "Телефон": phone, "Канал": "sms", "Тип уведомления": smsTypeLabel(slot.type), "Текст SMS": smsTemplate(slot.type, fields), "Дата отправки": p.date, "Время отправки": p.time, "Статус": "Запланировано", "Ошибка": "", "Создано": new Date().toISOString(), __zayavka_id: row.id, __client_id: row.client_id || null }; if (!old["Текст SMS"]) continue; const sms = await createSms(env, old); if (sms) created.push(sms); } return created; }
async function addHistory(env, entityType, entityId, action, actor, comment, oldData, newData) { try { await sbFetch(env, `/rest/v1/history_log`, { method: "POST", body: JSON.stringify({ entity_type: entityType, entity_id: entityId || null, action, actor: actor || "system", comment: comment || "", old_data: oldData || null, new_data: newData || null }) }); } catch (_) {} }

function sigmaBase(env) { return (env.SIGMA_API_URL || "https://user.sigmasms.ru/api").replace(/\/+$/, ""); }
function sigmaToken(env) { return env.SIGMA_API_TOKEN || env.SIGMA_TOKEN || env.SIGMASMS_TOKEN || ""; }
function compactJson(value, max = 3000) { try { return JSON.stringify(value || {}).slice(0, max); } catch (_) { return String(value || "").slice(0, max); } }
function firstSigmaItem(data) { if (Array.isArray(data)) return data[0]; if (Array.isArray(data?.data)) return data.data[0]; if (Array.isArray(data?.items)) return data.items[0]; if (Array.isArray(data?.sendings)) return data.sendings[0]; if (Array.isArray(data?.result)) return data.result[0]; return data; }
function sigmaId(x) { return cleanText(x?.id || x?._id || x?.uuid || x?.sendingId || x?.messageId || x?.groupId || "", 120); }
function sigmaState(x) { const s = x?.state || {}; return { status: cleanText(s.status || x?.status || x?.stateStatus || "", 120), error: cleanText(s.error || x?.error || x?.message || x?.errorMessage || "", 700) }; }
function isSigmaFailed(status, errorText) { return /failed|error|rejected|declined|cancel/i.test(String(status || "")) || Boolean(errorText && errorText !== "false"); }
function sigmaStatusText(status, errorText) { if (errorText && errorText !== "false") return errorText; const s = String(status || "").toLowerCase(); const map = { pending: "В очереди", queued: "В очереди", created: "Создано", processing: "Обрабатывается", sent: "Отправлено", delivered: "Доставлено", failed: "Ошибка", error: "Ошибка", canceled: "Отменено", rejected: "Отклонено" }; return map[s] || status || "Принято SIGMA"; }
function sigmaPrimarySender(env) { return cleanText(env.SIGMA_SENDER || env.SMS_SENDER || env.SIGMASMS_SENDER || "Solncanet", 80); }
function sigmaFallbackSenders(env) {
  const raw = String(env.SIGMA_FALLBACK_SENDERS || env.SMS_FALLBACK_SENDERS || env.SIGMASMS_FALLBACK_SENDERS || "");
  return raw.split(/[;,\n]/).map((x) => cleanText(x, 80)).filter(Boolean);
}
function sigmaSenderCandidates(env) {
  const seen = new Set();
  const out = [];
  for (const sender of [sigmaPrimarySender(env), ...sigmaFallbackSenders(env)]) {
    const key = String(sender || "").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}
function isSenderNotFoundError(text, data) { const all = `${text || ""} ${data?.message || ""} ${data?.error || ""} ${data?.name || ""} ${data?.raw || ""}`.toLowerCase(); return /sender\s+not\s+found|sender_not_found|required.*sender|sender.*required|payload\.sender|отправител[ья][^а-яa-z0-9]*(не\s+найден|обязател)|имя\s+отправител[ья].*(не\s+найден|не\s+подключ|обязател)/i.test(all); }
function buildSigmaRequestBody(phone, message, sender) { return { recipient: "+" + phone, type: "sms", payload: { text: message, sender } }; }

// SIGMA принимает только тексты, совпадающие с утверждёнными шаблонами.
// Перед отправкой принудительно приводим SMS к одному из 5 утверждённых текстов.
function normalizeForSigmaTemplate(value) {
  return cleanText(value, 1000).replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}
function smsKindFromAny(...values) {
  const s = values.map((v) => String(v || "")).join(" ").toLowerCase();
  if (/confirmation|confirm|подтверж|оформлена/.test(s)) return "confirmation";
  if (/reminder_day|за\s*день|напоминаем/.test(s)) return "reminder_day";
  if (/reminder_2h|2\s*час|два\s*час|осталось\s*2/.test(s)) return "reminder_2h";
  if (/reschedule|перен[оё]с|перенесена/.test(s)) return "reschedule";
  if (/review|отзыв|благодар/.test(s)) return "review";
  return "";
}
function partsFromMessageText(message) {
  const text = normalizeForSigmaTemplate(message);
  let m = text.match(/(?:оформлена|перенесена)\s+на\s+(\d{2}\.\d{2}(?:\.\d{4})?)\s+(?:в\s+)?(\d{1,2}:\d{2})/i);
  if (m) return { date: m[1], time: m[2].padStart(5, "0") };
  m = text.match(/о\s+записи\s+(\d{2}\.\d{2}(?:\.\d{4})?)\s*(?:,|в)?\s*(\d{1,2}:\d{2})/i);
  if (m) return { date: m[1], time: m[2].padStart(5, "0") };
  return { date: "", time: "" };
}
function sigmaShortDate(value) { const s = String(value || "").trim(); const m = s.match(/(\d{2})\.(\d{2})(?:\.\d{4})?/); if (m) return `${m[1]}.${m[2]}`; const iso = s.slice(0,10); if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return `${iso.slice(8,10)}.${iso.slice(5,7)}`; return s; }
function approvedTemplateText(kind, date, time) {
  const d = sigmaShortDate(date);
  const t = String(time || "").trim();
  if (kind === "confirmation" && d && t) return `СОЛНЦАНЕТ: запись оформлена на ${d} в ${t}.`;
  if (kind === "reminder_day" && d && t) return `СОЛНЦАНЕТ: напоминаем о записи ${d} в ${t}.`;
  if (kind === "reminder_2h") return "СОЛНЦАНЕТ: до записи осталось 2 часа.";
  if (kind === "reschedule" && d && t) return `СОЛНЦАНЕТ: запись перенесена на ${d} в ${t}.`;
  if (kind === "review") return "Спасибо, что выбрали СОЛНЦАНЕТ! Оставьте отзыв: https://clck.su/solncanet";
  return "";
}
function dateTimeFromOldFields(old) {
  const dateRaw = old?.["Дата записи"] || old?.visit_date || old?.date || "";
  const timeRaw = old?.["Время записи"] || old?.visit_time || old?.time || "";
  const d = ruDate(dateRaw);
  const t = timeOnly(timeRaw);
  return { date: d, time: t };
}
async function dateTimeFromZayavka(env, zayavkaId) {
  if (!zayavkaId) return { date: "", time: "" };
  try {
    const data = await sbFetch(env, `/rest/v1/zayavki?select=visit_date,visit_time,meta&id=eq.${encodeURIComponent(zayavkaId)}&limit=1`);
    const row = asArr(data)[0] || {};
    const old = oldFieldsFrom(row.meta || {});
    const date = ruDate(row.visit_date || old["Дата записи"] || "");
    const time = timeOnly(row.visit_time || old["Время записи"] || "");
    return { date, time };
  } catch (_) {
    return { date: "", time: "" };
  }
}
async function approvedSmsMessageForQueue(env, row) {
  const old = oldFieldsFrom(row.meta || {});
  const raw = normalizeForSigmaTemplate(row.message || old["Текст SMS"] || "");
  const kind = smsKindFromAny(row.sms_type, row.template_name, old["Тип уведомления"], raw);
  if (!kind) return "";
  if (kind === "reminder_2h" || kind === "review") return approvedTemplateText(kind);
  let parts = dateTimeFromOldFields(old);
  if (!parts.date || !parts.time) parts = partsFromMessageText(raw);
  if (!parts.date || !parts.time) parts = await dateTimeFromZayavka(env, row.zayavka_id || old["ID заявки"] || "");
  return normalizeForSigmaTemplate(approvedTemplateText(kind, parts.date, parts.time));
}
function approvedSmsMessageFromBody(body, rawMessage) {
  const raw = normalizeForSigmaTemplate(rawMessage);
  const kind = smsKindFromAny(body?.type, body?.template, body?.["Тип уведомления"], raw);
  if (!kind) return "";
  if (kind === "reminder_2h" || kind === "review") return approvedTemplateText(kind);
  let parts = { date: ruDate(body?.visitDate || body?.recordDate || body?.appointmentDate || body?.["Дата записи"] || ""), time: timeOnly(body?.visitTime || body?.recordTime || body?.appointmentTime || body?.["Время записи"] || "") };
  if (!parts.date || !parts.time) parts = partsFromMessageText(raw);
  return normalizeForSigmaTemplate(approvedTemplateText(kind, parts.date, parts.time));
}

async function postSigmaSms(env, token, requestBody) { const url = new URL(`${sigmaBase(env)}/sendings`); url.searchParams.set("return", "each"); const res = await fetch(url.toString(), { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": token }, body: JSON.stringify(requestBody) }); const raw = await res.text(); let data; try { data = JSON.parse(raw); } catch (_) { data = { raw }; } const item = firstSigmaItem(data); const id = sigmaId(item || data); const state = sigmaState(item || data); const errorText = state.error || data.message || data.error || data.name || data.raw || ""; const ok = res.ok && Boolean(id) && !isSigmaFailed(state.status, errorText); return { ok, provider: "sigma", httpStatus: res.status, smsId: id, id, status: state.status || (ok ? "created" : "error"), statusText: sigmaStatusText(state.status, errorText), cost: item?.cost ?? data.cost ?? "", balance: data.balance ?? "", result: data, error: ok ? "" : (sigmaStatusText(state.status, errorText) || `SIGMA не подтвердила отправку. HTTP ${res.status}`) }; }
async function sendSigmaSms(env, to, message) {
  const token = sigmaToken(env);
  if (!token) return { ok: false, provider: "sigma", error: "Не задан SIGMA_API_TOKEN" };
  const phone = normalizePhone(to);
  if (!phone || phone.length !== 11 || !phone.startsWith("7")) return { ok: false, provider: "sigma", error: "Неверный телефон. Нужен формат 79XXXXXXXXX", to: phone };
  const senders = sigmaSenderCandidates(env);
  if (!senders.length) return { ok: false, provider: "sigma", error: "SIGMA требует payload.sender. По ответу SIGMA используем sender Solncanet. Проверь Cloudflare: SIGMA_SENDER=Solncanet." };
  const attempts = [];
  for (const sender of senders) {
    const res = await postSigmaSms(env, token, buildSigmaRequestBody(phone, message, sender));
    res.senderRequested = sender;
    res.senderMode = attempts.length ? "fallback" : "primary";
    res.outgoingText = message;
    res.templateHelp = "Если ошибка SIGMA: Could not find matching template — отправьте менеджеру SIGMA outgoingText из ответа. Шаблон в ЛК должен быть создан с переменными, а не с буквальным текстом {Дата}/{Время}.";
    if ((res.error || res.statusText || "").toLowerCase().includes("matching template")) {
      res.error = `${res.error || res.statusText}. Точный текст, который ушёл в SIGMA: ${message}`;
    }
    attempts.push({ sender, ok: res.ok, httpStatus: res.httpStatus, error: res.error || res.statusText || "", outgoingText: message });
    if (res.ok) { res.senderAttempts = attempts; return res; }
    if (!isSenderNotFoundError(res.error || res.statusText, res.result)) { res.senderAttempts = attempts; return res; }
  }
  const last = attempts[attempts.length - 1] || {};
  return { ok: false, provider: "sigma", error: `SIGMA не приняла ни одно имя отправителя. Последняя ошибка: ${last.error || "Sender not found"}`, senderAttempts: attempts };
}

async function createSmsLog(env, fields, smsPayload) { try { const sms = await createSms(env, { ...fields, "Статус": smsPayload?.ok ? "Отправлено" : "Ошибка", "ID SIGMA": smsPayload?.smsId || "", "Статус доставки": smsPayload?.statusText || smsPayload?.status || "", "Стоимость SMS": smsPayload?.cost ?? "", "Баланс после отправки": smsPayload?.balance ?? "", "Ответ сервиса": compactJson(smsPayload?.result || smsPayload), "Дата проверки статуса": new Date().toISOString() }); if (sms?.id && smsPayload?.ok) { await sbFetch(env, `/rest/v1/sms_queue?id=eq.${encodeURIComponent(sms.id)}`, { method: "PATCH", body: JSON.stringify({ status: "sent", sent_at: new Date().toISOString(), provider_message_id: smsPayload.smsId || "", meta: { ...(sms.meta || {}), delivery_status: smsPayload.statusText || smsPayload.status || "", service_response: compactJson(smsPayload.result || smsPayload), cost: String(smsPayload.cost ?? ""), balance: String(smsPayload.balance ?? ""), status_checked_at: new Date().toISOString() } }) }); } } catch (_) {} }
function nowYParts() { return localPartsFromIso(new Date().toISOString()); }
async function logDirectSms({ env, body, to, message, smsPayload }) { const now = nowYParts(); const fields = { "ID заявки": cleanText(body.recordId || body.requestId || "TEST-" + Date.now(), 80), "ФИО": cleanText(body.client || body.name || "Тестовая отправка", 160), "Компания": cleanText(body.company || "", 160), "Телефон": normalizePhone(to), "Канал": "sms", "Тип уведомления": cleanText(body.type || "Тестовая / ручная отправка", 120), "Текст SMS": message, "Дата отправки": now.date, "Время отправки": now.time, "Ошибка": smsPayload?.ok ? "" : cleanText(smsPayload?.error || "Ошибка отправки", 700), "Дата фактической отправки": smsPayload?.ok ? new Date().toISOString() : "", "Создано": new Date().toISOString(), __zayavka_id: body.recordId || null }; await createSmsLog(env, fields, smsPayload); }
async function sendTelegram({ env, chatId, message }) { const token = env.TELEGRAM_BOT_TOKEN || ""; if (!token) return json({ ok: false, error: "Не задан TELEGRAM_BOT_TOKEN в Cloudflare" }, 400); const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chatId, text: message, disable_web_page_preview: true }) }); const data = await response.json().catch(() => ({})); return json({ ok: Boolean(data.ok), provider: "telegram", chatId, result: data, error: data.ok ? "" : (data.description || "Telegram не подтвердил отправку") }, 200); }
export async function onRequestPost({ request, env }) { try { const password = request.headers.get("x-admin-password") || ""; if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) return json({ ok: false, error: "Неверный пароль администратора" }, 401); const body = await request.json().catch(() => ({})); const channel = String(body.channel || "sms").toLowerCase(); let message = cleanText(body.message || body.text || ""); const to = normalizePhone(body.to || body.phone || body.chatId || ""); if (!message) return json({ ok: false, error: "Пустой текст уведомления" }, 400); if (channel === "sms") { if (!to) return json({ ok: false, error: "Не указан номер телефона клиента" }, 400); const approved = approvedSmsMessageFromBody(body, message); if (!approved) return json({ ok: false, provider: "sigma", error: "Текст SMS не совпадает с утверждёнными шаблонами SIGMA. Используйте только: подтверждение, напоминание за день, напоминание за 2 часа, перенос, отзыв." }, 400); message = approved; const smsPayload = await sendSigmaSms(env, to, message); if (!body.skipSmsLog && !body.queueId) await logDirectSms({ env, body, to, message, smsPayload }); return json(smsPayload, 200); } if (channel === "telegram" || channel === "admin_telegram") { const chatId = to || env.TELEGRAM_ADMIN_CHAT_ID || ""; if (!chatId) return json({ ok: false, error: "Не указан TELEGRAM_ADMIN_CHAT_ID" }, 400); return await sendTelegram({ env, chatId, message }); } return json({ ok: false, error: "Неизвестный канал уведомлений: " + channel }, 400); } catch (error) { return json({ ok: false, error: error.message || String(error) }, 500); } }
export async function onRequestGet({ request, env }) { const password = request.headers.get("x-admin-password") || ""; if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) return json({ ok: false, error: "Неверный пароль администратора" }, 401); return json({ ok: true, sms: Boolean(sigmaToken(env)), telegram: Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_ADMIN_CHAT_ID), provider: "sigma", database: Boolean(sbUrl(env) && sbKey(env)), apiBase: sigmaBase(env), sender: sigmaPrimarySender(env), fallbackSenders: sigmaFallbackSenders(env), testMode: false }); }
export async function onRequest(context) { if (context.request.method === "GET") return onRequestGet({ request: context.request, env: context.env }); if (context.request.method === "POST") return onRequestPost({ request: context.request, env: context.env }); return json({ ok: false, error: "Only GET/POST" }, 405); }
