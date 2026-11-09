import {respond,db,checkSetup,turnstile,handleError,clean,phone7,token,accessId,dateText,BookingError} from '../lib/booking-server.js';

export async function onRequest(context){
  const {request,env}=context;
  try{
    if(request.method==='GET'){
      const url=new URL(request.url);const mode=url.searchParams.get('mode')||'config';
      if(mode==='config'){
        const missing=checkSetup(env);const privacy=String(env.BOOKING_PRIVACY_URL||'');const privacyUrl=/^https:\/\/[^\s]+/i.test(privacy)?privacy:null;const ready=missing.length===0&&Boolean(env.TURNSTILE_SITE_KEY&&env.TURNSTILE_SECRET_KEY&&privacyUrl&&env.FILES_BUCKET&&env.BOOKING_SERGEY_PASSWORD&&env.BOOKING_ROMAN_PASSWORD&&env.BOOKING_ADMIN_ACTION_KEY&&String(env.BOOKING_ADMIN_ACTION_KEY).length>=32&&env.BOOKING_TELEGRAM_BOT_TOKEN&&env.BOOKING_TELEGRAM_SERGEY_CHAT_ID&&env.BOOKING_TELEGRAM_ROMAN_CHAT_ID&&env.BOOKING_CRON_SECRET&&String(env.BOOKING_CRON_SECRET).length>=24&&env.SIGMA_API_TOKEN);
        const services=await db(env,'/rest/v1/booking_services?select=id,direction,kind,name,price_from,duration_minutes,slot_step_minutes&published=eq.true&order=direction.asc,kind.asc,sort_order.asc');
        return respond({ok:true,ready,notice:ready?'':'Онлайн-запись готовится к запуску: настройте секреты и опубликуйте услуги.',turnstileSiteKey:ready?String(env.TURNSTILE_SITE_KEY):null,privacyUrl:ready?privacyUrl:null,services});
      }
      if(mode==='slots'){
        const id=accessId(url.searchParams.get('service'));const date=dateText(url.searchParams.get('date'));
        if(!date)throw new BookingError('Укажите дату');
        const slots=await db(env,'/rest/v1/rpc/booking_slots',{method:'POST',body:{p_service_id:id,p_date:date}});
        return respond({ok:true,slots:Array.isArray(slots)?slots.map(s=>s.slot_time):[]});
      }
      throw new BookingError('Неизвестный режим');
    }
    if(request.method!=='POST')return respond({ok:false,error:'Method not allowed'},405);
    if(checkSetup(env).length || !env.TURNSTILE_SECRET_KEY || !env.TURNSTILE_SITE_KEY || !env.FILES_BUCKET || !/^https:\/\/[^\s]+/i.test(String(env.BOOKING_PRIVACY_URL||'')) || !env.BOOKING_ADMIN_ACTION_KEY || String(env.BOOKING_ADMIN_ACTION_KEY).length<32 || !env.BOOKING_SERGEY_PASSWORD || !env.BOOKING_ROMAN_PASSWORD)throw new BookingError('Сервис записи ещё настраивается',503);
    if(Number(request.headers.get('content-length')||0)>15000)throw new BookingError('Слишком большой запрос',413);
    const body=await request.json();
    if(body.website||body.hpCompany)throw new BookingError('Запрос отклонён',400);
    if(Date.now()-Number(body.formStartedAt||0)<1200)throw new BookingError('Форма отправлена слишком быстро',429);
    if(body.consent!==true)throw new BookingError('Необходимо согласие на обработку данных');
    const phone=phone7(body.phone);if(!phone)throw new BookingError('Введите номер телефона +7');
    const serviceId=accessId(body.serviceId);
    if(!dateText(body.date)|| !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.time||''))throw new BookingError('Выберите дату и время');
    await turnstile(env,body.turnstileToken,request.headers.get('cf-connecting-ip'));
    const clientKey=accessId(body.requestKey);
    const data=await db(env,'/rest/v1/rpc/booking_submit',{method:'POST',body:{p_request_key:clientKey,p_service_id:serviceId,p_date:body.date,p_time:body.time,p_name:clean(body.name,160),p_phone:phone,p_address:clean(body.address,400),p_car:clean(body.car,200),p_comment:clean(body.comment,2000)}});
    const b=data?.[0];if(!b)throw new BookingError('Не удалось сохранить заявку',500);
    const uploadToken=await token(env,'upload',b.booking_id,Date.now()+48*3600_000);
    const manageToken=await token(env,'manage',b.booking_id,Date.now()+180*86400_000);
    const result={ok:true,bookingId:b.booking_id,requestId:b.zayavka_id,reference:b.reference,holdUntil:b.hold_until,uploadToken,manageToken,created:b.is_new===true};
    if(b.is_new===true && context.waitUntil){context.waitUntil((async()=>{try{const rows=await db(env,'/rest/v1/booking_notifications?select=id&booking_id=eq.'+encodeURIComponent(b.booking_id)+'&event_type=eq.created&limit=1');if(rows?.[0]){const {notifyBooking}=await import('../lib/booking-server.js');await notifyBooking(env,rows[0].id);}}catch(e){console.error('Telegram notification failed',e.message);}})());}
    return respond(result,201);
  }catch(error){return handleError(error);}
}
