import {db,verifyToken,handleError,accessId,BookingError} from '../lib/booking-server.js';
export async function onRequest({request,env}){
 try{
  if(request.method!=='GET')return new Response('Method not allowed',{status:405});
  if(!env.FILES_BUCKET)throw new BookingError('R2 не подключён',503);
  const u=new URL(request.url);
  const bid=await verifyToken(env,u.searchParams.get('token'),'download');
  const id=accessId(u.searchParams.get('id'));
  const rows=await db(env,'/rest/v1/files?select=id,name,external_id,mime_type,zayavka_id&source=eq.r2&id=eq.'+id+'&deleted_at=is.null&limit=1');
  const f=rows?.[0];if(!f)throw new BookingError('Файл не найден',404);
  const check=await db(env,'/rest/v1/booking_requests?select=id&zayavka_id=eq.'+f.zayavka_id+'&id=eq.'+bid+'&limit=1');if(!check?.length)throw new BookingError('Доступ запрещён',403);
  if(!f.external_id?.startsWith('bookings/'+bid+'/'))throw new BookingError('Доступ запрещён',403);
  const obj=await env.FILES_BUCKET.get(f.external_id);if(!obj)throw new BookingError('Объект не найден в R2',404);
  const safe=encodeURIComponent(f.name||'file');return new Response(obj.body,{status:200,headers:{'content-type':f.mime_type||'application/octet-stream','content-length':String(obj.size),'content-disposition':"attachment; filename*=UTF-8''"+safe,'cache-control':'private, max-age=0','x-content-type-options':'nosniff'}});
 }catch(e){return handleError(e);}}
