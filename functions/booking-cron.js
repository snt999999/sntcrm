import {respond,db,handleError,notifyBooking,BookingError} from '../lib/booking-server.js';
export async function onRequest({request,env}){
 try{
  if(!['GET','POST'].includes(request.method))return respond({ok:false,error:'Method not allowed'},405);
  const secret=String(env.BOOKING_CRON_SECRET||'');
  if(!secret||secret.length<24 || request.headers.get('authorization')!=='Bearer '+secret)throw new BookingError('Запрещено',403);
  const expired=await db(env,'/rest/v1/rpc/booking_expire_holds',{method:'POST',body:{}});
  // Recover notifications left in sending state after a crashed invocation.
  await db(env,'/rest/v1/booking_notifications?status=eq.sending&next_attempt_at=lte.'+encodeURIComponent(new Date().toISOString()),{method:'PATCH',body:{status:'failed',last_error:'Повтор после прерванного отправления'}});
  const queued=await db(env,'/rest/v1/booking_notifications?select=id&status=in.(queued,failed)&next_attempt_at=lte.'+encodeURIComponent(new Date().toISOString())+'&order=created_at.asc&limit=30');
  let sent=0;for(const n of queued||[]){try{await notifyBooking(env,n.id);sent++;}catch(e){console.error('notify booking',n.id,e.message)}}
  return respond({ok:true,expired:Number(expired||0),notificationsProcessed:sent});
 }catch(error){return handleError(error);}
}
