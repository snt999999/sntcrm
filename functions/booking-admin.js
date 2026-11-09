import {syncBookingGoogle} from '../lib/booking-calendar.js';
import {respond,db,requireAdmin,handleError,accessId,clean,BookingError,adminBookings,dateText,timeText} from '../lib/booking-server.js';
const RETIRED_AUTO_SERVICES = new Set(["Форточки", "Бронирование 1 фары", "Бронирование противотуманных фар (1 шт)", "Доплата"]);
export async function onRequest({request,env}){
 try{
  const manager=requireAdmin(request,env);
  const url=new URL(request.url);
  if(request.method==='GET'){
    const mode=url.searchParams.get('mode')||'requests';
    if(mode==='requests'){return respond({ok:true,bookings:await adminBookings(env),role:manager});}
    if(mode==='services'){const services=await db(env,'/rest/v1/booking_services?select=*&order=direction.asc,kind.asc,sort_order.asc');return respond({ok:true,services:(services||[]).filter(s=>!(s.direction==='Авто'&&RETIRED_AUTO_SERVICES.has(s.name)))});}
    if(mode==='files'){
      const zid=accessId(url.searchParams.get('requestId'));
      const rows=await db(env,'/rest/v1/files?select=id,name,mime_type,size_bytes,external_id&zayavka_id=eq.'+encodeURIComponent(zid)+'&source=eq.r2&deleted_at=is.null&order=created_at.asc');
      return respond({ok:true,files:rows||[]});
    }
    throw new BookingError('Неизвестный режим');
  }
  if(request.method!=='POST')return respond({ok:false,error:'Method not allowed'},405);
  const body=await request.json(); const mode=String(body.mode||'action');
  if(mode==='calendar_sync'){const result=await syncBookingGoogle(env,accessId(body.id));return respond({ok:result.ok,calendar:result,error:result.error||''},result.ok?200:502);}
  if(mode==='action'){
    const action=String(body.action||'');if(!['confirm','propose','reject','cancel','dismiss_change'].includes(action))throw new BookingError('Недопустимое действие');
    const id=accessId(body.id);
    const date=body.date?dateText(body.date):null;
    const time=body.time?timeText(body.time):null;
    if((body.date&&!date)||(body.time&&!time))throw new BookingError('Неверная дата или время');
    const out=await db(env,'/rest/v1/rpc/booking_admin_transition',{method:'POST',body:{p_booking_id:id,p_action:action,p_date:date,p_time:time,p_reason:clean(body.reason,1000)}});
    await db(env,'/rest/v1/history_log',{method:'POST',body:{entity_type:'zayavka',entity_id:out[0]?.zayavka_id,action:'online_booking_'+action,actor:manager,comment:'Решение по онлайн-заявке'}}).catch(()=>{});
    const calendar=(action==='confirm'&&out?.[0]?.new_status==='confirmed')?await syncBookingGoogle(env,id):null;
    return respond({ok:true,result:out[0]||null,calendarWarning:calendar&&!calendar.ok?(calendar.error||'Не удалось синхронизировать Google Calendar'):null});
  }
  if(mode==='service'){
    const id=accessId(body.id);
    const existing=await db(env,'/rest/v1/booking_services?id=eq.'+encodeURIComponent(id)+'&select=id,direction,kind,name&limit=1');
    const service=existing?.[0];
    if(!service)throw new BookingError('Услуга не найдена',404);
    if(service.direction==='Авто'&&RETIRED_AUTO_SERVICES.has(service.name))throw new BookingError('Эта услуга исключена из онлайн-записи');
    const minutes=body.durationMinutes===null||body.durationMinutes===''?null:Number(body.durationMinutes);
    const step=Number(body.stepMinutes||30);
    if(minutes!==null&&(!Number.isInteger(minutes)||minutes<15||minutes>720||minutes%15!==0))throw new BookingError('Длительность: от 15 до 720 минут, кратно 15');
    if(!Number.isInteger(step)||step<15||step>180||step%15!==0)throw new BookingError('Шаг: от 15 до 180 минут, кратно 15');
    if(body.published&&minutes===null)throw new BookingError('Сначала укажите продолжительность услуги');
    let price=null;if(body.priceFrom!==null&&body.priceFrom!==undefined&&String(body.priceFrom).trim()!==''){price=Number(body.priceFrom);if(!Number.isFinite(price)||price<0)throw new BookingError('Неверная цена');}
    const rows=await db(env,'/rest/v1/booking_services?id=eq.'+encodeURIComponent(id)+'&select=*',{method:'PATCH',headers:{Prefer:'return=representation'},body:{price_from:service.kind==='Замер'?0:price,duration_minutes:minutes,slot_step_minutes:step,published:body.published===true,updated_at:new Date().toISOString()}});
    return respond({ok:true,service:rows?.[0]||null});
  }
  throw new BookingError('Неизвестное действие');
 }catch(error){return handleError(error);}
}
