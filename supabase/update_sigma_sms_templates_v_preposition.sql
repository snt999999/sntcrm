-- Optional: update SMS template settings in existing Supabase project
update public.settings
set value = jsonb_build_object(
  'confirmation', 'СОЛНЦАНЕТ: запись оформлена на {Дата} в {Время}.',
  'reminder_day', 'СОЛНЦАНЕТ: напоминаем о записи {Дата} в {Время}.',
  'reminder_2h', 'СОЛНЦАНЕТ: до записи осталось 2 часа.',
  'reschedule', 'СОЛНЦАНЕТ: запись перенесена на {Дата} в {Время}.',
  'review', 'Спасибо, что выбрали СОЛНЦАНЕТ! Оставьте отзыв: https://clck.su/solncanet'
), updated_at = now()
where key = 'sms_templates';

select 'SOLNCANET Sigma SMS templates updated: date + в + time' as result;
