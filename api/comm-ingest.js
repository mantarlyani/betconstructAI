// Универсальный приёмник переписки (Vercel serverless).
// Любой канал (Telegram/WhatsApp/email) шлёт сюда нормализованное сообщение,
// эндпоинт находит клиента по контакту (email/phone/whatsapp/telegram) и пишет в comm_messages.
// Пишет через публичный ключ Supabase (RLS на comm_messages открыт для прототипа).
//
// POST /api/comm-ingest
// body: { channel, direction, from, to, subject, body, external_id, staff_name, secret }
//   channel:   email | whatsapp | telegram | call | chat | note
//   direction: in | out | note
//   from/to:   идентификатор (email или телефон/ник) — по нему ищется контакт
// Env (необязательно): COMM_INGEST_SECRET — общий секрет для защиты эндпоинта.

const SB_URL = process.env.SB_URL || 'https://smddtvaewmmpuyvtuscb.supabase.co';
const SB_KEY = process.env.SB_ANON_KEY || 'sb_publishable_oPGh3c7PEFreALuOkY6wOA_WovnaNpL';

function norm(s){return String(s||'').replace(/[\s()\-+]/g,'').toLowerCase();}

async function sb(path, opts){
  const r = await fetch(SB_URL+'/rest/v1/'+path, {
    ...opts,
    headers:{ 'apikey':SB_KEY, 'Authorization':'Bearer '+SB_KEY, 'Content-Type':'application/json', ...(opts&&opts.headers||{}) }
  });
  const t = await r.text();
  try{ return { ok:r.ok, data: t?JSON.parse(t):null }; }catch(e){ return { ok:r.ok, data:t }; }
}

// найти account_id по идентификатору отправителя/получателя среди контактов
async function resolveAccount(ident){
  if(!ident) return null;
  const isEmail = /@/.test(ident);
  const val = isEmail ? String(ident).toLowerCase() : norm(ident);
  const { data } = await sb('contacts?select=account_id,email,phone,whatsapp,telegram', { method:'GET' });
  if(!Array.isArray(data)) return null;
  const m = data.find(c => isEmail
    ? (c.email||'').toLowerCase()===val
    : [c.phone,c.whatsapp,c.telegram].some(x=>norm(x)===val));
  return m ? m.account_id : null;
}

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(200).end();
  if(req.method!=='POST') return res.status(405).json({error:'POST only'});

  let p={}; try{ p = req.body || {}; }catch(e){}
  const secret = process.env.COMM_INGEST_SECRET;
  if(secret && p.secret !== secret) return res.status(401).json({error:'bad secret'});

  const channel = p.channel || 'note';
  const direction = p.direction || 'note';
  const ident = direction==='in' ? (p.from || p.to) : (p.to || p.from);
  const account_id = p.account_id || await resolveAccount(ident);

  const row = {
    account_id: account_id || null,
    staff_name: p.staff_name || null,
    channel, direction,
    subject: p.subject || null,
    body: p.body || '',
    external_id: p.external_id || null
  };
  const { ok, data } = await sb('comm_messages', { method:'POST', headers:{ 'Prefer':'return=representation' }, body: JSON.stringify(row) });
  if(!ok) return res.status(502).json({ ok:false, error:data });
  return res.status(200).json({ ok:true, matched: !!account_id, id: (Array.isArray(data)&&data[0]&&data[0].id)||null });
}
