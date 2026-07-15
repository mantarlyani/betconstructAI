// Синхронизация входящих/исходящих Gmail в CRM. Запускать по расписанию (Vercel Cron) или вручную GET /api/gmail-sync
// Для каждого подключённого ящика: обновляем токен, берём письма за 2 дня, кладём в comm_messages
// (дедуп по external_id = gmail message id). Клиент матчится по контактам.
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SB_URL = process.env.SB_URL || 'https://smddtvaewmmpuyvtuscb.supabase.co';
const SB_SVC = process.env.SB_SERVICE_KEY;

function emailOf(s){ const m=String(s||'').match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/); return m?m[0].toLowerCase():''; }
async function sb(path, opts){ return fetch(SB_URL+'/rest/v1/'+path, { ...opts, headers:{ 'apikey':SB_SVC,'Authorization':'Bearer '+SB_SVC,'Content-Type':'application/json', ...(opts&&opts.headers||{}) } }); }
async function accessToken(refresh){
  const j = await (await fetch('https://oauth2.googleapis.com/token', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:new URLSearchParams({ client_id:CLIENT_ID, client_secret:CLIENT_SECRET, refresh_token:refresh, grant_type:'refresh_token' }) })).json();
  return j.access_token;
}
function header(h,name){ const x=(h||[]).find(z=>z.name.toLowerCase()===name); return x?x.value:''; }

export default async function handler(req, res){
  if(!CLIENT_ID||!CLIENT_SECRET||!SB_SVC) return res.status(500).json({error:'Gmail env not set'});
  const accs = await (await sb('email_accounts?select=id,staff_name,email,refresh_token')).json();
  if(!Array.isArray(accs)) return res.status(500).json({error:accs});
  // контакты для матчинга клиента
  const contacts = await (await sb('contacts?select=account_id,email')).json();
  const cmap = {}; (Array.isArray(contacts)?contacts:[]).forEach(c=>{ if(c.email) cmap[c.email.toLowerCase()]=c.account_id; });

  let imported=0;
  for(const a of (accs||[])){
    if(!a.refresh_token) continue;
    const at = await accessToken(a.refresh_token); if(!at) continue;
    const myEmail = (a.email||'').toLowerCase();
    const list = await (await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25&q='+encodeURIComponent('newer_than:2d -in:chats'), { headers:{Authorization:'Bearer '+at} })).json();
    for(const mref of (list.messages||[])){
      // дедуп
      const ex = await (await sb('comm_messages?select=id&external_id=eq.'+encodeURIComponent(mref.id)+'&limit=1')).json();
      if(Array.isArray(ex)&&ex.length) continue;
      const msg = await (await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/'+mref.id+'?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject', { headers:{Authorization:'Bearer '+at} })).json();
      const h = msg.payload && msg.payload.headers;
      const from = emailOf(header(h,'from')), to = emailOf(header(h,'to')), subject = header(h,'subject');
      const direction = (from===myEmail) ? 'out' : 'in';
      const clientEmail = direction==='out' ? to : from;
      const account_id = cmap[clientEmail] || null;
      await sb('comm_messages', { method:'POST', body: JSON.stringify({ account_id, staff_name:a.staff_name||null, channel:'email', direction, subject:subject||null, body: msg.snippet||'', external_id: mref.id }) });
      imported++;
    }
    await sb('email_accounts?id=eq.'+a.id, { method:'PATCH', body: JSON.stringify({ last_sync:new Date().toISOString() }) });
  }
  return res.status(200).json({ ok:true, accounts:(accs||[]).length, imported });
}
