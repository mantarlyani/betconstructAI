// Inbound-приёмник почты (Vercel serverless).
// Каждый менеджер ставит авто-BCC / пересылку своих писем на адрес, привязанный к этому эндпоинту
// (через провайдера inbound-email: Mailgun Routes, SendGrid Inbound Parse, Cloudflare Email Worker и т.п.).
// Провайдер POST-ит сюда письмо → мы определяем менеджера и клиента и кладём в comm_messages.
//
// Поддерживает и JSON, и form-urlencoded поля распространённых провайдеров:
//   from / sender, to / recipient, subject, text / body-plain / stripped-text
//
// Логика: если From совпадает с email сотрудника → это ИСХОДЯЩЕЕ письмо менеджера,
//   клиент = получатель (To); иначе ВХОДЯЩЕЕ, клиент = отправитель (From).
// Клиент матчится по контактам (email) → account_id.

const SB_URL = process.env.SB_URL || 'https://smddtvaewmmpuyvtuscb.supabase.co';
const SB_KEY = process.env.SB_ANON_KEY || 'sb_publishable_oPGh3c7PEFreALuOkY6wOA_WovnaNpL';

function pick(o, keys){ for(const k of keys){ if(o && o[k]!=null && o[k]!=='') return o[k]; } return ''; }
function email(s){ const m=String(s||'').match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/); return m?m[0].toLowerCase():''; }

async function sb(path, opts){
  const r = await fetch(SB_URL+'/rest/v1/'+path, { ...opts, headers:{ 'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json', ...(opts&&opts.headers||{}) } });
  const t = await r.text(); try{ return { ok:r.ok, data:t?JSON.parse(t):null }; }catch(e){ return { ok:r.ok, data:t }; }
}

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(200).end();
  if(req.method!=='POST') return res.status(405).json({error:'POST only'});

  let p = req.body || {};
  if(typeof p === 'string'){ try{ p = JSON.parse(p); }catch(e){ p = {}; } }

  const fromE = email(pick(p,['from','sender','From']));
  const toE   = email(pick(p,['to','recipient','To']));
  const subject = pick(p,['subject','Subject']);
  const body = pick(p,['text','body-plain','stripped-text','body','plain']);
  if(!fromE && !toE) return res.status(400).json({error:'no addresses'});

  // кто из них сотрудник?
  const { data: staff } = await sb('staff?select=name,email', { method:'GET' });
  const staffByEmail = {}; (Array.isArray(staff)?staff:[]).forEach(s=>{ if(s.email) staffByEmail[String(s.email).toLowerCase()]=s.name; });

  let direction, clientEmail, staffName;
  if(staffByEmail[fromE]){ direction='out'; staffName=staffByEmail[fromE]; clientEmail=toE; }
  else if(staffByEmail[toE]){ direction='in'; staffName=staffByEmail[toE]; clientEmail=fromE; }
  else { direction='in'; staffName=null; clientEmail=fromE; }

  // клиент → account_id по контактам
  let account_id = null;
  if(clientEmail){
    const { data: c } = await sb('contacts?select=account_id,email&email=eq.'+encodeURIComponent(clientEmail), { method:'GET' });
    if(Array.isArray(c)&&c.length) account_id = c[0].account_id;
  }

  const row = { account_id, staff_name:staffName, channel:'email', direction, subject:subject||null, body:body||'', external_id: pick(p,['Message-Id','message-id','message_id'])||null };
  const { ok, data } = await sb('comm_messages', { method:'POST', headers:{ 'Prefer':'return=representation' }, body: JSON.stringify(row) });
  if(!ok) return res.status(502).json({ ok:false, error:data });
  return res.status(200).json({ ok:true, direction, matched: !!account_id, staff: staffName||null });
}
