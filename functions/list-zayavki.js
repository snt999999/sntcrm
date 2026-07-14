const DEFAULT_NOCODB_ENDPOINT = "https://app.nocodb.com/api/v3/data/ptvxn8nmuwc08y3/mgp2zjsuv4id5tp/records";
function json(body, status = 200) { return new Response(JSON.stringify(body, null, 2), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } }); }
function parseJson(t) { try { return JSON.parse(t); } catch (_) { return t; } }
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
function normRecord(rec) { const fields = rec.fields || rec; const id = rec.id || (rec.id_fields && (rec.id_fields.Id || rec.id_fields.id)) || fields.Id || fields.id || ""; return { id: String(id), fields }; }
export async function onRequestGet(context) {
  const { request, env } = context;
  const auth = checkAdmin(request, env); if (!auth.ok) return json(auth.body, auth.status);
  if (!env.NOCODB_TOKEN) return json({ ok: false, error: "NOCODB_TOKEN is missing" }, 500);
  try {
    const url = new URL(env.NOCODB_ENDPOINT || DEFAULT_NOCODB_ENDPOINT);
    url.searchParams.set("limit", request.url.includes("limit=") ? new URL(request.url).searchParams.get("limit") : "2000");
    const res = await fetch(url.toString(), { headers: { "xc-token": env.NOCODB_TOKEN } });
    const text = await res.text(); const data = parseJson(text);
    if (!res.ok) return json({ ok: false, error: "NocoDB list error", status: res.status, nocodbResponse: data }, 500);
    const raw = Array.isArray(data) ? data : (data.records || data.list || []);
    return json({ ok: true, records: raw.map(normRecord) });
  } catch (error) { return json({ ok: false, error: error.message }, 500); }
}
export async function onRequest(context) { if (context.request.method !== "GET") return json({ ok: false, error: "Only GET" }, 405); return onRequestGet(context); }
