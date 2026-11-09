import {respond,db,verifyToken,handleError,dateText,timeText,clean,BookingError,bookingRow,notifyBooking} from '../lib/booking-server.js';
export async function onRequest(context){const {request,env}=context;
 try{
  const url=new URL(request.url);let body=null;
  if(request.method==='POST')body=await request.json();else if(request.method!=='GET')return respond({ok:false,error:'Method not allowed'},405);
  const raw=request.method==='GET'?url.searchParams.get('token'):body?.token;
  const id=await verifyToken(env,raw,'manage');const row=await bookingRow(env,id);
  if(!row)throw new BookingError('Запись не найдена',404);
  if(request.method==='GET')return respond({ok:true,booking:{reference:id.slice(0,8).toUpperCase(),status:row.status,startAt:row.start_at,kind:row.kind,service:row.zayavki?.service}});
  if(!['cancel','change'].includes(body.action))throw new BookingError('Недопустимое действие');
  const date=body.action==='change'?dateText(body.date):null;
  const time=body.action==='change'?timeText(body.time):null;
  if(body.action==='change'&&(!date||!time))throw new BookingError('Укажите желаемую дату и время');
  const updated=await db(env,'/rest/v1/rpc/booking_client_request',{method:'POST',body:{p_booking_id:id,p_action:body.action,p_date:date,p_time:time,p_comment:clean(body.comment,1000)}});
  if(context.waitUntil){context.waitUntil((async()=>{try{const type=body.action==='cancel'?'cancel_requested':'change_requested';const ns=await db(env,'/rest/v1/booking_notifications?select=id&booking_id=eq.'+encodeURIComponent(id)+'&event_type=eq.'+type);if(ns?.[0])await notifyBooking(env,ns[0].id);}catch(e){console.error('booking manage notification',e.message)}})());}
  return respond({ok:true,status:updated,message:'Запрос отправлен. Менеджер свяжется с вами.'});
 }catch(error){return handleError(error);}}
