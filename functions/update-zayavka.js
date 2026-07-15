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
function fieldsFromZayavka(row) { const client = row.clients || row.client || {}; const old = { ...oldFieldsFrom(row.meta) }; const fields = { ...old }; fields["Имя клиента"] = fields["Имя клиента"] ?? client.name ?? ""; fields["Телефон"] = fields["Телефон"] ?? client.phone ?? ""; fields["Компания"] = fields["Компания"] ?? row.meta?.company ?? ""; fields["Направление"] = row.direction || fields["Направление"] || "Архитектура"; fields["Статус"] = row.status || fields["Статус"] || "Новая заявка"; fields["Услуга"] = row.service || fields["Услуга"] || ""; fields["Дата записи"] = row.visit_date || fields["Дата записи"] || ""; fields["Время записи"] = String(row.visit_time || fields["Время записи"] || "").slice(0,5); fields["Адрес"] = row.address ?? fields["Адрес"] ?? ""; fields["Итоговый м2"] = fields["Итоговый м2"] ?? amountString(row.total_m2); fields["м2"] = fields["м2"] ?? amountString(row.total_m2); fields["Пленка"] = fields["Пленка"] ?? row.material ?? ""; fields["Плёнка"] = fields["Плёнка"] ?? row.material ?? ""; fields["Авто услуги"] = fields["Авто услуги"] ?? JSON.stringify(row.auto_services || []); fields["Общая стоимость"] = fields["Общая стоимость"] ?? amountString(row.total_amount); fields["Комментарий клиента"] = row.client_comment ?? fields["Комментарий клиента"] ?? ""; fields["Комментарий администратора"] = row.admin_comment ?? fields["Комментарий администратора"] ?? ""; fields["Google Calendar Event ID"] = row.calendar_event_id ?? fields["Google Calendar Event ID"] ?? ""; fields["Cal Booking ID"] = row.external_id ?? fields["Cal Booking ID"] ?? ""; if (row.deleted_at) { fields["Удалено"] = true; fields["Дата удаления"] = fields["Дата удаления"] || row.deleted_at; fields["Причина отмены"] = fields["Причина отмены"] || row.deleted_reason || ""; } return fields; }
function normRecord(row) { return { id: String(row.id), fields: fieldsFromZayavka(row) }; }
async function findClientByPhone(env, phone) { const norm = normalizePhone(phone); if (!norm) return null; const data = await sbFetch(env, `/rest/v1/clients?select=*&phone_norm=eq.${encodeURIComponent(norm)}&deleted_at=is.null&limit=1`); return asArr(data)[0] || null; }
async function upsertClient(env, fields) { const phone = cleanText(fields["Телефон"] || fields.phone || "", 80); const norm = normalizePhone(phone); if (!norm) throw new Error("Телефон клиента обязателен"); const existing = await findClientByPhone(env, phone); const payload = { name: cleanText(fields["Имя клиента"] || fields.name || existing?.name || "Клиент", 180), phone: phone || norm, source: cleanText(fields["Источник"] || existing?.source || "CRM", 120), comment: cleanText(fields["Комментарий клиента"] || existing?.comment || "", 2000), admin_comment: cleanText(fields["Комментарий администратора"] || existing?.admin_comment || "", 2000), deleted_at: null }; if (existing?.id) { const updated = await sbFetch(env, `/rest/v1/clients?id=eq.${encodeURIComponent(existing.id)}&select=*`, { method: "PATCH", headers: { "Prefer": "return=representation" }, body: JSON.stringify(payload) }); return asArr(updated)[0] || existing; } try { const created = await sbFetch(env, `/rest/v1/clients?select=*`, { method: "POST", headers: { "Prefer": "return=representation" }, body: JSON.stringify(payload) }); return asArr(created)[0]; } catch (e) { const again = await findClientByPhone(env, phone); if (again) return again; throw e; } }
function fieldsToZayavkaPayload(fields, oldMeta = {}) { const merged = mergeOldFields(oldMeta, fields); const direction = cleanText(fields["Направление"] || merged["Направление"] || "Архитектура", 80); const date = fields.hasOwnProperty("Дата записи") ? dateOnly(fields["Дата записи"]) : undefined; const time = fields.hasOwnProperty("Время записи") ? timeOnly(fields["Время записи"]) : undefined; const autoServices = fields.hasOwnProperty("Авто услуги") ? parseAutoServices(fields["Авто услуги"]) : undefined; const payload = { meta: { ...(oldMeta || {}), old_fields: merged, company: cleanText(merged["Компания"] || "", 220), responsible: cleanText(merged["Ответственный"] || "", 160), installers: cleanText(merged["Монтажники"] || "", 300), files: merged["Файлы"] || "", history: merged["История изменений"] || "", comments_json: merged["Комментарии"] || "" } }; if (fields.hasOwnProperty("Направление")) payload.direction = direction; if (fields.hasOwnProperty("Статус")) payload.status = cleanText(fields["Статус"] || "Новая заявка", 100); if (fields.hasOwnProperty("Услуга")) { payload.service = cleanText(fields["Услуга"], 500); payload.title = payload.service; } if (date !== undefined) payload.visit_date = date; if (time !== undefined) payload.visit_time = time; if (date !== undefined || time !== undefined) payload.start_at = makeStartAt(date ?? merged["Дата записи"], time ?? merged["Время записи"]); if (fields.hasOwnProperty("Адрес")) payload.address = cleanText(fields["Адрес"], 500); if (fields.hasOwnProperty("Итоговый м2") || fields.hasOwnProperty("м2")) payload.total_m2 = toNumber(fields["Итоговый м2"] ?? fields["м2"]); if (fields.hasOwnProperty("Пленка") || fields.hasOwnProperty("Плёнка")) payload.material = cleanText(fields["Пленка"] ?? fields["Плёнка"], 250); if (autoServices !== undefined) payload.auto_services = autoServices; if (fields.hasOwnProperty("Общая стоимость")) payload.total_amount = toNumber(fields["Общая стоимость"]); if (fields.hasOwnProperty("Комментарий клиента")) payload.client_comment = cleanText(fields["Комментарий клиента"], 5000); if (fields.hasOwnProperty("Комментарий администратора")) payload.admin_comment = cleanText(fields["Комментарий администратора"], 5000); if (fields.hasOwnProperty("Google Calendar Event ID")) payload.calendar_event_id = cleanText(fields["Google Calendar Event ID"], 300); if (fields.hasOwnProperty("Cal Booking ID")) payload.external_id = cleanText(fields["Cal Booking ID"], 300); if (fields.__moveToTrash === true || fields["Удалено"] === true || String(fields["Удалено"]).toLowerCase() === "true") { payload.deleted_at = new Date().toISOString(); payload.deleted_reason = cleanText(fields["Причина отмены"] || "Удалено вручную", 1000); } if (fields["Удалено"] === false || String(fields["Удалено"]).toLowerCase() === "false") { payload.deleted_at = null; payload.deleted_reason = ""; } return payload; }
async function getZayavka(env, id) { const data = await sbFetch(env, `/rest/v1/zayavki?select=*,clients(*)&id=eq.${encodeURIComponent(id)}&limit=1`); return asArr(data)[0] || null; }
async function syncServiceRows(env, zayavkaId, fields) { if (!fields.hasOwnProperty("Авто услуги")) return; const list = parseAutoServices(fields["Авто услуги"]); await sbFetch(env, `/rest/v1/zayavka_services?zayavka_id=eq.${encodeURIComponent(zayavkaId)}`, { method: "DELETE" }); if (!list.length) return; const rows = list.map((s, i) => ({ zayavka_id: zayavkaId, direction: "Авто", service_name: cleanText(s.name || s.service || "Услуга", 300), material: cleanText(s.material || "", 250), amount: toNumber(s.price || s.amount || s.sum), sort_order: i })); await sbFetch(env, `/rest/v1/zayavka_services`, { method: "POST", body: JSON.stringify(rows) }); }
function smsTemplate(type, fields) { const d = ruDate(fields["Дата записи"] || ""); const t = timeOnly(fields["Время записи"] || "") || ""; const dt = `${d} ${t}`.trim(); if (type === "confirmation") return `СОЛНЦАНЕТ: запись оформлена на ${dt}.`; if (type === "reminder_day") return `СОЛНЦАНЕТ: напоминаем о записи ${d}, ${t}.`.replace(/,\s*\./, "."); if (type === "reminder_2h") return "СОЛНЦАНЕТ: до записи осталось 2 часа."; if (type === "reschedule") return `СОЛНЦАНЕТ: запись перенесена на ${dt}.`; if (type === "review") return "Спасибо, что выбрали СОЛНЦАНЕТ! Оставьте отзыв: https://clck.su/solncanet"; return ""; }
function smsTypeLabel(type) { return { confirmation: "Подтверждение записи", reminder_day: "Напоминание за день", reminder_2h: "Напоминание за 2 часа", reschedule: "Перенос записи", review: "Благодарность + отзыв" }[type] || type; }
function typeFromLabel(label) { const s = String(label || "").toLowerCase(); if (s.includes("день") || s.includes("24")) return "reminder_day"; if (s.includes("2 час") || s.includes("2ч")) return "reminder_2h"; if (s.includes("подтверж") || s.includes("оформ")) return "confirmation"; if (s.includes("перен")) return "reschedule"; if (s.includes("отзыв") || s.includes("благодар")) return "review"; return "custom"; }
async function cancelFutureAutoSms(env, zayavkaId) { if (!zayavkaId) return; await sbFetch(env, `/rest/v1/sms_queue?zayavka_id=eq.${encodeURIComponent(zayavkaId)}&status=eq.queued&sms_type=in.(confirmation,reminder_day,reminder_2h)`, { method: "PATCH", body: JSON.stringify({ status: "cancelled", cancelled_at: new Date().toISOString(), error: "Пересоздано после изменения заявки" }) }); }
async function createSms(env, fields) { const phone = normalizePhone(fields["Телефон"] || ""); const sendAt = makeStartAt(fields["Дата отправки"], fields["Время отправки"]); if (!phone || !sendAt || !fields["Текст SMS"]) return null; const smsType = typeFromLabel(fields["Тип уведомления"]); const row = { zayavka_id: fields.__zayavka_id || null, client_id: fields.__client_id || null, phone, sms_type: smsType, status: statusToDb(fields["Статус"] || "Запланировано"), send_at: sendAt, template_name: smsTypeLabel(smsType), message: cleanText(fields["Текст SMS"], 1000), manual_only: ["reschedule","review","custom"].includes(smsType), meta: { old_fields: Object.fromEntries(Object.entries(fields).filter(([k]) => !String(k).startsWith("__"))) } }; const data = await sbFetch(env, `/rest/v1/sms_queue?select=*`, { method: "POST", headers: { "Prefer": "return=representation" }, body: JSON.stringify(row) }); return asArr(data)[0] || null; }
function statusToDb(status) { const s = String(status || "").toLowerCase(); if (s.includes("отмен")) return "cancelled"; if (s.includes("ошиб")) return "failed"; if (s.includes("отправл")) return "sent"; if (s.includes("отправляется")) return "sending"; return "queued"; }
function statusFromDb(status) { return { queued: "Запланировано", sending: "Отправляется", sent: "Отправлено", failed: "Ошибка", cancelled: "Отменено", skipped: "Пропущено" }[status] || status || "Запланировано"; }
async function scheduleAutoSms(env, row, options = {}) { const includeConfirmation = options.includeConfirmation !== false; const fields = fieldsFromZayavka(row); const phone = normalizePhone(fields["Телефон"] || ""); const date = dateOnly(fields["Дата записи"]); const time = timeOnly(fields["Время записи"]); if (!phone || !date || !time) return []; const start = new Date(makeStartAt(date, time)); if (Number.isNaN(start.getTime())) return []; const now = new Date(); const slots = []; if (includeConfirmation) slots.push({ type: "confirmation", at: new Date(now.getTime() + 60 * 1000) }); const reminderDayAt = new Date(start.getTime() - 24 * 60 * 60 * 1000); if (start.getTime() - now.getTime() > 24 * 60 * 60 * 1000) slots.push({ type: "reminder_day", at: reminderDayAt }); slots.push({ type: "reminder_2h", at: new Date(start.getTime() - 2 * 60 * 60 * 1000) }); const created = []; for (const slot of slots) { if (slot.at <= now) continue; const p = localPartsFromIso(slot.at.toISOString()); const old = { "ID заявки": row.id, "ФИО": fields["Имя клиента"] || "", "Компания": fields["Компания"] || "", "Телефон": phone, "Канал": "sms", "Тип уведомления": smsTypeLabel(slot.type), "Текст SMS": smsTemplate(slot.type, fields), "Дата отправки": p.date, "Время отправки": p.time, "Статус": "Запланировано", "Ошибка": "", "Создано": new Date().toISOString(), __zayavka_id: row.id, __client_id: row.client_id || null }; if (!old["Текст SMS"]) continue; const sms = await createSms(env, old); if (sms) created.push(sms); } return created; }
async function addHistory(env, entityType, entityId, action, actor, comment, oldData, newData) { try { await sbFetch(env, `/rest/v1/history_log`, { method: "POST", body: JSON.stringify({ entity_type: entityType, entity_id: entityId || null, action, actor: actor || "system", comment: comment || "", old_data: oldData || null, new_data: newData || null }) }); } catch (_) {} }


