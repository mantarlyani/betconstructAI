// Serverless-функция для Vercel: защищённый прокси к Google Gemini.
// Ключ живёт на сервере (env GEMINI_API_KEY), в браузер не попадает.

function systemPrompt(lang, context) {
  const langName = lang === 'en' ? 'English' : lang === 'hy' ? 'Armenian (Հայերեն)' : 'Russian';
  return `Ты — AI-советник платформы BetConstructAI (B2B iGaming-маркетплейс вокруг экосистемы BetConstruct).

СТРОГОЕ ПРАВИЛО: отвечай ТОЛЬКО на основе данных платформы ниже (раздел «ДАННЫЕ ПЛАТФОРМЫ»).
Это три источника: (1) что такое BetConstruct — решения, платформы, продукты, цены, регионы, лицензии, платежи;
(2) MARKETPLACE — продукты вендоров; (3) ПАРТНЁРЫ — производители.
Не выдумывай продукты, цены, компании или лицензии, которых нет в данных. Если чего-то нет — честно скажи,
что этого пока нет в каталоге, и предложи связаться с менеджером.

Задача: по запросу клиента (гео, вертикаль, крипто/фиат, тип игр, бюджет) собери готовую конфигурацию:
— рекомендованный регион/юрисдикция и лицензия (из данных);
— продукт/пакет BetConstruct с ценой (из данных);
— конкретные продукты вендоров из MARKETPLACE (по именам) под задачу;
— подходящих партнёров-производителей по именам;
— платежи (крипто/фиат) из данных.
Ссылайся на конкретные названия из данных. Отвечай кратко и структурировано на языке: ${langName}.
В конце добавь: «Предварительная рекомендация, не юридическая консультация — финал с менеджером.»

===== ДАННЫЕ ПЛАТФОРМЫ =====
${context || '(данные не переданы)'}
===== КОНЕЦ ДАННЫХ =====`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  let prompt = '', context = '', lang = 'ru';
  try {
    const b = req.body || {};
    prompt = b.prompt || '';
    context = b.context || '';
    lang = b.lang || 'ru';
  } catch (e) {}
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  try {
   const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt(lang, context) }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4 }
      })
    });
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return res.status(502).json({ error: (data && data.error && data.error.message) || 'gemini_no_response' });
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
