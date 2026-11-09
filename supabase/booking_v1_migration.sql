-- SOLNCANET booking v1. Execute ONCE in Supabase SQL Editor, then deploy.
-- Does not modify or delete existing CRM data.
create extension if not exists pgcrypto;

create table if not exists public.booking_services (
  id uuid primary key default gen_random_uuid(),
  direction text not null check (direction in ('Авто','Архитектура')),
  kind text not null check (kind in ('Авто','Замер','Монтаж')),
  name text not null,
  price_from numeric(12,2) check (price_from is null or price_from >= 0),
  duration_minutes integer check (duration_minutes between 15 and 720 and duration_minutes % 15 = 0),
  slot_step_minutes integer not null default 30 check (slot_step_minutes between 15 and 180 and slot_step_minutes % 15 = 0),
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_service_unique unique(direction,kind,name),
  constraint booking_service_kind_direction check ((direction='Авто' and kind='Авто') or (direction='Архитектура' and kind in ('Замер','Монтаж'))),
  constraint booking_published_requires_duration check (not published or duration_minutes is not null)
);

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  request_key uuid not null unique,
  zayavka_id uuid not null unique references public.zayavki(id) on delete cascade,
  service_id uuid not null references public.booking_services(id),
  direction text not null,
  kind text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'pending' check(status in ('pending','confirmed','proposed','expired','rejected','cancelled','change_requested','cancel_requested')),
  hold_until timestamptz,
  suggested_date date,
  suggested_time time,
  note text,
  sms_scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_valid_interval check(end_at > start_at)
);
create index if not exists booking_requests_day_idx on public.booking_requests (direction,start_at,end_at);
create index if not exists booking_requests_status_idx on public.booking_requests (status,hold_until);
create index if not exists booking_requests_created_idx on public.booking_requests (created_at desc);

create table if not exists public.booking_blocks (
  id uuid primary key default gen_random_uuid(),
  direction text not null check(direction in ('Авто','Архитектура')),
  start_at timestamptz not null,
  end_at timestamptz not null,
  blocked_places smallint not null default 2 check(blocked_places in (1,2)),
  reason text,
  created_at timestamptz not null default now(),
  check(end_at > start_at)
);

create table if not exists public.booking_notifications (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.booking_requests(id) on delete cascade,
  event_type text not null check(event_type in ('created','change_requested','cancel_requested')),
  status text not null default 'queued' check(status in ('queued','sending','sent','failed')),
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_error text,
  sergey_sent boolean not null default false,
  roman_sent boolean not null default false,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  unique(booking_id,event_type)
);

