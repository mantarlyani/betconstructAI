// Serverless-функция (Vercel): письмо о новой заявке — регистранту и в админ-почту.
// Отправка через Resend (https://resend.com). Ключ на сервере: env RESEND_API_KEY.
// Env:
//   RESEND_API_KEY   — ключ Resend (обязательно)
//   NOTIFY_ADMIN     — email админа-получателя (по умолчанию corpfundme@gmail.com)
//   NOTIFY_FROM      — адрес отправителя (по умолчанию тестовый onboarding@resend.dev)
// Фронт вызывает: fetch('/api/notify',{method:'POST',body:JSON.stringify(payload)})

function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function detailsHtml(p){
  const F=[['company','Компания'],['kind','Тип'],['product_name','Продукт'],['category','Категория'],
    ['description','Описание'],['value_prop','Ценность'],['features','Функции'],['model','Модель'],
    ['price','Цена'],['regions','Регионы'],['languages','Языки'],['currencies','Валюты'],
    ['compliance','Комплаенс'],['licenses','Лицензии'],['country','Страна'],['reg_no','Рег. номер'],
    ['contact_name','Контакт'],['email','Email'],['phone','Телефон'],['site','Сайт']];
  const rows=F.filter(f=>p[f[0]]).map(f=>`<tr><td style="padding:6px 10px;color:#666;border-bottom:1px solid #eee">${f[1]}</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${esc(p[f[0]])}</td></tr>`).join('');
  return `<table style="border-collapse:collapse;width:100%;font-size:14px">${rows}</table>`;
}

async function sendEmail(key, from, to, subject, html){
  const r = await fetch('https://api.resend.com/emails', {
    method:'POST',
    headers:{ 'Authorization':'Bearer '+key, 'Content-Type':'application/json' },
    body: JSON.stringify({ from, to, subject, html })
  });
  return r.ok ? null : ('resend '+r.status+': '+(await r.text()).slice(0,200));
}

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(200).end();
  if(req.method!=='POST') return res.status(405).json({error:'POST only'});

  const key = process.env.RESEND_API_KEY;
  if(!key) return res.status(500).json({error:'RESEND_API_KEY not set'});
  const admin = process.env.NOTIFY_ADMIN || 'corpfundme@gmail.com';
  const from  = process.env.NOTIFY_FROM  || 'BetConstructAI <onboarding@resend.dev>';

  let p={};
  try{ p = req.body || {}; }catch(e){}
  const company = p.company || 'Заявка';
  const details = detailsHtml(p);
  const errs = [];

  // 1) в админ-почту — новая заявка
  const e1 = await sendEmail(key, from, admin,
    'Новая заявка: '+company,
    `<h2>Новая заявка на BetConstructAI</h2><p><b>${esc(company)}</b> (${esc(p.kind||'')})</p>${details}
     <p style="color:#888;font-size:12px">Заявка также в админ-панели: /admin.html → Модерация.</p>`);
  if(e1) errs.push(e1);

  // 2) регистранту — подтверждение
  if(p.email && /@/.test(p.email)){
    const e2 = await sendEmail(key, from, p.email,
      'Ваша заявка принята — BetConstructAI',
      `<h2>Спасибо! Заявка принята</h2>
       <p>Здравствуйте! Мы получили вашу заявку «<b>${esc(company)}</b>».</p>
       <p>Статус: <b>на проверке (KYB)</b>. После модерации продукт появится в Marketplace, а с вами свяжется менеджер.</p>
       <hr><p style="color:#666;font-size:13px">Данные заявки:</p>${details}`);
    if(e2) errs.push(e2);
  }

  if(errs.length) return res.status(502).json({ok:false, errors:errs});
  return res.status(200).json({ok:true});
}
