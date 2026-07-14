const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
function json(body, status = 200) { return new Response(JSON.stringify(body, null, 2), { status, headers: JSON_HEADERS }); }
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
export async function onRequest({ env }) { return json({ ok: true, message: "Cloudflare Pages Functions работают", version: "solncanet-v61-supabase-ready", supabaseUrl: Boolean(sbUrl(env)), supabaseKey: Boolean(sbKey(env)), database: "Supabase" }); }
