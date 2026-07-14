const DEFAULT_NOCODB_ENDPOINT = "https://app.nocodb.com/api/v3/data/ptvxn8nmuwc08y3/mgp2zjsuv4id5tp/records";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function parseJson(text) {
  try { return JSON.parse(text); } catch (_) { return text; }
}

function clean(value, max = 1000) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
}

function nowYekaterinburg() {
  const date = new Date();
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Yekaterinburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
  const time = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Asia/Yekaterinburg",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
  return { day, time };
}

function buildLeadFields(input) {
  const now = nowYekaterinburg();
  const name = clean(input.name, 160);
  const phone = clean(input.phone, 80);
  const companyName = clean(input.companyName || input.company || "", 220);
  const service = clean(input.service || input.task, 220) || "Заявка с сайта";
  const address = clean(input.address, 300);
  const objectInfo = clean(input.objectInfo, 1000);
  const task = clean(input.task, 1000);
  const comment = clean(input.comment, 1000);
  const preferredDate = clean(input.preferredDate || input.date, 40) || now.day;
  const preferredTime = clean(input.preferredTime || input.time, 40) || now.time;
  const m2 = clean(input.m2, 40);

  const clientComment = [
    objectInfo ? `Информация об объекте: ${objectInfo}` : "",
    task ? `Что нужно сделать: ${task}` : "",
    comment ? `Комментарий: ${comment}` : "",
    `Источник: форма сайта`,
    `Создано: ${now.day} ${now.time}`
  ].filter(Boolean).join("\n");

  return {
    "Имя клиента": name,
    "Компания": companyName,
    "Телефон": phone,
    "Услуга": service,
    "Дата записи": preferredDate,
    "Время записи": preferredTime,
    "Адрес": address,
    "м2": m2,
    "Комментарий клиента": clientComment,
    "Статус": "Новая заявка",
    "Cal Booking ID": `site-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  };
}

async function createNocoRecord(env, fields) {
  if (!env.NOCODB_TOKEN) {
    return { ok: false, error: "NOCODB_TOKEN is missing" };
  }

  const res = await fetch(env.NOCODB_ENDPOINT || DEFAULT_NOCODB_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xc-token": env.NOCODB_TOKEN
    },
    body: JSON.stringify([{ fields }])
  });

  const text = await res.text();
  const data = parseJson(text);

  if (!res.ok) {
    return { ok: false, status: res.status, error: "NocoDB create error", response: data };
  }

  return { ok: true, response: data };
}

async function sendWeb3Forms(env, fields) {
  const accessKey = env.WEB3FORMS_ACCESS_KEY || env.WEB3FORMS_KEY;
  if (!accessKey) {
    return { ok: false, skipped: true, error: "WEB3FORMS_ACCESS_KEY is not set" };
  }

  const payload = {
    access_key: accessKey,
    subject: "Новая заявка с сайта СОЛНЦАНЕТ",
    from_name: "Сайт СОЛНЦАНЕТ",
    name: fields["Имя клиента"],
    phone: fields["Телефон"],
    company: fields["Компания"] || "",
    service: fields["Услуга"],
    address: fields["Адрес"],
    preferred_date: fields["Дата записи"],
    preferred_time: fields["Время записи"],
    message: fields["Комментарий клиента"],
    record_source: "Cloudflare Pages / create-public-lead"
  };

  const res = await fetch(WEB3FORMS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  const data = parseJson(text);

  if (!res.ok || data.success === false) {
    return { ok: false, status: res.status, error: "Web3Forms send error", response: data };
  }

  return { ok: true, response: data };
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let input;
  try {
    input = await request.json();
  } catch (_) {
    return json({ ok: false, error: "Некорректные данные формы" }, 400);
  }

  if (clean(input.hpCompany || input.website || input.companyTrap, 200)) {
    return json({ ok: false, error: "Spam rejected" }, 400);
  }

  const startedAt = Number(input.formStartedAt || 0);
  if (startedAt && Date.now() - startedAt < 1000) {
    return json({ ok: false, error: "Форма отправлена слишком быстро" }, 429);
  }

  const fields = buildLeadFields(input);

  if (!fields["Имя клиента"] || fields["Имя клиента"].length < 2) {
    return json({ ok: false, error: "Укажите имя" }, 400);
  }
  if (!fields["Телефон"] || fields["Телефон"].replace(/\D/g, "").length < 10) {
    return json({ ok: false, error: "Укажите корректный телефон" }, 400);
  }

  try {
    const noco = await createNocoRecord(env, fields);
    if (!noco.ok) {
      return json({ ok: false, error: "Заявку не удалось сохранить в админке", details: noco }, 500);
    }

    const email = await sendWeb3Forms(env, fields);

    return json({
      ok: true,
      saved: true,
      emailSent: Boolean(email.ok),
      emailWarning: email.ok ? "" : (email.error || "Письмо не отправлено"),
      message: "Заявка принята"
    });
  } catch (error) {
    return json({ ok: false, error: error.message || "Ошибка отправки заявки" }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return json({ ok: false, error: "Only POST" }, 405);
  }
  return onRequestPost(context);
}
