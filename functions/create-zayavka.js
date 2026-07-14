const DEFAULT_NOCODB_ENDPOINT = "https://app.nocodb.com/api/v3/data/ptvxn8nmuwc08y3/mgp2zjsuv4id5tp/records";
function json(body,status=200){return new Response(JSON.stringify(body,null,2),{status,headers:{"Content-Type":"application/json; charset=utf-8"}})}
function parseJson(t){try{return JSON.parse(t)}catch(e){return t}}
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
export async function onRequestPost(context){const {request,env}=context;const auth=checkAdmin(request,env);if(!auth.ok)return json(auth.body,auth.status);if(!env.NOCODB_TOKEN)return json({ok:false,error:"NOCODB_TOKEN is missing"},500);let body;try{body=await request.json()}catch(e){return json({ok:false,error:"Invalid JSON"},400)}const fields=body.fields||{};if(!fields["Имя клиента"]||!fields["Телефон"])return json({ok:false,error:"Имя клиента и телефон обязательны"},400);try{const res=await fetch(env.NOCODB_ENDPOINT||DEFAULT_NOCODB_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json","xc-token":env.NOCODB_TOKEN},body:JSON.stringify([{fields}])});const text=await res.text();const data=parseJson(text);if(!res.ok)return json({ok:false,error:"NocoDB create error",status:res.status,nocodbResponse:data,sentFields:fields},500);return json({ok:true,created:true,nocodbResponse:data,sentFields:fields})}catch(e){return json({ok:false,error:e.message},500)}}
export async function onRequest(context){if(context.request.method!=="POST")return json({ok:false,error:"Only POST"},405);return onRequestPost(context)}
