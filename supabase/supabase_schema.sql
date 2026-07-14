-- ============================================================
-- СОЛНЦАНЕТ CRM — Supabase schema
-- Версия: 2026-07-14
-- Назначение: заменить NocoDB на Supabase/PostgreSQL.
--
-- Как запускать:
-- 1) Supabase → SQL Editor → New query
-- 2) Вставить весь этот файл
-- 3) Нажать Run
-- ============================================================

-- UUID-генератор
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Технические функции
-- ------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.normalize_phone(p_phone text)
returns text
language sql
immutable
as $$
  select case
    when p_phone is null then null
    else regexp_replace(p_phone, '\D', '', 'g')
  end;
$$;

-- ------------------------------------------------------------
-- Клиенты
-- ------------------------------------------------------------

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),

  name text,
  phone text not null,
  phone_norm text generated always as (public.normalize_phone(phone)) stored,
  email text,

  source text,
  comment text,
  admin_comment text,

  -- Для мягкого удаления
  deleted_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists clients_phone_norm_unique
on public.clients (phone_norm)
where phone_norm is not null and phone_norm <> '' and deleted_at is null;

create index if not exists clients_name_idx on public.clients using gin (to_tsvector('simple', coalesce(name, '')));
create index if not exists clients_phone_idx on public.clients (phone_norm);
create index if not exists clients_created_idx on public.clients (created_at desc);

drop trigger if exists trg_clients_updated_at on public.clients;
create trigger trg_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Заявки
-- ------------------------------------------------------------

