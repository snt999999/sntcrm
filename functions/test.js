export async function onRequest() {
  return new Response(JSON.stringify({ ok: true, message: "Cloudflare Pages Functions работают", version: "solncanet-site-v7" }, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
