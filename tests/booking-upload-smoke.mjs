/* Local simulated R2 multipart flow. Run: node tests/booking-upload-smoke.mjs */
import assert from 'node:assert/strict';
import { onRequest as uploadHandler } from '../functions/booking-upload.js';
import { token } from '../lib/booking-server.js';
const uuid='a0b1c2d3-1111-4111-8111-111111111111', zid='a0b1c2d3-3333-4333-8333-333333333333', fid='a0b1c2d3-5555-4555-8555-555555555555',cid='a0b1c2d3-6666-4666-8666-666666666666';
let entry=null,parts=[];const env={SUPABASE_URL:'https://example.supabase.co',SUPABASE_SECRET_KEY:'fake',BOOKING_TOKEN_SECRET:'z'.repeat(48),FILES_BUCKET:{async createMultipartUpload(key){return {uploadId:'r2-id',abort:async()=>{}}},resumeMultipartUpload(key,id){return {uploadPart:async (part,bytes)=>{parts.push(bytes.byteLength);return {partNumber:part,etag:'abc123456789'}},complete:async ps=>({size:parts.reduce((a,b)=>a+b,0)}),abort:async()=>{}}}}};
const jwt=await token(env,'upload',uuid,Date.now()+3600000),prev=globalThis.fetch;
globalThis.fetch=async (url,opts={})=>{
 const str=String(url),method=opts.method||'GET',body=opts.body?JSON.parse(opts.body):{};let data=[];
 if(str.includes('/rest/v1/booking_requests'))data=[{id:uuid,zayavka_id:zid,status:'pending',zayavki:{id:zid,client_id:cid}}];
 else if(str.includes('/rest/v1/booking_uploads?')){if(method==='POST'){entry={...body,id:fid,status:'uploading',created_at:new Date().toISOString()};data=[entry];}else if(method==='PATCH'){Object.assign(entry,body);data=[];}else if(str.includes('booking_id=eq.'))data=entry?[entry]:[];else data=entry?[entry]:[];}
 else if(str.includes('/rest/v1/files'))data=[{id:fid}];
 return new Response(JSON.stringify(data),{status:200,headers:{'content-type':'application/json'}});
};
const call=async (mode,body={},id='')=>{const req=new Request('https://example.org/booking-upload?mode='+mode+(id?'&id='+id:''),{method:'POST',headers:{authorization:'Bearer '+jwt,...(mode==='part'?{}:{'content-type':'application/json'})},body:mode==='part'?new Uint8Array([1,2,3,4]):JSON.stringify(body)});const res=await uploadHandler({request:req,env});const val=await res.json();return {status:res.status,...val};};
try{
 const start=await call('init',{name:'test.pdf',size:4,type:'application/pdf'});
 assert.equal(start.ok,true);assert.equal(start.totalParts,1);
 const id=start.id;let r=await call('part',{},id+'&part=1');assert.equal(r.ok,true);assert.equal(r.partNumber,1);
 r=await call('complete',{parts:[{partNumber:1,etag:r.etag}]},id);assert.equal(r.ok,true);
 r=await call('status',{},id);assert.equal(r.status,'completed');
 console.log('R2 MULTIPART MOCK: PASS (init, upload, complete, resume status)');
}finally{globalThis.fetch=prev;}
