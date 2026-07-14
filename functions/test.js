const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
function json(body, status = 200) { return new Response(JSON.stringify(body, null, 2), { status, headers: JSON_HEADERS }); }
function sbUrl(env) { return String(env.SUPABASE_URL || "").replace(/\/+$/, ""); }
function sbKey(env) { return env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY || ""; }
export async function onRequest({ env }) { return json({ ok: true, message: "Cloudflare Pages Functions работают", version: "solncanet-v61-supabase-ready", supabaseUrl: Boolean(sbUrl(env)), supabaseKey: Boolean(sbKey(env)), database: "Supabase" }); }
