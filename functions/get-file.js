function json(body, status = 200) { return new Response(JSON.stringify(body, null, 2), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } }); }
export async function onRequestGet() {
  return json({ ok: true, storage: "Google Drive", note: "В v13 файлы открываются напрямую по ссылке Google Drive из карточки заявки." });
}
export async function onRequest(context) {
  if (context.request.method !== "GET") return json({ ok: false, error: "Only GET" }, 405);
  return onRequestGet(context);
}
