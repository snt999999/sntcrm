import {respond,db,requireAnyStaff,handleError,accessId,token,BookingError} from '../lib/booking-server.js';
export async function onRequest({request,env}){try{
 if(request.method!=='GET')return respond({ok:false,error:'Only GET'},405);
 if(!requireAnyStaff(request,env))throw new BookingError('Недостаточно прав',403);
 const zid=accessId(new URL(request.url).searchParams.get('requestId'));
 const rows=await db(env,'/rest/v1/booking_requests?select=id&zayavka_id=eq.'+zid+'&limit=1');
 const bookingId=rows?.[0]?.id;
 if(!bookingId)return respond({ok:true,files:[]});
 const t=await token(env,'download',bookingId,Date.now()+10*60_000);
 const files=await db(env,'/rest/v1/files?select=id,name,mime_type,size_bytes&zayavka_id=eq.'+zid+'&source=eq.r2&deleted_at=is.null&order=created_at.asc');
 return respond({ok:true,files:(files||[]).map(f=>({...f,url:'/booking-file?id='+encodeURIComponent(f.id)+'&token='+encodeURIComponent(t)}))});
 }catch(e){return handleError(e);}}
