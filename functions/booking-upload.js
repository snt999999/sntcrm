import {respond,db,verifyToken,handleError,clean,accessId,bookingRow,BookingError} from '../lib/booking-server.js';
const MiB=1024*1024;
const TYPES=new Set(['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif','application/pdf',
 'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
 'text/plain','application/rtf']);
function extOK(name){return /\.(jpg|jpeg|png|webp|gif|heic|heif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|rtf)$/i.test(name);}
function validName(name){const t=clean(name,180).replace(/[\\/\u200e\u200f]/g,'_').replace(/^\.+/,'');if(!t||!extOK(t))throw new BookingError('Разрешены фото, PDF и офисные документы');return t;}
const ttl=48*3600*1000;
async function session(env,id,bid){const r=await db(env,'/rest/v1/booking_uploads?select=*&id=eq.'+encodeURIComponent(accessId(id))+'&booking_id=eq.'+encodeURIComponent(bid)+'&limit=1');if(!r?.[0])throw new BookingError('Загрузка не найдена',404);return r[0];}
export async function onRequest({request,env}){
 try{
  if(!env.FILES_BUCKET)throw new BookingError('В Cloudflare ещё не подключён R2 binding FILES_BUCKET',503);
  if(request.method!=='POST')return respond({ok:false,error:'Only POST'},405);
  const url=new URL(request.url),mode=url.searchParams.get('mode')||'init';
  const raw=request.headers.get('authorization')?.replace(/^Bearer /i,'');
  const bid=await verifyToken(env,raw,'upload');
  const booking=await bookingRow(env,bid);if(!booking||['rejected','cancelled','expired'].includes(booking.status))throw new BookingError('Заявка уже закрыта',403);
  if(mode==='init'){
    const data=await request.json();const name=validName(data.name);
    const mime=String(data.type||'').toLowerCase();if(!TYPES.has(mime))throw new BookingError('Недопустимый формат файла');
    const size=Number(data.size);if(!Number.isSafeInteger(size)||size<=0)throw new BookingError('Некорректный размер файла');
    const chunkSize=Math.max(8*MiB,Math.ceil(size/(9999*MiB))*MiB);
    if(chunkSize>64*MiB)throw new BookingError('Файл слишком велик для прямой загрузки через Pages Functions (предел около 600 ГБ)',413);
    const count=await db(env,'/rest/v1/booking_uploads?select=id&booking_id=eq.'+bid+'&status=neq.aborted');
    if((count?.length||0)>=15)throw new BookingError('Не более 15 файлов на заявку');
    const storageKey='bookings/'+bid+'/'+crypto.randomUUID()+'/'+name;
    const upload=await env.FILES_BUCKET.createMultipartUpload(storageKey,{httpMetadata:{contentType:mime}});
    try{
      const saved=await db(env,'/rest/v1/booking_uploads?select=*',{method:'POST',headers:{Prefer:'return=representation'},body:{booking_id:bid,storage_key:storageKey,upload_id:upload.uploadId,name,mime_type:mime,size_bytes:size,chunk_size:chunkSize}});
      return respond({ok:true,id:saved[0].id,chunkSize,totalParts:Math.ceil(size/chunkSize)});
    }catch(e){await upload.abort().catch(()=>{});throw e;}
  }
  const id=url.searchParams.get('id');const entry=await session(env,id,bid);
  if(mode==='status')return respond({ok:true,id:entry.id,chunkSize:entry.chunk_size,totalParts:Math.ceil(Number(entry.size_bytes)/entry.chunk_size),status:entry.status});
  if(entry.status!=='uploading')throw new BookingError('Загрузка уже завершена');
  if(Date.now()-Date.parse(entry.created_at)>ttl)throw new BookingError('Срок загрузки истёк, начните заново',410);
  const upload=env.FILES_BUCKET.resumeMultipartUpload(entry.storage_key,entry.upload_id);
  if(mode==='part'){
    const part=Number(url.searchParams.get('part'));
    const count=Math.ceil(Number(entry.size_bytes)/entry.chunk_size);
    if(!Number.isInteger(part)||part<1||part>count)throw new BookingError('Недопустимая часть');
    const bytes=await request.arrayBuffer();
    const expected=part===count?Number(entry.size_bytes)-(count-1)*entry.chunk_size:entry.chunk_size;
    if(bytes.byteLength!==expected)throw new BookingError('Размер части не совпадает с ожидаемым');
    const result=await upload.uploadPart(part,bytes);
    return respond({ok:true,partNumber:result.partNumber,etag:result.etag});
  }
  if(mode==='complete'){
    const data=await request.json();const total=Math.ceil(Number(entry.size_bytes)/entry.chunk_size);
    const parts=data.parts;
    if(!Array.isArray(parts)||parts.length!==total||parts.length>10000)throw new BookingError('Не все части файла загружены');
    const parsed=parts.map(x=>({partNumber:Number(x.partNumber),etag:String(x.etag||'')})).sort((a,b)=>a.partNumber-b.partNumber);
    if(parsed.some((x,i)=>x.partNumber!==i+1||!/^[\da-fA-F-]{8,150}$/.test(x.etag)))throw new BookingError('Некорректный список частей');
    const object=await upload.complete(parsed);
    if(Number(object.size)!==Number(entry.size_bytes))throw new BookingError('Размер итогового файла не совпадает',500);
    const saved=await db(env,'/rest/v1/files?select=id',{method:'POST',headers:{Prefer:'return=representation'},body:{zayavka_id:booking.zayavka_id,client_id:booking.zayavki?.client_id,name:entry.name,mime_type:entry.mime_type,size_bytes:entry.size_bytes,source:'r2',external_id:entry.storage_key}});
    await db(env,'/rest/v1/booking_uploads?id=eq.'+entry.id,{method:'PATCH',body:{status:'completed',finished_at:new Date().toISOString()}});
    return respond({ok:true,fileId:saved[0]?.id,name:entry.name});
  }
  if(mode==='abort'){
    await upload.abort().catch(()=>{});
    await db(env,'/rest/v1/booking_uploads?id=eq.'+entry.id,{method:'PATCH',body:{status:'aborted'}});
    return respond({ok:true});
  }
  throw new BookingError('Неизвестное действие');
 }catch(error){return handleError(error);}
}
