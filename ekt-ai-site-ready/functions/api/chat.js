// functions/api/chat.js
// Cloudflare Pages Function — доступна на том же домене, что и сайт,
// по адресу /api/chat. Работает вместе со статикой из этого же проекта,
// поэтому деплой из ПРИВАТНОГО репозитория GitHub — бесплатно, и никакого
// отдельного CORS-конфига не нужно (сайт и функция на одном домене).

const PRODUCTS = [
  {id:515291,name:"Автоматический выключатель ABB SH201 C16",cat:"Автоматические выключатели",specs:"1P, 16А, х-ка C, 6кА",cert:"ЕАС",price:3200,stock:{"Алматы":45,"Астана":12}},
  {id:515292,name:"Автоматический выключатель ABB SH201 C20",cat:"Автоматические выключатели",specs:"1P, 20А, х-ка C, 6кА",cert:"ЕАС",price:3350,stock:{"Алматы":0,"Астана":0}},
  {id:515293,name:"Автоматический выключатель IEK ВА47-29 C20",cat:"Автоматические выключатели",specs:"1P, 20А, х-ка C, 4.5кА",cert:"ЕАС",price:2800,stock:{"Алматы":30,"Астана":5}},
  {id:515294,name:"Автоматический выключатель ABB SH201 C25",cat:"Автоматические выключатели",specs:"1P, 25А, х-ка C, 6кА",cert:"ЕАС",price:3500,stock:{"Алматы":18,"Астана":6}},
  {id:520101,name:"УЗО ABB F202 25A/30mA",cat:"УЗО",specs:"2P, 25А, 30мА, тип AC",cert:"ЕАС",price:12500,stock:{"Алматы":20,"Астана":0}},
  {id:520102,name:"УЗО ABB F202 40A/30mA",cat:"УЗО",specs:"2P, 40А, 30мА, тип AC",cert:"ЕАС",price:14200,stock:{"Алматы":0,"Астана":0}},
  {id:530045,name:"Кабель ВВГнг-LS 3х2.5 (бухта 100м)",cat:"Кабельная продукция",specs:"3х2.5мм², нг-LS",cert:"ЕАС, пожарный",price:45000,stock:{"Алматы":8,"Астана":3}},
  {id:530046,name:"Кабель ВВГнг-LS 3х1.5 (бухта 100м)",cat:"Кабельная продукция",specs:"3х1.5мм², нг-LS",cert:"ЕАС, пожарный",price:32000,stock:{"Алматы":0,"Астана":0}},
  {id:530047,name:"Кабель ВВГ 3х1.5 (бухта 100м)",cat:"Кабельная продукция",specs:"3х1.5мм², без нг-LS",cert:"ЕАС",price:28500,stock:{"Алматы":15,"Астана":0}},
  {id:530048,name:"Кабель ПВС 2х1.5 (бухта 100м)",cat:"Кабельная продукция",specs:"2х1.5мм², гибкий",cert:"ЕАС",price:19500,stock:{"Алматы":22,"Астана":9}},
  {id:540012,name:"Розетка Legrand Valena скрытая с/з",cat:"Розетки и выключатели",specs:"16А, 250В, IP20",cert:"ЕАС",price:1450,stock:{"Алматы":100,"Астана":40}},
  {id:540013,name:"Выключатель Legrand Valena 1-клавишный",cat:"Розетки и выключатели",specs:"10А, 250В, IP20",cert:"ЕАС",price:1200,stock:{"Алматы":80,"Астана":25}},
  {id:540014,name:"Розетка с УЗО Schneider Electric",cat:"Розетки и выключатели",specs:"16А, 30мА, IP20",cert:"ЕАС",price:5400,stock:{"Алматы":0,"Астана":0}},
  {id:550001,name:"Кабель-канал 25х16 (2м)",cat:"Кабель-каналы",specs:"25х16мм, белый, самозатух.",cert:"—",price:650,stock:{"Алматы":200,"Астана":90}},
  {id:550002,name:"Кабель-канал 40х25 (2м)",cat:"Кабель-каналы",specs:"40х25мм, белый, самозатух.",cert:"—",price:1050,stock:{"Алматы":140,"Астана":55}},
  {id:560001,name:"Лампа светодиодная Osram A60 9Вт Е27",cat:"Освещение",specs:"9Вт, 806лм, 4000К, Е27",cert:"ЕАС",price:850,stock:{"Алматы":300,"Астана":120}},
  {id:560002,name:"Лампа светодиодная Osram A60 12Вт Е27",cat:"Освещение",specs:"12Вт, 1150лм, 4000К, Е27",cert:"ЕАС",price:1100,stock:{"Алматы":150,"Астана":0}},
  {id:560003,name:"Лампа светодиодная Philips A60 9Вт Е27",cat:"Освещение",specs:"9Вт, 830лм, 3000К, Е27",cert:"ЕАС",price:990,stock:{"Алматы":0,"Астана":0}},
  {id:560004,name:"Лампа светодиодная Gauss E14 свеча 6Вт",cat:"Освещение",specs:"6Вт, 540лм, 4000К, Е14",cert:"ЕАС",price:690,stock:{"Алматы":80,"Астана":40}},
  {id:560005,name:"Прожектор светодиодный 50Вт IP65",cat:"Освещение",specs:"50Вт, 4500лм, IP65",cert:"ЕАС",price:6200,stock:{"Алматы":25,"Астана":10}}
];

