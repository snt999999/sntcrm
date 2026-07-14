// Отдельный Cloudflare Worker для автоматической проверки SMS-очереди.
// Cron Trigger: */5 * * * *
// Переменные Worker:
// PAGES_SMS_CRON_URL=https://ВАШ_ДОМЕН/sms-cron
// SMS_CRON_SECRET=секрет из Cloudflare
export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(run(env));
  },
  async fetch(request, env) {
    const result = await run(env);
    return new Response(JSON.stringify(result, null, 2), { headers: { "Content-Type": "application/json; charset=utf-8" } });
  }
};
async function run(env) {
  const url = env.PAGES_SMS_CRON_URL;
  const secret = env.SMS_CRON_SECRET || "";
  if (!url) return { ok: false, error: "Не задан PAGES_SMS_CRON_URL" };
  const response = await fetch(url, { method: "POST", headers: { "x-cron-secret": secret } });
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch (_) { data = { raw: text }; }
  return { ok: response.ok, status: response.status, result: data };
}
