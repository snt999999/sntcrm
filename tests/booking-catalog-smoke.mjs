/* Test public catalog exclusions and manager editing of free measurements.
   Run: node tests/booking-catalog-smoke.mjs */
import assert from 'node:assert/strict';
import {onRequest as adminHandler} from '../functions/booking-admin.js';
const serviceId='a0b1c2d3-2222-4222-8222-222222222222';
const excludedId='a0b1c2d3-3333-4333-8333-333333333333';
const password='manager-test-password';
const env={SUPABASE_URL:'https://example.supabase.co',SUPABASE_SECRET_KEY:'local-only-test',BOOKING_SERGEY_PASSWORD:password};
const originalFetch=globalThis.fetch;
let updated=null;
globalThis.fetch=async (url,options={})=>{
 const u=new URL(String(url));
 const method=options.method||'GET';
 let data=[];
 if(u.pathname==='/rest/v1/booking_services'){
  const id=u.searchParams.get('id');
  if(method==='PATCH'){
   updated=JSON.parse(options.body);
   data=[{...updated,id:serviceId,kind:'Замер',name:'Замер / консультация'}];
  } else if(id==='eq.'+excludedId){
   data=[{id:excludedId,direction:'Авто',kind:'Авто',name:'Форточки',published:false}];
  } else if(id==='eq.'+serviceId){
   data=[{id:serviceId,direction:'Архитектура',kind:'Замер',name:'Замер / консультация',published:true}];
  } else {
   data=[
    {id:serviceId,direction:'Архитектура',kind:'Замер',name:'Замер / консультация',price_from:0,duration_minutes:60,published:true},
    {id:excludedId,direction:'Авто',kind:'Авто',name:'Форточки',price_from:1000,duration_minutes:60,published:false},
    {id:'a0b1c2d3-4444-4444-8444-444444444444',direction:'Авто',kind:'Авто',name:'Тонирование задней полусферы',price_from:6000,duration_minutes:180,published:true}
   ];
  }
 }
 return new Response(JSON.stringify(data),{status:200,headers:{'content-type':'application/json'}});
};
const get=async (url,body=null)=>{
 const request=new Request('https://example.org/'+url,{method:body?'POST':'GET',headers:{'x-admin-password':password,...(body?{'content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
 const response=await adminHandler({request,env});
 return {status:response.status,result:await response.json()};
};
try {
 let r=await get('booking-admin?mode=services');
 assert.equal(r.status,200);assert.equal(r.result.services.length,2);
 assert.equal(r.result.services.some(s=>s.name==='Форточки'),false);
 r=await get('booking-admin',{mode:'service',id:serviceId,priceFrom:1600,durationMinutes:60,stepMinutes:30,published:true});
 assert.equal(r.status,200);assert.equal(updated.price_from,0);assert.equal(updated.published,true);
 updated=null;
 r=await get('booking-admin',{mode:'service',id:excludedId,priceFrom:1000,durationMinutes:60,stepMinutes:30,published:true});
 assert.equal(r.status,400);assert.equal(updated,null);
 console.log('BOOKING CATALOG SMOKE: PASS (removed services hidden/locked, measurement always free)');
} finally {globalThis.fetch=originalFetch;}
