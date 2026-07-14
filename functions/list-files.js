function json(body, status = 200) { return new Response(JSON.stringify(body, null, 2), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } }); }
export async function onRequestGet() {
  return json({ ok: true, storage: "Google Drive", note: "В v13 список файлов строится из поля 'Файлы' в заявках NocoDB. Отдельное R2-хранилище не используется.", files: [] });
}
export async function onRequest(context) {
  if (context.request.method !== "GET") return json({ ok: false, error: "Only GET" }, 405);
  return onRequestGet(context);
}