const CONDITIONS = "Оплата: безналичный расчёт, карта или QR на сайте; для юр.лиц — по счёту. Доставка: по городу — 1–2 дня, по Казахстану — транспортными компаниями. Минимальная партия не установлена, самовывоз со склада бесплатный. (пример-заглушка — уточните реальные условия у партнёра)";

function stockStr(p) {
  return Object.entries(p.stock).map(([k, v]) => `${k}: ${v}`).join(', ');
}

const CATALOG_TEXT = PRODUCTS.map(p =>
  `${p.id}|${p.name}|${p.cat}|${p.specs}|серт:${p.cert}|${p.price}тг|остатки:${stockStr(p)}`
).join('\n');

const SYSTEM_PROMPT = `Ты — ИИ-консультант интернет-магазина электротехники ekt.kz. Пиши чётко и по делу, без вводных фраз и лишних слов, по-русски, СТРОГО на основе каталога ниже — никогда не придумывай артикулы, цены, характеристики или остатки, которых нет в списке.
Каталог (артикул|название|категория|характеристики|сертификат|цена|остатки по складам):
${CATALOG_TEXT}
Правила:
- Конкретный товар/артикул — дай характеристики, сертификат, цену, наличие.
- Широкий/категорийный запрос (например просто "лампочка", "розетки", "автоматы") — перечисли ВСЕ подходящие товары в наличии с ценой и остатками, а не один.
- Нет в наличии — обязательно предложи аналог(и) из той же категории в наличии, с коротким обоснованием.
- Спрашивают "что лучше"/сравнить — сравни конкретные товары по характеристикам (ток, мощность, класс, цена и т.п.) и обоснованно порекомендуй один.
- Один конкретный товар в наличии явно интересует клиента — спроси, добавить ли 1 шт. в корзину, и заполни offer.
- Условия покупки: ${CONDITIONS}
- В корзину товар добавляет код сайта только после явного подтверждения ("да"/"добавь" и т.п.) уже предложенного товара — offer заполняй только когда ПРЕДЛАГАЕШЬ товар.
Ответь строго JSON: {"reply":"текст ответа","offer":{"id":артикул,"qty":количество} или null}`;

// Простой лимитер на инстанс (не переживает масштабирование, но лучше чем ничего)
const hits = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60_000;
  const limit = 20;
  const arr = (hits.get(ip) || []).filter(t => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 1_000) {
    for (const [key, timestamps] of hits) {
      if (!timestamps.some(t => now - t < windowMs)) hits.delete(key);
    }
  }
  return arr.length > limit;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!request.headers.get('Content-Type')?.includes('application/json')) {
    return json({ error: 'Ожидается JSON-запрос' }, 415);
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (isRateLimited(ip)) {
    return json({ error: 'Слишком много запросов, попробуйте позже' }, 429);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    body = {};
  }
  const { message, history } = body || {};
  const cleanMessage = typeof message === 'string' ? message.trim() : '';

  if (!cleanMessage || cleanMessage.length > 2000) {
    return json({ error: 'Некорректное сообщение' }, 400);
  }

  const safeHistory = Array.isArray(history)
    ? history.slice(-8).filter(m => m && typeof m.content === 'string' && m.content.length <= 2000 && (m.role === 'user' || m.role === 'assistant'))
    : [];

  const input = [
    ...safeHistory,
    { role: 'user', content: cleanMessage },
  ];

  if (!env.OPENAI_API_KEY) {
    return json({ error: 'OPENAI_API_KEY не настроен в переменных окружения проекта' }, 500);
  }

  try {
    const r = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || 'gpt-4o-mini',
        instructions: SYSTEM_PROMPT,
        input,
        store: false,
        text: {
          format: {
            type: 'json_schema',
            name: 'catalog_answer',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                reply: { type: 'string' },
                offer: {
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        qty: { type: 'integer', minimum: 1 },
                      },
                      required: ['id', 'qty'],
                      additionalProperties: false,
                    },
                    { type: 'null' },
                  ],
                },
              },
              required: ['reply', 'offer'],
              additionalProperties: false,
            },
          },
        },
        temperature: 0.3,
        max_output_tokens: 700,
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      return json({ error: data.error?.message || 'Ошибка OpenAI API' }, 502);
    }

    const raw = data.output_text || (data.output || [])
      .filter(item => item.type === 'message')
      .flatMap(item => item.content || [])
      .filter(content => content.type === 'output_text')
      .map(content => content.text)
      .join('') || '{}';
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      parsed = { reply: raw, offer: null };
    }
    if (typeof parsed.reply !== 'string') {
      parsed = { reply: 'Не удалось получить ответ, уточните вопрос.', offer: null };
    }
    if (parsed.offer && (!Number.isInteger(parsed.offer.id) || !Number.isInteger(parsed.offer.qty) || parsed.offer.qty < 1 || !PRODUCTS.some(p => p.id === parsed.offer.id))) {
      parsed.offer = null;
    }

    return json(parsed);
  } catch (e) {
    return json({ error: 'Внутренняя ошибка сервера' }, 500);
  }
}
