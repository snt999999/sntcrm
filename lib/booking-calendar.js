import {db} from './booking-server.js';
export async function syncBookingGoogle(env,bookingId){
 const rows=await db(env,'/rest/v1/booking_requests?select=id,status,kind,zayavka_id,zayavki(id,service,direction,status,address,client_comment,visit_date,visit_time,calendar_event_id,meta,clients(name,phone))&id=eq.'+encodeURIComponent(bookingId)+'&limit=1');
 const b=rows?.[0];if(!b || b.status!=='confirmed')return {ok:false,error:'Запись ещё не подтверждена'};
 const z=b.zayavki||{},c=z.clients||{};
 const fields={...(z.meta?.old_fields||{}),'Имя клиента':c.name||'','Телефон':c.phone||'','Услуга':z.service||'','Направление':z.direction||'','Дата записи':z.visit_date||'','Время записи':String(z.visit_time||'').slice(0,5),'Адрес':z.address||'','Комментарий клиента':z.client_comment||'','Статус':'Подтверждена','Тип записи':b.kind,'Google Calendar Event ID':z.calendar_event_id||''};
 const endpoint=env.GOOGLE_CALENDAR_SYNC_URL||env.GOOGLE_CALENDAR_EXPORT_URL||env.GOOGLE_CALENDAR_IMPORT_URL;
 const secret=env.GOOGLE_CALENDAR_SYNC_TOKEN||env.GOOGLE_CALENDAR_EXPORT_TOKEN||env.GOOGLE_CALENDAR_IMPORT_TOKEN;
 if(!endpoint||!secret)return {ok:false,error:'Не заданы GOOGLE_CALENDAR_SYNC_URL и TOKEN'};
 try{
  const r=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'upsert',eventId:z.calendar_event_id||'',recordId:z.id,source:'onlineBooking',fields,token:secret})});
  const text=await r.text();let data;try{data=JSON.parse(text)}catch{return {ok:false,error:'Google Apps Script вернул не JSON'}};
  if(!r.ok||data.ok===false)return {ok:false,error:data.error||'Ошибка синхронизации Google Calendar'};
  if(data.eventId||data.htmlLink){
    const meta={...z.meta,old_fields:{...(z.meta?.old_fields||{}),'Google Calendar Event ID':data.eventId||z.calendar_event_id,'Ссылка на событие':data.htmlLink||''}};
    await db(env,'/rest/v1/zayavki?id=eq.'+encodeURIComponent(z.id),{method:'PATCH',body:{calendar_event_id:data.eventId||z.calendar_event_id,meta}});
  }
  return {ok:true,eventId:data.eventId||''};
 }catch(e){return {ok:false,error:e.message||'Недоступен Google Calendar'}};
}
