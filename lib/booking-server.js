/* Private server-side module imported by Cloudflare Pages Functions. Never served as a static asset. */
const JSON_HEADERS = { 'content-type':'application/json; charset=utf-8','cache-control':'no-store', 'x-content-type-options':'nosniff' };
export function respond(data,status=200){return new Response(JSON.stringify(data),{status,headers:JSON_HEADERS});}
export class BookingError extends Error {constructor(message,status=400){super(message);this.status=status;}}
export function clean(value,max=2000){return String(value ?? '').trim().slice(0,max).replace(/[<>\u0000-\u001f]/g,' ');}
export function phone7(value){let x=String(value||'').replace(/\D/g,'');if(x.length===11 && x.startsWith('8'))x='7'+x.slice(1);if(x.length===10 && x.startsWith('9'))x='7'+x;return /^7\d{10}$/.test(x)?'+'+x:'';}
export function root(env){return String(env.SUPABASE_URL||'').replace(/\/+$/,'').replace(/\/(rest|auth|storage)\/v1$/i,'');}
export function key(env){return String(env.SUPABASE_SECRET_KEY||env.SUPABASE_SERVICE_ROLE_KEY||env.SUPABASE_SERVICE_KEY||'');}
export function checkSetup(env){const missing=[];if(!root(env))missing.push('SUPABASE_URL');if(!key(env))missing.push('SUPABASE_SECRET_KEY');if(!env.BOOKING_TOKEN_SECRET || String(env.BOOKING_TOKEN_SECRET).length<32)missing.push('BOOKING_TOKEN_SECRET (32+ символов)');return missing;}
export async function db(env,path,{method='GET',body=null,headers={}}={}){
  if(!root(env)||!key(env))throw new BookingError('Не настроено подключение к базе данных',503);
  const res=await fetch(root(env)+path,{method,headers:{'apikey':key(env),'authorization':'Bearer '+key(env),'accept':'application/json','content-type':'application/json',...headers},body:body==null?undefined:JSON.stringify(body),cache:'no-store'});
  const raw=await res.text();let data;try{data=raw?JSON.parse(raw):null;}catch{throw new BookingError('База данных вернула некорректный ответ',502);}
  if(!res.ok){const msg=data?.message||data?.error||data?.hint||'Ошибка базы данных';const notReady=/does not exist|schema cache|could not find|relation .*does not exist|PGRST202/i.test(msg);throw new BookingError(notReady?'Сначала выполните миграцию booking_v1_migration.sql в Supabase':String(msg).slice(0,260),notReady?503:(res.status>=500?502:400));}
  return data;
}
export function adminRole(request,env){const supplied=(request.headers.get('x-admin-password')||'').trim();if(!supplied)return null;
  if(env.BOOKING_SERGEY_PASSWORD && supplied===String(env.BOOKING_SERGEY_PASSWORD))return 'Сергей';
  if(env.BOOKING_ROMAN_PASSWORD && supplied===String(env.BOOKING_ROMAN_PASSWORD))return 'Роман';
  return null;
}
export function requireAdmin(request,env){let role=adminRole(request,env);if(!role)throw new BookingError('Только Сергей и Роман. Проверьте BOOKING_SERGEY_PASSWORD / BOOKING_ROMAN_PASSWORD.',403);return role;}
export function requireAnyStaff(request,env){let p=(request.headers.get('x-admin-password')||'').trim();if(adminRole(request,env))return true;
  const legacy=['BebelyaNP','BebelyaPD','BebelyaSA'];return legacy.includes(p) || String(env.USER_PASSWORDS||'').split(/[;,\n]/).includes(p)&&p.length>0;
}
function b64url(bytes){let x='';for(const b of bytes)x+=String.fromCharCode(b);return btoa(x).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function b64decode(x){const s=x.replace(/-/g,'+').replace(/_/g,'/');return atob(s+'='.repeat((4-s.length%4)%4));}
async function hmac(secret,text){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return new Uint8Array(await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(text)));}
function equalConstantTime(a,b){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
export async function token(env,purpose,bookingId,expires){if(checkSetup(env).length)throw new BookingError('Не настроен секрет записи',503);const payload=b64url(new TextEncoder().encode(JSON.stringify({v:1,s:purpose,b:bookingId,e:expires})));return payload+'.'+b64url(await hmac(env.BOOKING_TOKEN_SECRET,payload));}
export async function verifyToken(env,raw,purpose){if(!raw || raw.length>1800)throw new BookingError('Недействительная ссылка',401);const [body,sig,extra]=raw.split('.');if(!body||!sig||extra)throw new BookingError('Недействительная ссылка',401);const expected=b64url(await hmac(env.BOOKING_TOKEN_SECRET,body));if(!equalConstantTime(sig,expected))throw new BookingError('Недействительная ссылка',401);let value;try{value=JSON.parse(new TextDecoder().decode(Uint8Array.from(b64decode(body),c=>c.charCodeAt(0))));}catch{throw new BookingError('Недействительная ссылка',401);}if(value?.v!==1||value.s!==purpose||!/^[a-f0-9-]{36}$/i.test(value.b||'')||value.e<Date.now())throw new BookingError('Срок действия ссылки истёк',401);return value.b;}
export function handleError(error){if(error instanceof BookingError)return respond({ok:false,error:error.message},error.status);console.error('Booking function error',error?.message);return respond({ok:false,error:'Временная ошибка сервера. Попробуйте ещё раз или позвоните нам.'},500);}
export async function turnstile(env,response,ip){if(!env.TURNSTILE_SECRET_KEY)throw new BookingError('Защита формы Turnstile ещё не настроена',503);if(!response)throw new BookingError('Пройдите проверку защиты от спама',400);
  const f=new FormData();f.append('secret',String(env.TURNSTILE_SECRET_KEY));f.append('response',String(response).slice(0,2048));if(ip)f.append('remoteip',ip);
  const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:f});const d=await r.json();if(!r.ok||!d.success)throw new BookingError('Проверка защиты не пройдена, обновите страницу и повторите попытку',403);
}
export function accessId(id){if(!/^[0-9a-f-]{36}$/i.test(String(id||'')))throw new BookingError('Неверный идентификатор записи');return id;}
export function dateText(d){return /^\d{4}-\d{2}-\d{2}$/.test(d||'')?d:null;}
export function timeText(t){return /^([01]\d|2[0-3]):[0-5]\d$/.test(t||'')?t:null;}
export function yes(value){return value===true || value==='true';}
export function prettyDate(iso){const x=String(iso||'').slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(x)?x.slice(8)+'.'+x.slice(5,7):x;}
export async function telegramSend(env,chatId,message){if(!chatId)return false;if(!env.BOOKING_TELEGRAM_BOT_TOKEN)return false;
  const result=await fetch('https://api.telegram.org/bot'+env.BOOKING_TELEGRAM_BOT_TOKEN+'/sendMessage',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:chatId,text:message,disable_web_page_preview:true})});const d=await result.json().catch(()=>({}));return result.ok&&d.ok===true;
}
export async function notifyBooking(env,notificationId){const rows=await db(env,'/rest/v1/booking_notifications?select=*,booking_requests(id,zayavka_id,direction,kind,start_at,status,zayavki(service))&id=eq.'+encodeURIComponent(notificationId)+'&limit=1');const n=rows?.[0];if(!n||n.status==='sent')return;
  const claim=await db(env,'/rest/v1/booking_notifications?id=eq.'+encodeURIComponent(n.id)+'&status=in.(queued,failed)&select=id',{method:'PATCH',headers:{Prefer:'return=representation'},body:{status:'sending',next_attempt_at:new Date(Date.now()+10*60_000).toISOString()}});
  if(!claim?.length)return;
  const b=n.booking_requests||{};const local=new Date(b.start_at||Date.now()).toLocaleString('ru-RU',{timeZone:'Asia/Yekaterinburg',hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit',year:'numeric'});
  const title={created:'Новая заявка с сайта',change_requested:'Запрос на перенос',cancel_requested:'Запрос на отмену'}[n.event_type]||'Изменение записи';
  const base=String(env.BOOKING_SITE_URL||'').replace(/\/$/,'');
  const msg=`СОЛНЦАНЕТ · ${title}\nЗаявка ${String(b.id||'').slice(0,8).toUpperCase()}\n${b.kind||''}: ${b.zayavki?.service||''}\n${local} (Екатеринбург)\n${base?base+'/admin.html?open='+b.zayavka_id:'Откройте раздел Заявки в CRM'}`;
  let sergey=n.sergey_sent,roman=n.roman_sent;
  if(!sergey){try{sergey=await telegramSend(env,env.BOOKING_TELEGRAM_SERGEY_CHAT_ID,msg);}catch{sergey=false;}}
  if(!roman){try{roman=await telegramSend(env,env.BOOKING_TELEGRAM_ROMAN_CHAT_ID,msg);}catch{roman=false;}}
  const done=Boolean(sergey&&roman);
  const patch={sergey_sent:Boolean(sergey),roman_sent:Boolean(roman),status:done?'sent':'failed',attempts:n.attempts+1,next_attempt_at:new Date(Date.now()+Math.min(60,2**Math.min(n.attempts,6))*60_000).toISOString(),last_error:done?null:'Проверьте BOT_TOKEN и оба Telegram chat_id',sent_at:done?new Date().toISOString():null};
  await db(env,'/rest/v1/booking_notifications?id=eq.'+encodeURIComponent(n.id),{method:'PATCH',body:patch});
}
export async function bookingRow(env,id){const rows=await db(env,'/rest/v1/booking_requests?select=*,zayavki(id,service,client_id,clients(name,phone))&id=eq.'+encodeURIComponent(accessId(id))+'&limit=1');return rows?.[0]||null;}
export async function adminBookings(env){const r=await db(env,'/rest/v1/booking_requests?select=*,booking_services(name,price_from,duration_minutes),zayavki(id,service,address,client_comment,clients(name,phone))&order=created_at.desc&limit=200');return Array.isArray(r)?r:[];}
