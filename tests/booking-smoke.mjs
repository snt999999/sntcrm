/* Local deterministic smoke tests without external services. Run: node tests/booking-smoke.mjs */
import assert from 'node:assert/strict';
import { onRequest as publicHandler } from '../functions/booking-public.js';
import { onRequest as adminHandler } from '../functions/booking-admin.js';
import { verifyToken } from '../lib/booking-server.js';
const uuid='a0b1c2d3-1111-4111-8111-111111111111',sid='a0b1c2d3-2222-4222-8222-222222222222',zid='a0b1c2d3-3333-4333-8333-333333333333';
const env={SUPABASE_URL:'https://example.supabase.co',SUPABASE_SECRET_KEY:'not-a-real-key',BOOKING_TOKEN_SECRET:'a'.repeat(48),BOOKING_SERGEY_PASSWORD:'sample-manager-1',BOOKING_ROMAN_PASSWORD:'sample-manager-2',BOOKING_CRON_SECRET:'c'.repeat(48),BOOKING_PRIVACY_URL:'https://example.org/privacy',BOOKING_SITE_URL:'https://example.org',TURNSTILE_SITE_KEY:'site',TURNSTILE_SECRET_KEY:'secret',FILES_BUCKET:{},BOOKING_TELEGRAM_BOT_TOKEN:'fake',BOOKING_TELEGRAM_SERGEY_CHAT_ID:'123',BOOKING_TELEGRAM_ROMAN_CHAT_ID:'456',SIGMA_API_TOKEN:'test'};
const prev=globalThis.fetch;
let sentSms=0;
globalThis.fetch=async (url,options={})=>{
 const u=String(url),body=options.body instanceof FormData ? {} : (options.body?JSON.parse(options.body.toString()):{});
 let data=[];
 if(u.includes('siteverify'))return new Response(JSON.stringify({success:true}),{status:200});
 if(u.includes('/rest/v1/booking_services'))data=[{id:sid,direction:'Авто',kind:'Авто',name:'Тонирование задней полусферы',price_from:6000,duration_minutes:90,slot_step_minutes:30,published:true}];
 else if(u.includes('/rest/v1/rpc/booking_slots'))data=[{slot_time:'09:00'},{slot_time:'09:30'}];
 else if(u.includes('/rest/v1/rpc/booking_submit')){assert.equal(body.p_service_id,sid);data=[{booking_id:uuid,zayavka_id:zid,reference:'A0B1C2D3',hold_until:new Date(Date.now()+3600000).toISOString(),is_new:true}];}
 else if(u.includes('/rest/v1/booking_notifications'))data=[];
 else if(u.includes('/sms_queue')){sentSms++;data=[];}
 return new Response(JSON.stringify(data),{status:200,headers:{'content-type':'application/json'}});
};
try{
 let r=await publicHandler({request:new Request('https://example.org/booking-public?mode=config'),env});
 let data=await r.json();assert.equal(r.status,200);assert.equal(data.ready,true);assert.equal(data.services.length,1);
 r=await publicHandler({request:new Request('https://example.org/booking-public?mode=slots&service='+sid+'&date=2026-11-11'),env});data=await r.json();assert.deepEqual(data.slots,['09:00','09:30']);
 const input={requestKey:'a0b1c2d3-4444-4444-8444-444444444444',serviceId:sid,date:'2026-11-11',time:'09:00',name:'Тестовый Клиент',phone:'+79990000000',address:'',car:'Hyundai Solaris',comment:'',consent:true,formStartedAt:Date.now()-30000,turnstileToken:'turnstile-test',website:''};
 r=await publicHandler({request:new Request('https://example.org/booking-public',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(input)}),env,waitUntil:p=>p});data=await r.json();assert.equal(r.status,201);assert.equal(data.reference,'A0B1C2D3');assert.equal(await verifyToken(env,data.uploadToken,'upload'),uuid);assert.equal(await verifyToken(env,data.manageToken,'manage'),uuid);assert.equal(sentSms,0);
 r=await adminHandler({request:new Request('https://example.org/booking-admin?mode=requests'),env});assert.equal(r.status,403);
 r=await adminHandler({request:new Request('https://example.org/booking-admin?mode=requests',{headers:{'x-admin-password':'sample-staff'}}),env});assert.equal(r.status,403);
 r=await adminHandler({request:new Request('https://example.org/booking-admin?mode=requests',{headers:{'x-admin-password':'sample-manager-1'}}),env});assert.equal(r.status,200);
 console.log('BOOKING SMOKE TESTS: PASS (config, slots, create, signed links, no early SMS, admin access)');
}finally{globalThis.fetch=prev;}
