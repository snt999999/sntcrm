// Отдельный Cloudflare Worker для автоматической проверки SMS-очереди.
// Cron Trigger: */5 * * * *
// Переменные Worker:
// PAGES_SMS_CRON_URL=https://ВАШ_ДОМЕН/sms-cron
// SMS_CRON_SECRET=тот же секрет, что в Pages/Cloudflare
export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(run(env, "scheduled"));
  },
  async fetch(request, env) {
    const result = await run(env, "manual-worker-fetch");
    return new Response(JSON.stringify(result, null, 2), {
      status: result.ok ? 200 : 500,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
    });
  }
};

async function run(env, source) {
  const url = String(env.PAGES_SMS_CRON_URL || "").trim();
  const secret = String(env.SMS_CRON_SECRET || "").trim();
  if (!url) return { ok: false, source, error: "Не задан PAGES_SMS_CRON_URL" };
  if (!secret) return { ok: false, source, error: "Не задан SMS_CRON_SECRET" };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "x-cron-secret": secret,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    },
    body: JSON.stringify({ source, at: new Date().toISOString() })
  });
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch (_) { data = { raw: text }; }
  return { ok: response.ok && Boolean(data.ok), source, status: response.status, ranAt: new Date().toISOString(), result: data };
}
