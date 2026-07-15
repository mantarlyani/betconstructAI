// Отправка письма клиенту от имени сотрудника через его Gmail + запись в переписку.
// POST /api/gmail-send  { staff_id, to, subject, body, account_id }
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SB_URL = process.env.SB_URL || 'https://smddtvaewmmpuyvtuscb.supabase.co';
const SB_SVC = process.env.SB_SERVICE_KEY;
const SB_ANON = process.env.SB_ANON_KEY || 'sb_publishable_oPGh3c7PEFreALuOkY6wOA_WovnaNpL';

async function sbSvc(path, opts){ return fetch(SB_URL+'/rest/v1/'+path, { ...opts, headers:{ 'apikey':SB_SVC,'Authorization':'Bearer '+SB_SVC,'Content-Type':'application/json', ...(opts&&opts.headers||{}) } }); }
async function sbAnon(path, opts){ return fetch(SB_URL+'/rest/v1/'+path, { ...opts, headers:{ 'apikey':SB_ANON,'Authorization':'Bearer '+SB_ANON,'Content-Type':'application/json', ...(opts&&opts.headers||{}) } }); }
function b64url(s){ return Buffer.from(s).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(200).end();
  if(req.method!=='POST') return res.status(405).json({error:'POST only'});
  if(!CLIENT_ID||!CLIENT_SECRET||!SB_SVC) return res.status(500).json({error:'Gmail env not set'});

  let p={}; try{ p=req.body||{}; }catch(e){}
  if(!p.staff_id || !p.to || !p.body) return res.status(400).json({error:'staff_id, to, body required'});

  const accs = await (await sbSvc('email_accounts?select=email,refresh_token,staff_name&staff_id=eq.'+p.staff_id+'&limit=1')).json();
  if(!Array.isArray(accs)||!accs.length) return res.status(400).json({error:'Gmail не подключён у сотрудника'});
  const a = accs[0];

  const tj = await (await fetch('https://oauth2.googleapis.com/token', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:new URLSearchParams({ client_id:CLIENT_ID, client_secret:CLIENT_SECRET, refresh_token:a.refresh_token, grant_type:'refresh_token' }) })).json();
  if(!tj.access_token) return res.status(502).json({error:'token refresh failed'});

  const mime = [
    'From: '+(a.email||''),
    'To: '+p.to,
    'Subject: '+(p.subject||'(без темы)'),
    'Content-Type: text/plain; charset=UTF-8',
    '',
    p.body
  ].join('\r\n');

  const send = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method:'POST', headers:{ Authorization:'Bearer '+tj.access_token, 'Content-Type':'application/json' },
    body: JSON.stringify({ raw: b64url(mime) })
  });
  const sj = await send.json();
  if(!send.ok) return res.status(502).json({error:'gmail send failed', detail:sj});

  // запись в переписку (через анон-ключ, RLS открыт на comm_messages)
  await sbAnon('comm_messages', { method:'POST', body: JSON.stringify({ account_id:p.account_id||null, staff_name:a.staff_name||null, channel:'email', direction:'out', subject:p.subject||null, body:p.body, external_id:(sj&&sj.id)||null }) });

  return res.status(200).json({ ok:true, id:(sj&&sj.id)||null });
}
