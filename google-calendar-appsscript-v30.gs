/**
 * СОЛНЦАНЕТ — Google Calendar sync Web App
 * Поддерживает:
 *  - health: проверка связи
 *  - list: загрузка событий для импорта в заявки
 *  - create/upsert: создание или обновление события из заявки/быстрой записи
 *
 * В Apps Script установите:
 * Execute as: Me
 * Who has access: Anyone
 */
const IMPORT_TOKEN = 'SOLNCANET_CALENDAR_2026_4C7A9D2E';
const CALENDAR_ID = 'primary';
const TIMEZONE = 'Asia/Yekaterinburg';
const DEFAULT_DURATION_MINUTES = 60;

function doGet(e) {
  return handleRequest_(e && e.parameter ? e.parameter : {});
}

function doPost(e) {
  let body = {};
  try {
    body = JSON.parse(e.postData && e.postData.contents ? e.postData.contents : '{}');
  } catch (err) {
    return json_({ ok: false, error: 'Некорректный JSON: ' + err.message });
  }
  return handleRequest_(body);
}

function handleRequest_(input) {
  try {
    const token = String(input.token || '').trim();
    if (token !== IMPORT_TOKEN) return json_({ ok: false, error: 'Неверный токен календаря' });
    const action = String(input.action || 'health').toLowerCase();
    const calendar = getCalendar_();
    if (action === 'health') return json_({ ok: true, success: true, service: 'SOLNCANET Google Calendar sync', calendarName: calendar.getName(), calendarId: CALENDAR_ID, timezone: TIMEZONE });
    if (action === 'list') return json_(listEvents_(calendar, input));
    if (action === 'create' || action === 'upsert' || action === 'update') return json_(createOrUpdateEvent_(calendar, input));
    return json_({ ok: false, error: 'Неизвестное действие календаря: ' + action });
  } catch (err) {
    return json_({ ok: false, error: err.message || String(err) });
  }
}

function getCalendar_() {
  const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
  if (!calendar) throw new Error('Не удалось открыть календарь: ' + CALENDAR_ID);
  return calendar;
}

function listEvents_(calendar, input) {
  const from = validDate_(input.dateFrom) || today_();
  const to = validDate_(input.dateTo) || addDays_(from, 7);
  const start = new Date(from + 'T00:00:00+05:00');
  const end = new Date(addDays_(to, 1) + 'T00:00:00+05:00');
  const events = calendar.getEvents(start, end).map((ev) => eventToPayload_(ev));
  return { ok: true, success: true, dateFrom: from, dateTo: to, events };
}

function createOrUpdateEvent_(calendar, input) {
  const fields = input.fields || {};
  const date = validDate_(fields['Дата записи']);
  const time = validTime_(fields['Время записи']);
  if (!date || !time) throw new Error('Для создания события нужны поля "Дата записи" и "Время записи"');

  const start = new Date(date + 'T' + time + ':00+05:00');
  const minutes = Number(input.durationMinutes || fields['Длительность'] || DEFAULT_DURATION_MINUTES) || DEFAULT_DURATION_MINUTES;
  const end = new Date(start.getTime() + minutes * 60000);
  const title = buildTitle_(fields);
  const description = buildDescription_(fields, input.recordId || '');
  const location = String(fields['Адрес'] || '').trim();
  const eventId = String(input.eventId || fields['Google Calendar Event ID'] || '').trim();

  let ev = null;
  if (eventId) {
    try { ev = calendar.getEventById(eventId); } catch (err) { ev = null; }
  }

  const updatedExisting = Boolean(ev);
  if (ev) {
    ev.setTitle(title);
    ev.setTime(start, end);
    ev.setDescription(description);
    if (location) ev.setLocation(location); else ev.setLocation('');
  } else {
    ev = calendar.createEvent(title, start, end, { description, location });
  }

  const attachmentResult = syncEventAttachments_(ev, fields);

  return {
    ok: true,
    success: true,
    created: !updatedExisting,
    updated: updatedExisting,
    eventId: ev.getId(),
    htmlLink: buildEventLink_(CALENDAR_ID, ev.getId()),
    title: ev.getTitle(),
    start: formatDateTime_(ev.getStartTime()),
    end: formatDateTime_(ev.getEndTime()),
    attachmentResult: attachmentResult
  };
}

function buildTitle_(fields) {
  const name = String(fields['Имя клиента'] || fields['ФИО'] || 'Клиент').trim();
  const service = String(fields['Услуга'] || 'Запись').trim();
  return 'СОЛНЦАНЕТ — ' + name + ' — ' + service;
}