function endpointFromEnv(env) { return env.GOOGLE_CALENDAR_SYNC_URL || env.GOOGLE_CALENDAR_EXPORT_URL || env.GOOGLE_CALENDAR_IMPORT_URL || ""; }
function tokenFromEnv(env) { return env.GOOGLE_CALENDAR_SYNC_TOKEN || env.GOOGLE_CALENDAR_EXPORT_TOKEN || env.GOOGLE_CALENDAR_IMPORT_TOKEN || ""; }
function shouldSyncGoogleCalendar(oldFields, newFields, requested, fresh) {
  if (requested && requested.__skipGoogleCalendarSync) return false;
  if (fresh && fresh.deleted_at) return false;
  const eventId = String(newFields["Google Calendar Event ID"] || oldFields["Google Calendar Event ID"] || "").trim();
  if (!eventId) return false;
  const keys = [
    "Дата записи", "Время записи", "Услуга", "Адрес", "Имя клиента", "Телефон", "Компания",
    "Комментарий клиента", "Комментарий администратора", "м2", "Итоговый м2", "Направление",
    "Авто", "Пленка", "Плёнка", "Авто услуги", "Общая стоимость", "Монтажники", "Ответственный", "Файлы"
  ];
  return keys.some((k) => Object.prototype.hasOwnProperty.call(requested || {}, k) && String(oldFields[k] || "") !== String(newFields[k] || ""));
}
async function callGoogleCalendarAppsScript(env, payload) {
  const endpoint = endpointFromEnv(env);
  const token = tokenFromEnv(env);
  if (!endpoint) return { ok: false, skipped: true, error: "GOOGLE_CALENDAR_IMPORT_URL / GOOGLE_CALENDAR_SYNC_URL не задан в Cloudflare Pages" };
  if (!token) return { ok: false, skipped: true, error: "GOOGLE_CALENDAR_IMPORT_TOKEN / GOOGLE_CALENDAR_SYNC_TOKEN не задан в Cloudflare Pages" };
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ ...payload, token })
  });
  const text = await response.text();
  const data = text ? parseJson(text) : null;
  if (!data || typeof data !== "object") return { ok: false, status: response.status, error: "Apps Script вернул не JSON", responsePreview: String(text || "").slice(0, 800) };
  if (!response.ok || data.ok === false) return { ok: false, status: response.status, error: data.error || data.message || "Ошибка Apps Script", appsScript: data };
  return { ok: true, status: response.status, ...data };
}
async function syncGoogleCalendarAfterUpdate(env, row, oldFields, requested) {
  const newFields = fieldsFromZayavka(row);
  if (!shouldSyncGoogleCalendar(oldFields, newFields, requested, row)) return { ok: true, skipped: true };
  if (!newFields["Дата записи"] || !newFields["Время записи"]) return { ok: false, skipped: true, error: "Для Google Календаря нужны дата и время записи" };
  const eventId = String(newFields["Google Calendar Event ID"] || oldFields["Google Calendar Event ID"] || "").trim();
  const result = await callGoogleCalendarAppsScript(env, {
    action: "upsert",
    eventId,
    recordId: row.id,
    source: "update-zayavka",
    fields: enrichCalendarFields(newFields)
  });
  if (!result.ok) return result;

  const returnedEventId = result.eventId || eventId;
  const returnedLink = result.htmlLink || newFields["Ссылка на событие"] || "";
  const mergedOldFields = {
    ...oldFieldsFrom(row.meta),
    ...newFields,
    "Google Calendar Event ID": returnedEventId,
    "Ссылка на событие": returnedLink,
    "Источник": "Заявка → автоматически обновлено в Google Календаре"
  };
  const meta = {
    ...(row.meta || {}),
    old_fields: mergedOldFields,
    company: cleanText(mergedOldFields["Компания"] || "", 220),
    responsible: cleanText(mergedOldFields["Ответственный"] || "", 160),
    installers: cleanText(mergedOldFields["Монтажники"] || "", 300),
    files: mergedOldFields["Файлы"] || "",
    history: mergedOldFields["История изменений"] || "",
    comments_json: mergedOldFields["Комментарии"] || ""
  };
  try {
    await sbFetch(env, `/rest/v1/zayavki?id=eq.${encodeURIComponent(row.id)}`, {
      method: "PATCH",
      body: JSON.stringify({ calendar_event_id: returnedEventId, meta })
    });
  } catch (e) {
    return { ok: false, error: "Google Календарь обновился, но ID/ссылка не записались в Supabase: " + e.message, calendarResult: result };
  }
  return { ok: true, updated: true, eventId: returnedEventId, htmlLink: returnedLink, appsScript: result };
}