create table if not exists public.zayavki (
  id uuid primary key default gen_random_uuid(),

  client_id uuid references public.clients(id) on delete set null,

  -- Направление: Авто / Архитектура / Другое
  direction text not null default 'Архитектура',

  -- Основные поля заявки
  title text,
  service text,
  status text not null default 'Новая',

  -- Дата/время
  visit_date date,
  visit_time time,
  start_at timestamptz,
  end_at timestamptz,

  -- Для архитектуры
  address text,
  total_m2 numeric(12, 2),
  material text,

  -- Для авто и сложных заявок услуги лежат отдельно в zayavka_services,
  -- но jsonb оставлен для совместимости с текущим сайтом.
  auto_services jsonb not null default '[]'::jsonb,

  -- Деньги
  total_amount numeric(12, 2),
  prepayment_amount numeric(12, 2),
  paid_amount numeric(12, 2),

  -- Комментарии
  client_comment text,
  admin_comment text,

  -- Интеграции
  calendar_event_id text,
  external_id text,
  meta jsonb not null default '{}'::jsonb,

  -- Мягкое удаление / корзина
  deleted_at timestamptz,
  deleted_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists zayavki_client_idx on public.zayavki (client_id);
create index if not exists zayavki_direction_idx on public.zayavki (direction);
create index if not exists zayavki_status_idx on public.zayavki (status);
create index if not exists zayavki_visit_date_idx on public.zayavki (visit_date);
create index if not exists zayavki_start_at_idx on public.zayavki (start_at);
create index if not exists zayavki_deleted_idx on public.zayavki (deleted_at);
create index if not exists zayavki_created_idx on public.zayavki (created_at desc);

drop trigger if exists trg_zayavki_updated_at on public.zayavki;
create trigger trg_zayavki_updated_at
before update on public.zayavki
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Строки услуг внутри заявки
-- Для Авто: каждая услуга может иметь свой материал.
-- ------------------------------------------------------------

create table if not exists public.zayavka_services (
  id uuid primary key default gen_random_uuid(),

  zayavka_id uuid not null references public.zayavki(id) on delete cascade,

  direction text,
  service_name text not null,
  material text,

  quantity numeric(12, 2),
  m2 numeric(12, 2),
  unit_price numeric(12, 2),
  amount numeric(12, 2),

  installer text,
  installer_pay numeric(12, 2),

  comment text,
  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists zayavka_services_zayavka_idx on public.zayavka_services (zayavka_id);
create index if not exists zayavka_services_sort_idx on public.zayavka_services (zayavka_id, sort_order);

drop trigger if exists trg_zayavka_services_updated_at on public.zayavka_services;
create trigger trg_zayavka_services_updated_at
before update on public.zayavka_services
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- SMS очередь
-- Автоматически: confirmation, reminder_day, reminder_2h.
-- Вручную: reschedule, review.
-- ------------------------------------------------------------

create table if not exists public.sms_queue (
  id uuid primary key default gen_random_uuid(),

  zayavka_id uuid references public.zayavki(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,

  phone text not null,
  phone_norm text generated always as (public.normalize_phone(phone)) stored,

  -- Типы:
  -- confirmation / reminder_day / reminder_2h / reschedule / review / custom
  sms_type text not null,

  -- queued / sent / cancelled / failed / skipped
  status text not null default 'queued',

  send_at timestamptz,
  sent_at timestamptz,
  cancelled_at timestamptz,

  template_name text,
  message text not null,

  provider text default 'sigmasms',
  provider_message_id text,
  error text,

  manual_only boolean not null default false,

  meta jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sms_queue_status_send_idx on public.sms_queue (status, send_at);
create index if not exists sms_queue_zayavka_idx on public.sms_queue (zayavka_id);
create index if not exists sms_queue_client_idx on public.sms_queue (client_id);
create index if not exists sms_queue_phone_idx on public.sms_queue (phone_norm);

drop trigger if exists trg_sms_queue_updated_at on public.sms_queue;
create trigger trg_sms_queue_updated_at
before update on public.sms_queue
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- История действий
-- ------------------------------------------------------------

create table if not exists public.history_log (
  id uuid primary key default gen_random_uuid(),

  entity_type text not null, -- zayavka / client / sms / file / system
  entity_id uuid,

  action text not null,      -- created / updated / rescheduled / deleted / restored / sms_sent
  actor text,
  comment text,

  old_data jsonb,
  new_data jsonb,

  created_at timestamptz not null default now()
);

create index if not exists history_entity_idx on public.history_log (entity_type, entity_id, created_at desc);
create index if not exists history_created_idx on public.history_log (created_at desc);

-- ------------------------------------------------------------
-- Файлы
-- ------------------------------------------------------------

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),

  zayavka_id uuid references public.zayavki(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,

  name text not null,
  url text,
  mime_type text,
  size_bytes bigint,

  source text default 'google_drive',
  external_id text,
  comment text,

  deleted_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists files_zayavka_idx on public.files (zayavka_id);
create index if not exists files_client_idx on public.files (client_id);

drop trigger if exists trg_files_updated_at on public.files;
create trigger trg_files_updated_at
before update on public.files
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Сотрудники / монтажники
-- ------------------------------------------------------------

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  role text,
  direction text,
  phone text,
  is_active boolean not null default true,

  meta jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists staff_name_unique on public.staff (lower(name));

drop trigger if exists trg_staff_updated_at on public.staff;
create trigger trg_staff_updated_at
before update on public.staff
for each row execute function public.set_updated_at();

-- Начальный список сотрудников, можно менять в Supabase.
insert into public.staff (name, role, direction)
values
  ('Сергей', 'admin', 'Все'),
  ('Роман', 'admin/installer', 'Авто'),
  ('Никита П.', 'installer', 'Архитектура'),
  ('Андрей Ш.', 'installer', 'Архитектура'),
  ('Никита К.', 'installer', 'Архитектура'),
  ('Дмитрий П.', 'installer', 'Архитектура')
on conflict do nothing;

-- ------------------------------------------------------------
-- Настройки
-- ------------------------------------------------------------

create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  comment text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_settings_updated_at on public.settings;
create trigger trg_settings_updated_at
before update on public.settings
for each row execute function public.set_updated_at();

insert into public.settings (key, value, comment)
values
  ('crm', '{"timezone_offset_minutes":300,"timezone":"Asia/Yekaterinburg"}'::jsonb, 'Основные настройки CRM'),
  ('sms_templates', '{
    "confirmation":"СОЛНЦАНЕТ: запись оформлена на {Дата} {Время}.",
    "reminder_day":"СОЛНЦАНЕТ: напоминаем о записи {Дата}, {Время}.",
    "reminder_2h":"СОЛНЦАНЕТ: до записи осталось 2 часа.",
    "reschedule":"СОЛНЦАНЕТ: запись перенесена на {Дата} {Время}.",
    "review":"Спасибо, что выбрали СОЛНЦАНЕТ! Оставьте отзыв: https://clck.su/solncanet"
  }'::jsonb, 'SMS шаблоны')
on conflict (key) do update set
  value = excluded.value,
  comment = excluded.comment,
  updated_at = now();

-- ------------------------------------------------------------
-- Удобные представления для проверки
-- ------------------------------------------------------------

create or replace view public.active_zayavki as
select
  z.id,
  z.created_at,
  z.updated_at,
  z.direction,
  z.status,
  z.visit_date,
  z.visit_time,
  z.start_at,
  c.name as client_name,
  c.phone as client_phone,
  z.service,
  z.address,
  z.total_m2,
  z.total_amount,
  z.admin_comment
from public.zayavki z
left join public.clients c on c.id = z.client_id
where z.deleted_at is null;

create or replace view public.deleted_zayavki as
select
  z.id,
  z.deleted_at,
  z.direction,
  z.status,
  z.visit_date,
  z.visit_time,
  c.name as client_name,
  c.phone as client_phone,
  z.service,
  z.address,
  z.total_amount,
  z.deleted_reason
from public.zayavki z
left join public.clients c on c.id = z.client_id
where z.deleted_at is not null;

-- ------------------------------------------------------------
-- RLS
-- Включаем защиту. Браузер не должен напрямую писать в базу.
-- Наши Cloudflare Functions будут использовать SUPABASE_SERVICE_ROLE_KEY.
-- ------------------------------------------------------------

alter table public.clients enable row level security;
alter table public.zayavki enable row level security;
alter table public.zayavka_services enable row level security;
alter table public.sms_queue enable row level security;
alter table public.history_log enable row level security;
alter table public.files enable row level security;
alter table public.staff enable row level security;
alter table public.settings enable row level security;

-- Политики для чтения через anon НЕ создаём специально.
-- Это означает: с публичным anon key из браузера таблицы не читаются и не пишутся.
-- Все действия должны идти через Cloudflare Functions с service_role key.

-- ------------------------------------------------------------
-- Финальная проверка
-- ------------------------------------------------------------

select 'SOLNCANET Supabase schema installed successfully' as result;