function buildDescription_(fields, recordId) {
  const rows = [];
  if (recordId) rows.push('ID заявки: ' + recordId);
  rows.push('Клиент: ' + String(fields['Имя клиента'] || fields['ФИО'] || '').trim());
  if (fields['Компания']) rows.push('Компания: ' + fields['Компания']);
  if (fields['Телефон']) rows.push('Телефон: ' + fields['Телефон']);
  if (fields['Услуга']) rows.push('Услуга: ' + fields['Услуга']);
  if (fields['Адрес']) rows.push('Адрес: ' + fields['Адрес']);
  if (fields['м2'] || fields['Итоговый м2']) rows.push('м²: ' + (fields['Итоговый м2'] || fields['м2']));
  if (fields['Монтажники']) rows.push('Монтажники: ' + fields['Монтажники']);
  const filesBlock = buildFilesBlock_(fields);
  if (filesBlock) rows.push(filesBlock);
  if (fields['Комментарий клиента']) rows.push('\nКомментарий клиента:\n' + fields['Комментарий клиента']);
  if (fields['Комментарий администратора']) rows.push('\nКомментарий администратора:\n' + fields['Комментарий администратора']);
  rows.push('\nИсточник: сайт/админка СОЛНЦАНЕТ');
  return rows.filter(Boolean).join('\n');
}

function extractFiles_(fields) {
  const raw = fields && fields['Файлы'];
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return (Array.isArray(parsed) ? parsed : [parsed]).filter(function(file) {
      return file && (file.url || file.webViewLink || file.downloadUrl || file.webContentLink || file.id || file.fileId);
    });
  } catch (err) {
    return String(raw).split(/\n+/).map(function(line) { return { originalName: line, url: line }; }).filter(function(file) { return file.url; });
  }
}

function fileUrl_(file) {
  if (!file) return '';
  if (file.url) return String(file.url);
  if (file.webViewLink) return String(file.webViewLink);
  if (file.downloadUrl) return String(file.downloadUrl);
  if (file.webContentLink) return String(file.webContentLink);
  const id = file.id || file.fileId;
  return id ? 'https://drive.google.com/file/d/' + encodeURIComponent(String(id)) + '/view' : '';
}

function buildFilesBlock_(fields) {
  const files = extractFiles_(fields);
  if (!files.length) return '';
  const lines = ['\nФайлы Google Drive:'];
  files.forEach(function(file, index) {
    const name = String(file.originalName || file.name || ('Файл ' + (index + 1))).trim();
    const url = fileUrl_(file);
    if (url) lines.push((index + 1) + '. ' + name + ' — ' + url);
  });
  return lines.length > 1 ? lines.join('\n') : '';
}

function syncEventAttachments_(ev, fields) {
  const files = extractFiles_(fields);
  if (!files.length) return { ok: false, reason: 'no_files', count: 0 };
  try {
    if (typeof Calendar === 'undefined' || !Calendar.Events || !Calendar.Events.patch) {
      return { ok: false, reason: 'advanced_calendar_api_disabled', count: files.length };
    }
    const attachments = files.map(function(file, index) {
      return {
        fileUrl: fileUrl_(file),
        title: String(file.originalName || file.name || ('Файл ' + (index + 1))).slice(0, 250),
        mimeType: String(file.contentType || file.mimeType || 'application/octet-stream')
      };
    }).filter(function(item) { return item.fileUrl; });
    if (!attachments.length) return { ok: false, reason: 'no_file_urls', count: 0 };
    Calendar.Events.patch({ attachments: attachments }, CALENDAR_ID, ev.getId(), { supportsAttachments: true });
    return { ok: true, count: attachments.length };
  } catch (err) {
    return { ok: false, reason: 'attachment_error', error: err.message || String(err), count: files.length };
  }
}

function eventToPayload_(ev) {
  const start = ev.getStartTime();
  const end = ev.getEndTime();
  return {
    id: ev.getId(),
    title: ev.getTitle(),
    description: ev.getDescription() || '',
    location: ev.getLocation() || '',
    date: Utilities.formatDate(start, TIMEZONE, 'yyyy-MM-dd'),
    startTime: Utilities.formatDate(start, TIMEZONE, 'HH:mm'),
    endTime: Utilities.formatDate(end, TIMEZONE, 'HH:mm'),
    startText: formatDateTime_(start),
    endText: formatDateTime_(end),
    htmlLink: buildEventLink_(CALENDAR_ID, ev.getId()),
    creator: '',
    organizer: ''
  };
}

function buildEventLink_(calendarId, eventId) {
  try {
    const eid = Utilities.base64EncodeWebSafe(String(eventId) + ' ' + String(calendarId)).replace(/=+$/g, '');
    return 'https://calendar.google.com/calendar/u/0/r/eventedit/' + eid;
  } catch (err) {
    return 'https://calendar.google.com/calendar/u/0/r';
  }
}

function validDate_(value) {
  const s = String(value || '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
}
function validTime_(value) {
  const s = String(value || '').slice(0, 5);
  return /^\d{2}:\d{2}$/.test(s) ? s : '';
}
function today_() { return Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd'); }
function addDays_(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00+05:00');
  d.setDate(d.getDate() + Number(days || 0));
  return Utilities.formatDate(d, TIMEZONE, 'yyyy-MM-dd');
}
function formatDateTime_(date) { return Utilities.formatDate(date, TIMEZONE, 'yyyy-MM-dd HH:mm'); }
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj, null, 2)).setMimeType(ContentService.MimeType.JSON);
}