create table if not exists public.booking_uploads (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.booking_requests(id) on delete cascade,
  storage_key text not null unique,
  upload_id text not null,
  name text not null,
  mime_type text not null,
  size_bytes bigint not null check(size_bytes > 0),
  chunk_size integer not null,
  status text not null default 'uploading' check(status in ('uploading','completed','aborted')),
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

-- 2 independent resources in each direction; existing CRM records count too.
-- This function checks the complete interval (not only its start).
create or replace function public.booking_slot_open(
  p_direction text, p_start timestamptz, p_end timestamptz, p_ignore_booking uuid default null, p_ignore_zayavka uuid default null
) returns boolean language plpgsql stable set search_path = public as $$
declare v_time timestamptz; v_used integer;
begin
  if p_end <= p_start or p_direction not in ('Авто','Архитектура') then return false; end if;
  v_time := p_start;
  while v_time < p_end loop
    select coalesce((select sum(b.blocked_places) from public.booking_blocks b where b.direction=p_direction and b.start_at < v_time + interval '15 minutes' and b.end_at > v_time),0)
      + (select count(*) from public.booking_requests r where r.direction=p_direction and r.id is distinct from p_ignore_booking
          and r.zayavka_id is distinct from p_ignore_zayavka
          and r.start_at < v_time + interval '15 minutes' and r.end_at > v_time
          and (r.status in ('confirmed','change_requested','cancel_requested') or (r.status in ('pending','proposed') and r.hold_until > now())))
      + (select count(*) from public.zayavki z where z.direction=p_direction and z.id is distinct from p_ignore_zayavka
          and z.deleted_at is null and z.start_at < v_time + interval '15 minutes'
          and coalesce(z.end_at,z.start_at + interval '60 minutes') > v_time
          and z.status not in ('Отказ','Отказано','Отменена','Удалена','Истекло ожидание')
          and not exists(select 1 from public.booking_requests r where r.zayavka_id = z.id))
      into v_used;
    if v_used >= 2 then return false; end if;
    v_time := v_time + interval '15 minutes';
  end loop;
  return true;
end;$$;

-- Manual CRM writes use the SAME lock and cannot overbook a direction.
create or replace function public.booking_guard_manual_zayavka()
returns trigger language plpgsql set search_path=public as $$
declare v_start timestamptz; v_end timestamptz;
begin
  if new.deleted_at is not null or new.status in ('Отказ','Отказано','Отменена','Удалена','Истекло ожидание')
     or new.start_at is null or new.direction not in ('Авто','Архитектура') then return new; end if;
  if new.start_at < now() then return new; end if;
  perform pg_advisory_xact_lock(771192026);
  v_start := new.start_at;
  v_end := coalesce(new.end_at, new.start_at + interval '60 minutes');
  if not public.booking_slot_open(new.direction,v_start,v_end,null,new.id) then
    raise exception 'В выбранное время заняты оба места направления %',new.direction using errcode='P0001';
  end if;
  return new;
end;$$;
-- Existing manually created records remain untouched; guard applies to new changes.
drop trigger if exists trg_booking_guard_manual on public.zayavki;
create trigger trg_booking_guard_manual before insert or update of direction,start_at,end_at,status,deleted_at
on public.zayavki for each row execute function public.booking_guard_manual_zayavka();

create or replace function public.booking_slots(p_service_id uuid,p_date date)
returns table(slot_time text) language plpgsql stable set search_path=public as $$
declare s record; v_date date; t timestamp; t_end timestamp; v_start timestamptz; v_end timestamptz;
begin
  select * into s from public.booking_services where id=p_service_id and published and duration_minutes is not null;
  if not found then return; end if;
  v_date := (now() at time zone 'Asia/Yekaterinburg')::date;
  if p_date <= v_date or p_date > v_date + 30 then return; end if;
  if extract(isodow from p_date) > 5 then return; end if;
  t := p_date::timestamp + interval '9 hours';
  while t + make_interval(mins=>s.duration_minutes) <= p_date::timestamp + interval '18 hours' loop
    v_start := t at time zone 'Asia/Yekaterinburg';
    v_end := (t + make_interval(mins=>s.duration_minutes)) at time zone 'Asia/Yekaterinburg';
    if public.booking_slot_open(s.direction,v_start,v_end) then
      slot_time := to_char(t,'HH24:MI'); return next;
    end if;
    t := t + make_interval(mins=>s.slot_step_minutes);
  end loop;
end;$$;

-- Atomic registration, duplicate-request protection, admission check and CRM creation.
create or replace function public.booking_submit(
  p_request_key uuid, p_service_id uuid, p_date date, p_time time,
  p_name text, p_phone text, p_address text, p_car text, p_comment text
) returns table(booking_id uuid,zayavka_id uuid,reference text,hold_until timestamptz,is_new boolean)
language plpgsql security definer set search_path = public as $$
declare s record; v_client uuid; v_zid uuid; v_bid uuid; v_start timestamptz; v_end timestamptz; v_hold timestamptz; v_phone text; v_old record; v_meta jsonb;
begin
  perform pg_advisory_xact_lock(771192026);
  select r.id as bid,r.zayavka_id as zid,r.hold_until as h into v_old from public.booking_requests r where r.request_key=p_request_key;
  if found then
    booking_id:=v_old.bid; zayavka_id:=v_old.zid; hold_until:=v_old.h; reference:=upper(left(v_old.bid::text,8)); is_new:=false; return next; return;
  end if;
  select * into s from public.booking_services where id=p_service_id and published and duration_minutes is not null;
  if not found then raise exception 'Услуга недоступна для записи' using errcode='P0001'; end if;
  if p_date <= (now() at time zone 'Asia/Yekaterinburg')::date
     or p_date > (now() at time zone 'Asia/Yekaterinburg')::date + 30
     or extract(isodow from p_date) > 5
     or p_time < '09:00'::time or (p_date+p_time+make_interval(mins=>s.duration_minutes)) > (p_date::timestamp+interval '18 hours')
  then raise exception 'Дата или время вне доступного расписания' using errcode='P0001'; end if;
  if mod((extract(epoch from(p_time - '09:00'::time))/60)::integer,s.slot_step_minutes) <> 0 then
    raise exception 'Недопустимый шаг времени для услуги' using errcode='P0001'; end if;
  v_phone := regexp_replace(coalesce(p_phone,''),'\D','','g');
  if length(v_phone) <> 11 or left(v_phone,1)<>'7' then raise exception 'Укажите телефон в формате +7' using errcode='P0001'; end if;
  if char_length(btrim(coalesce(p_name,''))) < 2 or char_length(p_name)>160 then raise exception 'Укажите имя' using errcode='P0001'; end if;
  if char_length(coalesce(p_comment,''))>2000 or char_length(coalesce(p_address,''))>400 or char_length(coalesce(p_car,''))>200 then
    raise exception 'Слишком длинные данные заявки' using errcode='P0001'; end if;
  if s.direction='Архитектура' and length(trim(coalesce(p_address,'')))<5 then raise exception 'Укажите адрес объекта' using errcode='P0001'; end if;
  if s.direction='Авто' and length(trim(coalesce(p_car,'')))<2 then raise exception 'Укажите марку и модель автомобиля' using errcode='P0001'; end if;
  if (select count(*) from public.booking_requests r join public.zayavki z on z.id=r.zayavka_id
    join public.clients c on c.id=z.client_id
    where c.phone_norm = v_phone and r.created_at > now()-interval '1 hour') >= 5 then
    raise exception 'Слишком много заявок за час. Позвоните нам.' using errcode='P0001'; end if;
  v_start := (p_date+p_time) at time zone 'Asia/Yekaterinburg';
  v_end := v_start + make_interval(mins=>s.duration_minutes);
  if not public.booking_slot_open(s.direction,v_start,v_end) then
    raise exception 'Это время уже занято. Выберите другое.' using errcode='P0001'; end if;
  insert into public.clients(name,phone,source)
  values(trim(p_name),'+'||v_phone,'Онлайн-запись')
  on conflict(phone_norm) where phone_norm is not null and phone_norm <> '' and deleted_at is null
  do update set name=excluded.name, phone=excluded.phone
  returning id into v_client;
  v_meta := jsonb_build_object(
    'source','С сайта','online_booking',true,'booking_kind',s.kind,
    'old_fields',jsonb_build_object('Имя клиента',trim(p_name),'Телефон','+'||v_phone,
      'Направление',s.direction,'Услуга',s.name,'Статус','Ожидает подтверждения',
      'Источник','С сайта','Дата записи',p_date::text,'Время записи',to_char(p_time,'HH24:MI'),
      'Адрес',coalesce(p_address,''),'Авто',coalesce(p_car,''),
      'Комментарий клиента',coalesce(p_comment,''),'Тип записи',s.kind)
  );
  insert into public.zayavki(client_id,direction,title,service,status,visit_date,visit_time,start_at,end_at,address,client_comment,meta)
  values(v_client,s.direction,s.name,s.name,'Ожидает подтверждения',p_date,p_time,v_start,v_end,
    case when s.direction='Архитектура' then p_address else '' end,
    case when s.direction='Авто' then 'Автомобиль: '||p_car||E'\n'||coalesce(p_comment,'') else coalesce(p_comment,'') end,v_meta)
  returning id into v_zid;
  v_hold := least(now()+interval '24 hours',v_start);
  insert into public.booking_requests(request_key,zayavka_id,service_id,direction,kind,start_at,end_at,status,hold_until)
  values(p_request_key,v_zid,s.id,s.direction,s.kind,v_start,v_end,'pending',v_hold)
  returning id into v_bid;
  insert into public.booking_notifications(booking_id,event_type) values(v_bid,'created');
  booking_id:=v_bid; zayavka_id:=v_zid; reference:=upper(left(v_bid::text,8)); hold_until:=v_hold; is_new:=true;
  return next;
end;$$;

-- Approval and rebooking are serialised using the same advisory lock.
create or replace function public.booking_admin_transition(
  p_booking_id uuid,p_action text,p_date date default null,p_time time default null,p_reason text default null
) returns table(booking_id uuid,zayavka_id uuid,new_status text,changed boolean)
language plpgsql security definer set search_path=public as $$
declare r public.booking_requests%rowtype; s public.booking_services%rowtype; v_start timestamptz; v_end timestamptz; v_status text; v_zstatus text; v_hold timestamptz;
begin
  perform pg_advisory_xact_lock(771192026);
  select * into r from public.booking_requests where id=p_booking_id for update;
  if not found then raise exception 'Заявка не найдена' using errcode='P0001'; end if;
  select * into s from public.booking_services where id=r.service_id;
  if p_action='confirm' and r.status='confirmed' then
    booking_id:=r.id; zayavka_id:=r.zayavka_id; new_status:=r.status; changed:=false; return next; return;
  end if;
  if r.status in ('cancelled','rejected') then raise exception 'Заявка закрыта' using errcode='P0001'; end if;
  if p_action in ('propose','confirm') then
    if p_action='propose' and (p_date is null or p_time is null) then raise exception 'Укажите новую дату и время' using errcode='P0001'; end if;
    if p_action='confirm' and p_date is null and p_time is null then
      v_start:=r.start_at; v_end:=r.end_at;
    elsif p_date is not null and p_time is not null then
      if p_date < (now() at time zone 'Asia/Yekaterinburg')::date
        or extract(isodow from p_date)>5 or p_time<'09:00'::time
        or (p_date+p_time+make_interval(mins=>s.duration_minutes))>(p_date::timestamp+interval '18 hours') then
          raise exception 'Новая дата или время вне графика' using errcode='P0001';
      end if;
      v_start:=(p_date+p_time) at time zone 'Asia/Yekaterinburg';
      v_end:=v_start+make_interval(mins=>s.duration_minutes);
    else raise exception 'Укажите и дату, и время' using errcode='P0001'; end if;
    if v_start <= now() then raise exception 'Выбранное время уже прошло' using errcode='P0001'; end if;
    if not public.booking_slot_open(r.direction,v_start,v_end,r.id,r.zayavka_id) then
      raise exception 'На выбранное время уже нет мест' using errcode='P0001'; end if;
    if p_action='confirm' then
      v_status:='confirmed'; v_zstatus:='Подтверждена'; v_hold:=null;
    else
      v_status:='proposed'; v_zstatus:='Предложено другое время'; v_hold:=least(now()+interval '24 hours',v_start);
    end if;
    update public.booking_requests set status=v_status,start_at=v_start,end_at=v_end,hold_until=v_hold,note=left(coalesce(p_reason,''),1000),updated_at=now()
      where id=r.id;
    update public.zayavki set status=v_zstatus,visit_date=(v_start at time zone 'Asia/Yekaterinburg')::date,
      visit_time=(v_start at time zone 'Asia/Yekaterinburg')::time,start_at=v_start,end_at=v_end,
      meta=jsonb_set(jsonb_set(meta,'{old_fields,Статус}',to_jsonb(v_zstatus),true),'{old_fields,Дата записи}',to_jsonb(to_char(v_start at time zone 'Asia/Yekaterinburg','YYYY-MM-DD')),true)
      where id=r.zayavka_id;
    update public.zayavki set meta=jsonb_set(meta,'{old_fields,Время записи}',to_jsonb(to_char(v_start at time zone 'Asia/Yekaterinburg','HH24:MI')),true) where id=r.zayavka_id;
    if p_action='propose' then
      update public.sms_queue set status='cancelled',cancelled_at=now(),error='Предложено новое время' where zayavka_id=r.zayavka_id and status='queued' and sms_type in ('reminder_day','reminder_2h');
    end if;
    if p_action='confirm' then
      -- Only one notification batch: status transition is serialized, repeated confirm above is no-op.
      update public.sms_queue set status='cancelled',cancelled_at=now(),error='Время изменено' where zayavka_id=r.zayavka_id and status='queued' and sms_type in ('reminder_day','reminder_2h');
      insert into public.sms_queue(zayavka_id,client_id,phone,sms_type,status,send_at,template_name,message,manual_only)
        select z.id,z.client_id,c.phone,'confirmation','queued',now()+interval '1 minute','Подтверждение записи',
          'СОЛНЦАНЕТ: запись оформлена на '||to_char(v_start at time zone 'Asia/Yekaterinburg','DD.MM')||' в '||to_char(v_start at time zone 'Asia/Yekaterinburg','HH24:MI')||'.',false
          from public.zayavki z join public.clients c on c.id=z.client_id where z.id=r.zayavka_id;
      if v_start > now()+interval '24 hours' then
        insert into public.sms_queue(zayavka_id,client_id,phone,sms_type,status,send_at,template_name,message,manual_only)
          select z.id,z.client_id,c.phone,'reminder_day','queued',v_start-interval '24 hours','Напоминание за день',
          'СОЛНЦАНЕТ: напоминаем о записи '||to_char(v_start at time zone 'Asia/Yekaterinburg','DD.MM')||' в '||to_char(v_start at time zone 'Asia/Yekaterinburg','HH24:MI')||'.',false
          from public.zayavki z join public.clients c on c.id=z.client_id where z.id=r.zayavka_id;
      end if;
      if v_start > now()+interval '2 hours' then
        insert into public.sms_queue(zayavka_id,client_id,phone,sms_type,status,send_at,template_name,message,manual_only)
          select z.id,z.client_id,c.phone,'reminder_2h','queued',v_start-interval '2 hours','Напоминание за 2 часа',
          'СОЛНЦАНЕТ: до записи осталось 2 часа.',false
          from public.zayavki z join public.clients c on c.id=z.client_id where z.id=r.zayavka_id;
      end if;
      update public.booking_requests set sms_scheduled_at=now() where id=r.id;
    end if;
  elsif p_action in ('reject','cancel') then
    v_status:=case when p_action='reject' then 'rejected' else 'cancelled' end;
    v_zstatus:=case when p_action='reject' then 'Отказано' else 'Отменена' end;
    update public.booking_requests set status=v_status,hold_until=null,note=left(coalesce(p_reason,''),1000),updated_at=now() where id=r.id;
    update public.zayavki set status=v_zstatus,meta=jsonb_set(meta,'{old_fields,Статус}',to_jsonb(v_zstatus),true) where id=r.zayavka_id;
    update public.sms_queue set status='cancelled',cancelled_at=now(),error='Заявка отменена' where zayavka_id=r.zayavka_id and status='queued';
  elsif p_action='dismiss_change' then
    if r.status not in ('change_requested','cancel_requested') then raise exception 'Нет запроса на изменение' using errcode='P0001'; end if;
    v_status:='confirmed'; v_zstatus:='Подтверждена';
    update public.booking_requests set status=v_status,suggested_date=null,suggested_time=null,note=null,updated_at=now() where id=r.id;
    update public.zayavki set status=v_zstatus,meta=jsonb_set(meta,'{old_fields,Статус}',to_jsonb(v_zstatus),true) where id=r.zayavka_id;
  else raise exception 'Недопустимое действие' using errcode='P0001'; end if;
  booking_id:=r.id; zayavka_id:=r.zayavka_id; new_status:=v_status; changed:=true; return next;
end;$$;

create or replace function public.booking_client_request(p_booking_id uuid,p_action text,p_date date default null,p_time time default null,p_comment text default null)
returns text language plpgsql security definer set search_path=public as $$
declare r public.booking_requests%rowtype; v_status text; v_zstatus text;
begin
  perform pg_advisory_xact_lock(771192026);
  select * into r from public.booking_requests where id=p_booking_id for update;
  if not found or r.status not in ('confirmed','change_requested','cancel_requested') then raise exception 'Запись недоступна для изменения' using errcode='P0001'; end if;
  if r.status in ('change_requested','cancel_requested') and r.updated_at > now()-interval '10 minutes' then raise exception 'Запрос уже отправлен. Повторите позднее.' using errcode='P0001'; end if;
  if p_action='cancel' then v_status:='cancel_requested'; v_zstatus:='Запрошена отмена';
  elsif p_action='change' then
    if p_date is null or p_time is null or p_date < (now() at time zone 'Asia/Yekaterinburg')::date then raise exception 'Укажите желаемую дату и время' using errcode='P0001'; end if;
    v_status:='change_requested'; v_zstatus:='Запрошен перенос';
  else raise exception 'Недопустимое действие' using errcode='P0001'; end if;
  update public.booking_requests set status=v_status,suggested_date=p_date,suggested_time=p_time,note=left(coalesce(p_comment,''),1000),updated_at=now() where id=r.id;
  update public.zayavki set status=v_zstatus,meta=jsonb_set(meta,'{old_fields,Статус}',to_jsonb(v_zstatus),true) where id=r.zayavka_id;
  insert into public.booking_notifications(booking_id,event_type)
  values(r.id,case when p_action='cancel' then 'cancel_requested' else 'change_requested' end)
  on conflict(booking_id,event_type) do update set status='queued',attempts=0,next_attempt_at=now(),last_error=null,sergey_sent=false,roman_sent=false;
  return v_status;
end;$$;

-- Expire holds atomically; never overwrite a record confirmed in another request.
create or replace function public.booking_expire_holds()
returns integer language plpgsql security definer set search_path=public as $$
declare r record; v_count integer:=0;
begin
  perform pg_advisory_xact_lock(771192026);
  for r in select id,zayavka_id from public.booking_requests where status in ('pending','proposed') and hold_until <= now() limit 100 for update loop
    update public.booking_requests set status='expired',updated_at=now() where id=r.id;
    update public.zayavki set status='Истекло ожидание',meta=jsonb_set(meta,'{old_fields,Статус}',to_jsonb('Истекло ожидание'::text),true) where id=r.zayavka_id;
    v_count:=v_count+1;
  end loop;
  return v_count;
end;$$;

-- Restrict privileged RPCs and data tables. Browser never has the service-role key.
revoke all on public.booking_services,public.booking_requests,public.booking_blocks,public.booking_notifications,public.booking_uploads from anon,authenticated;
revoke all on function public.booking_submit(uuid,uuid,date,time,text,text,text,text,text) from public,anon,authenticated;
revoke all on function public.booking_admin_transition(uuid,text,date,time,text) from public,anon,authenticated;
revoke all on function public.booking_client_request(uuid,text,date,time,text) from public,anon,authenticated;
revoke all on function public.booking_slots(uuid,date) from public,anon,authenticated;
revoke all on function public.booking_slot_open(text,timestamptz,timestamptz,uuid,uuid) from public,anon,authenticated;
revoke all on function public.booking_expire_holds() from public,anon,authenticated;
grant execute on function public.booking_submit(uuid,uuid,date,time,text,text,text,text,text) to service_role;
grant execute on function public.booking_admin_transition(uuid,text,date,time,text) to service_role;
grant execute on function public.booking_client_request(uuid,text,date,time,text) to service_role;
grant execute on function public.booking_slots(uuid,date) to service_role;
grant execute on function public.booking_slot_open(text,timestamptz,timestamptz,uuid,uuid) to service_role;
grant execute on function public.booking_expire_holds() to service_role;

-- No RLS policy for public clients. All booking API calls run in Cloudflare server functions.
alter table public.booking_services enable row level security;
alter table public.booking_requests enable row level security;
alter table public.booking_blocks enable row level security;
alter table public.booking_notifications enable row level security;
alter table public.booking_uploads enable row level security;

-- Publish ONLY after the manager sets actual duration and verifies each price.
insert into public.booking_services(direction,kind,name,sort_order) values('Архитектура','Замер','Тонировка балконов и окон',1) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,sort_order) values('Архитектура','Замер','Тонировка витрин',2) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,sort_order) values('Архитектура','Замер','Бронирование стекол и витрин',3) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,sort_order) values('Архитектура','Замер','Декоративные пленки для офисных перегородок',4) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,sort_order) values('Архитектура','Замер','Замер / консультация',5) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,sort_order) values('Архитектура','Замер','Другое по архитектуре',6) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,sort_order) values('Архитектура','Монтаж','Тонировка балконов и окон',1) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,sort_order) values('Архитектура','Монтаж','Тонировка витрин',2) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,sort_order) values('Архитектура','Монтаж','Бронирование стекол и витрин',3) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,sort_order) values('Архитектура','Монтаж','Декоративные пленки для офисных перегородок',4) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,sort_order) values('Архитектура','Монтаж','Другое по архитектуре',6) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,price_from,sort_order) values('Авто','Авто','Тонирование задней полусферы',6000.0,1) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,price_from,sort_order) values('Авто','Авто','Форточки',1000.0,2) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,price_from,sort_order) values('Авто','Авто','Тонирование передней полусферы',7000.0,3) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,price_from,sort_order) values('Авто','Авто','Тонирование передних/задних боковых стекол',4000.0,4) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,price_from,sort_order) values('Авто','Авто','Тонирование 1 бокового стекла',2000.0,5) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,price_from,sort_order) values('Авто','Авто','Тонирование лобового стекла',4000.0,6) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,price_from,sort_order) values('Авто','Авто','Тонирование заднего стекла',4000.0,7) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,price_from,sort_order) values('Авто','Авто','Полоса на лобовое стекло',1200.0,8) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,price_from,sort_order) values('Авто','Авто','Тонирование панорамы',6000.0,9) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,price_from,sort_order) values('Авто','Авто','Тонирование люка',2000.0,10) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,price_from,sort_order) values('Авто','Авто','Демонтаж пленки',null,11) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,price_from,sort_order) values('Авто','Авто','Демонтаж клея',null,12) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,price_from,sort_order) values('Авто','Авто','Бронирование лобового стекла',24000.0,13) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,price_from,sort_order) values('Авто','Авто','Бронирование фар',6000.0,14) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,price_from,sort_order) values('Авто','Авто','Бронирование 1 фары',3000.0,15) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,price_from,sort_order) values('Авто','Авто','Бронирование противотуманных фар (1 шт)',500.0,16) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,price_from,sort_order) values('Авто','Авто','Бронирование порогов',500.0,17) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,price_from,sort_order) values('Авто','Авто','Полоса на крышу',4000.0,18) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,price_from,sort_order) values('Авто','Авто','Антибликовая плёнка на монитор',2000.0,19) on conflict(direction,kind,name) do nothing;
insert into public.booking_services(direction,kind,name,price_from,sort_order) values('Авто','Авто','Доплата',null,20) on conflict(direction,kind,name) do nothing;
