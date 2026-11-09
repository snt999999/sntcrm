-- SOLNCANET: online booking public services from "Лист Microsoft Excel.xlsx" (09.11.2026).
-- Run ONCE after booking_v1_migration.sql in the existing Supabase project.
-- Safe to repeat: upsert by (direction,kind,name), no deletion of old services/bookings.
-- Changes ONLY public.booking_services; internal CRM catalog is not touched.
-- Policy override: ALL architecture measurement appointments are FREE.
-- Two car services have no price or duration in Excel: do not publish them until supplied.
BEGIN;

INSERT INTO public.booking_services
  (direction, kind, name, price_from, duration_minutes, sort_order, published, updated_at)
SELECT v.direction, v.kind, v.name, v.price_from, v.duration_minutes, v.sort_order,
       (v.duration_minutes IS NOT NULL), now()
FROM (VALUES
  ('Архитектура', 'Замер', 'Тонировка балконов и окон', 0, 60, 1),
  ('Архитектура', 'Монтаж', 'Тонировка балконов и окон', 1600, 60, 1),
  ('Архитектура', 'Замер', 'Тонировка витрин', 0, 60, 2),
  ('Архитектура', 'Монтаж', 'Тонировка витрин', 1600, 60, 2),
  ('Архитектура', 'Замер', 'Бронирование стекол и витрин', 0, 60, 3),
  ('Архитектура', 'Монтаж', 'Бронирование стекол и витрин', 1600, 60, 3),
  ('Архитектура', 'Замер', 'Декоративные пленки для офисных перегородок', 0, 60, 4),
  ('Архитектура', 'Монтаж', 'Декоративные пленки для офисных перегородок', 1600, 60, 4),
  ('Архитектура', 'Замер', 'Замер / консультация', 0, 60, 5),
  ('Архитектура', 'Замер', 'Другое по архитектуре', 0, 60, 6),
  ('Архитектура', 'Монтаж', 'Другое по архитектуре', 1600, 60, 6),
  ('Авто', 'Авто', 'Тонирование задней полусферы', 6000, 180, 1),
  ('Авто', 'Авто', 'Тонирование передней полусферы', 7000, 180, 3),
  ('Авто', 'Авто', 'Тонирование передних/задних боковых стекол', 4000, 90, 4),
  ('Авто', 'Авто', 'Тонирование 1 бокового стекла', 2000, 60, 5),
  ('Авто', 'Авто', 'Тонирование лобового стекла', 4000, 60, 6),
  ('Авто', 'Авто', 'Тонирование заднего стекла', 4000, 60, 7),
  ('Авто', 'Авто', 'Полоса на лобовое стекло', 1200, 60, 8),
  ('Авто', 'Авто', 'Тонирование панорамы', 6000, 120, 9),
  ('Авто', 'Авто', 'Тонирование люка', 2000, 60, 10),
  ('Авто', 'Авто', 'Демонтаж пленки', NULL, NULL, 11),
  ('Авто', 'Авто', 'Демонтаж клея', NULL, NULL, 12),
  ('Авто', 'Авто', 'Бронирование лобового стекла', 24000, 120, 13),
  ('Авто', 'Авто', 'Бронирование фар', 6000, 120, 14),
  ('Авто', 'Авто', 'Бронирование порогов', 500, 60, 17),
  ('Авто', 'Авто', 'Полоса на крышу', 4000, 60, 18),
  ('Авто', 'Авто', 'Антибликовая плёнка на монитор', 2000, 60, 19)
) AS v(direction,kind,name,price_from,duration_minutes,sort_order)
WHERE TRUE
ON CONFLICT (direction,kind,name) DO UPDATE
SET price_from = EXCLUDED.price_from,
    duration_minutes = EXCLUDED.duration_minutes,
    sort_order = EXCLUDED.sort_order,
    published = EXCLUDED.published,
    updated_at = now();

-- These four items were removed from the customer's public online catalog.
-- Existing booking_requests may still reference the rows, so do NOT delete them.
UPDATE public.booking_services SET published = false, updated_at=now()
WHERE direction = 'Авто' AND kind='Авто' AND name IN ('Форточки', 'Бронирование 1 фары', 'Бронирование противотуманных фар (1 шт)', 'Доплата');

-- Free measurement is enforced even if managers edit services later.
UPDATE public.booking_services
SET price_from=0, updated_at=now()
WHERE direction='Архитектура' AND kind='Замер' AND price_from IS DISTINCT FROM 0;

-- Existing free-measurement constraints, if any, are respected.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='booking_measurement_is_free'
      AND conrelid='public.booking_services'::regclass
  ) THEN
    ALTER TABLE public.booking_services
    ADD CONSTRAINT booking_measurement_is_free CHECK (kind <> 'Замер' OR price_from = 0);
  END IF;
END $$;
COMMIT;

-- Verify: 11 architecture options + 14 bookable auto services = 25 published options.
SELECT direction,kind,name,price_from,duration_minutes,published
FROM public.booking_services
WHERE (direction='Архитектура' OR direction='Авто')
ORDER BY direction,kind,sort_order,name;
