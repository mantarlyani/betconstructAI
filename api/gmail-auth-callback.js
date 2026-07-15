// Google возвращает сюда после согласия. GET /api/gmail-auth-callback?code&state
// Меняем code на refresh_token, узнаём email, сохраняем в email_accounts (service_role),
// ставим staff.gmail_connected=true.
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT = process.env.GOOGLE_REDIRECT || 'https://betconstructai.com/api/gmail-auth-callback';
const SB_URL = process.env.SB_URL || 'https://smddtvaewmmpuyvtuscb.supabase.co';
const SB_SVC = process.env.SB_SERVICE_KEY; // service_role — обходит RLS, обязателен

async function sb(path, opts){
  return fetch(SB_URL+'/rest/v1/'+path, { ...opts, headers:{ 'apikey':SB_SVC,'Authorization':'Bearer '+SB_SVC,'Content-Type':'application/json', ...(opts&&opts.headers||{}) } });
}

export default async function handler(req, res){
  try{
    const code = req.query && req.query.code;
    const staffId = (req.query && req.query.state) || '';
    if(!code) return res.status(400).send('no code');
    if(!CLIENT_ID||!CLIENT_SECRET||!SB_SVC) return res.status(500).send('Gmail env not set (GOOGLE_CLIENT_ID/SECRET, SB_SERVICE_KEY)');

    // 1) обмен code -> tokens
    const tok = await (await fetch('https://oauth2.googleapis.com/token', {
      method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body: new URLSearchParams({ code, client_id:CLIENT_ID, client_secret:CLIENT_SECRET, redirect_uri:REDIRECT, grant_type:'authorization_code' })
    })).json();
    if(!tok.refresh_token) return res.status(400).send('no refresh_token (переподключите с prompt=consent)');

    // 2) email ящика
    let emailAddr = '';
    try{
      const prof = await (await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', { headers:{ Authorization:'Bearer '+tok.access_token } })).json();
      emailAddr = prof.emailAddress || '';
    }catch(e){}

    // имя сотрудника
    let staffName = '';
    if(staffId){ const r=await sb('staff?id=eq.'+staffId+'&select=name'); const j=await r.json(); if(Array.isArray(j)&&j[0]) staffName=j[0].name; }

    // 3) upsert токена (удаляем прежние по этому staff/email, вставляем новый)
    if(staffId) await sb('email_accounts?staff_id=eq.'+staffId, { method:'DELETE' });
    await sb('email_accounts', { method:'POST', body: JSON.stringify({ staff_id:staffId||null, staff_name:staffName||null, email:emailAddr||null, provider:'gmail', refresh_token:tok.refresh_token }) });
    if(staffId) await sb('staff?id=eq.'+staffId, { method:'PATCH', body: JSON.stringify({ gmail_connected:true, email: emailAddr||undefined }) });

    res.setHeader('Content-Type','text/html; charset=utf-8');
    return res.status(200).send('<html><body style="font:16px system-ui;text-align:center;padding:40px"><h2>✓ Gmail подключён</h2><p>'+(emailAddr||'')+' связан с CRM. Можно закрыть вкладку.</p></body></html>');
  }catch(e){ return res.status(500).send('error: '+((e&&e.message)||e)); }
}