function shouldRescheduleAutoSms(oldFields, newFields) { const keys = ["Дата записи", "Время записи", "Телефон", "Услуга"]; return keys.some((k) => Object.prototype.hasOwnProperty.call(newFields, k) && String(oldFields[k] || "") !== String(newFields[k] || "")); }
export async function onRequestPost(context) {
  const { request, env } = context;
  const auth = checkAdmin(request, env); if (!auth.ok) return json(auth.body, auth.status);
  let body; try { body = await request.json(); } catch (_) { return json({ ok: false, error: "Invalid JSON" }, 400); }
  if (!body.id) return json({ ok: false, error: "Record id is required" }, 400);
  const requested = body.fields || {};
  if (!Object.keys(requested).length) return json({ ok: false, error: "Нет данных для сохранения" }, 400);
  try {
    const existing = await getZayavka(env, body.id);
    if (!existing) return json({ ok: false, error: "Заявка не найдена в Supabase" }, 404);
    const oldFields = fieldsFromZayavka(existing);
    const clientFields = { ...oldFields, ...requested };
    let client = existing.clients || null;
    if (requested["Телефон"] || requested["Имя клиента"] || requested["Комментарий клиента"] || !existing.client_id) client = await upsertClient(env, clientFields);
    const payload = fieldsToZayavkaPayload(requested, existing.meta || {});
    if (client?.id) payload.client_id = client.id;
    const updated = await sbFetch(env, `/rest/v1/zayavki?id=eq.${encodeURIComponent(body.id)}&select=*`, { method: "PATCH", headers: { "Prefer": "return=representation" }, body: JSON.stringify(payload) });
    await syncServiceRows(env, body.id, requested);
    let fresh = await getZayavka(env, body.id) || asArr(updated)[0];
    if (shouldRescheduleAutoSms(oldFields, { ...oldFields, ...requested }) && !fresh.deleted_at) { await cancelFutureAutoSms(env, body.id); await scheduleAutoSms(env, fresh, { includeConfirmation: false }); fresh = await getZayavka(env, body.id) || fresh; }
    if (fresh.deleted_at) await cancelFutureAutoSms(env, body.id);
    const calendarSync = await syncGoogleCalendarAfterUpdate(env, fresh, oldFields, requested);
    if (calendarSync?.updated) fresh = await getZayavka(env, body.id) || fresh;
    await addHistory(env, "zayavka", body.id, fresh.deleted_at ? "deleted_or_updated" : "updated", request.headers.get("x-admin-password") || "admin", "Изменение заявки", oldFields, fieldsFromZayavka(fresh));
    const savedFields = Object.fromEntries(Object.entries(requested).filter(([k]) => !String(k).startsWith("__")));
    return json({ ok: true, provider: "supabase", savedFields, record: normRecord(fresh), nocodbResponse: { id: body.id, fields: fieldsFromZayavka(fresh) }, verified: true, message: calendarSync?.updated ? "Сохранено в Supabase и Google Календарь обновлён" : "Сохранено в Supabase", calendarSync });
  } catch (error) { return json({ ok: false, provider: "supabase", error: error.message, status: error.status || 500, supabaseResponse: error.response || null, lastError: error.message }, error.status || 500); }
}
export async function onRequest(context) { if (context.request.method !== "POST") return json({ ok: false, error: "Only POST" }, 405); return onRequestPost(context); }
