const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
function json(body, status = 200) { return new Response(JSON.stringify(body, null, 2), { status, headers: JSON_HEADERS }); }
function sigmaBase(env) { return (env.SIGMA_API_URL || "https://user.sigmasms.ru/api").replace(/\/+$/, ""); }
function sigmaToken(env) { return env.SIGMA_API_TOKEN || env.SIGMA_TOKEN || ""; }
function parseJson(text) { try { return JSON.parse(text); } catch (_) { return text; } }
function findBalance(data) {
  if (!data || typeof data !== "object") return "";
  const candidates = [data.balance, data.amount, data.money, data.accountBalance, data?.billing?.balance, data?.settings?.balance, data?.user?.balance];
  for (const x of candidates) if (x !== undefined && x !== null && x !== "") return x;
  return "";
}
export async function onRequest({ request, env }) {
  const password = request.headers.get("x-admin-password") || "";
  if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) return json({ ok: false, error: "Неверный пароль администратора" }, 401);
  const token = sigmaToken(env);
  if (!token) return json({ ok: false, error: "Не задан SIGMA_API_TOKEN" }, 400);
  const attempts = ["/users/me?$scope=full", "/users/current?$scope=full", "/account?$scope=full", "/balance"];
  const results = [];
  for (const path of attempts) {
    const res = await fetch(`${sigmaBase(env)}${path}`, { headers: { "Accept": "application/json", "Authorization": token } });
    const raw = await res.text();
    const data = parseJson(raw);
    results.push({ path, ok: res.ok, status: res.status, data });
    const balance = findBalance(data);
    if (res.ok && balance !== "") return json({ ok: true, provider: "sigma", balance, result: data });
  }
  return json({ ok: false, provider: "sigma", error: "Баланс SIGMA не найден доступными методами. Проверьте его в личном кабинете SIGMA.", attempts: results }, 200);
}
