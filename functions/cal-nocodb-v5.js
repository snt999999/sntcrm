const DEFAULT_NOCODB_ENDPOINT = "https://app.nocodb.com/api/v3/data/ptvxn8nmuwc08y3/mgp2zjsuv4id5tp/records";
function json(body, status = 200) { return new Response(JSON.stringify(body, null, 2), { status, headers: { "Content-Type": "application/json; charset=utf-8" } }); }
function parseJson(t) { try { return JSON.parse(t); } catch (_) { return t; } }
function clean(v, max = 1000) { return String(v || "").replace(/[<>]/g, "").trim().slice(0, max); }
function get(obj, paths) { for (const path of paths) { const val = path.split(".").reduce((a, k) => a && a[k], obj); if (val !== undefined && val !== null && val !== "") return val; } return ""; }
function responseValue(data, keys) { const responses = data.responses || data.bookingFieldsResponses || data.metadata || {}; for (const key of keys) { const item = responses[key]; if (item && typeof item === "object" && "value" in item) return item.value; if (item) return item; } return ""; }
function datePart(value) { if (!value) return ""; const d = new Date(value); if (Number.isNaN(d.getTime())) return clean(value).slice(0, 10); return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yekaterinburg", year: "numeric", month: "2-digit", day: "2-digit" }).format(d); }
function timePart(value) { if (!value) return ""; const d = new Date(value); if (Number.isNaN(d.getTime())) return ""; return new Intl.DateTimeFormat("ru-RU", { timeZone: "Asia/Yekaterinburg", hour: "2-digit", minute: "2-digit", hour12: false }).format(d); }
async function listRecords(env) { const url = new URL(env.NOCODB_ENDPOINT || DEFAULT_NOCODB_ENDPOINT); url.searchParams.set("limit", "2000"); const res = await fetch(url, { headers: { "xc-token": env.NOCODB_TOKEN } }); const text = await res.text(); const data = parseJson(text); if (!res.ok) throw new Error("NocoDB list error: " + JSON.stringify(data)); const raw = Array.isArray(data) ? data : (data.records || data.list || []); return raw.map(rec => ({ id: String(rec.id || (rec.id_fields && (rec.id_fields.Id || rec.id_fields.id)) || (rec.fields || rec).Id || ""), fields: rec.fields || rec })); }
async function saveRecord(env, fields, existingId = null) { const method = existingId ? "PATCH" : "POST"; const payload = existingId ? [{ id: Number(existingId) || existingId, fields }] : [{ fields }]; const res = await fetch(env.NOCODB_ENDPOINT || DEFAULT_NOCODB_ENDPOINT, { method, headers: { "Content-Type": "application/json", "xc-token": env.NOCODB_TOKEN }, body: JSON.stringify(payload) }); const text = await res.text(); const data = parseJson(text); if (!res.ok) throw new Error("NocoDB save error: " + JSON.stringify(data)); return data; }
function fieldsFromCal(payload) {
  const data = payload.data || payload.payload || payload;
  const start = get(data, ["startTime", "start", "start_time", "booking.startTime"]);
  const id = clean(get(data, ["id", "uid", "bookingId", "bookingUid"]) || payload.id || (start + "-" + Date.now()), 180);
  const attendee = (data.attendees && data.attendees[0]) || data.attendee || {};
  const name = clean(responseValue(data, ["name", "ФИО", "Имя", "Имя клиента"]) || attendee.name || data.name || data.title || "Клиент Cal.com", 160);
  const phone = clean(responseValue(data, ["phone", "Телефон", "tel", "mobile"]) || attendee.phoneNumber || attendee.phone || "", 80);
  const service = clean(responseValue(data, ["service", "Услуга", "task"]) || data.eventType?.title || data.eventTitle || data.title || "Запись Cal.com", 220);
  const address = clean(responseValue(data, ["address", "Адрес", "location"]) || data.location || "", 300);
  const comment = clean(responseValue(data, ["comment", "Комментарий", "notes", "objectInfo"]) || data.description || "", 1000);
  return {
    "Имя клиента": name,
    "Телефон": phone,
    "Услуга": service,
    "Дата записи": datePart(start),
    "Время записи": timePart(start),
    "Адрес": address,
    "м2": "",
    "Комментарий клиента": [comment, "Источник: Cal.com"].filter(Boolean).join("\n"),
    "Статус": "Новая заявка",
    "Cal Booking ID": "cal-" + id
  };
}
export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === "GET") return json({ ok: true, message: "Cal.com webhook endpoint работает", method: "POST" });
  if (request.method !== "POST") return json({ ok: false, error: "Only POST" }, 405);
  if (!env.NOCODB_TOKEN) return json({ ok: false, error: "NOCODB_TOKEN is missing" }, 500);
  if (env.CAL_WEBHOOK_SECRET) {
    const token = request.headers.get("x-cal-secret") || request.headers.get("x-webhook-secret") || new URL(request.url).searchParams.get("secret");
    if (token !== env.CAL_WEBHOOK_SECRET) return json({ ok: false, error: "Webhook secret mismatch" }, 401);
  }
  let payload; try { payload = await request.json(); } catch (_) { return json({ ok: false, error: "Invalid JSON" }, 400); }
  try {
    const fields = fieldsFromCal(payload);
    const existing = (await listRecords(env)).find(r => String((r.fields || {})["Cal Booking ID"] || "") === fields["Cal Booking ID"]);
    const response = await saveRecord(env, fields, existing && existing.id);
    return json({ ok: true, action: existing ? "updated" : "created", fields, nocodbResponse: response });
  } catch (error) { return json({ ok: false, error: error.message }, 500); }
}
