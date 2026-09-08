// Serverless-функция: проверка входа на СЕРВЕРЕ (Этап A блока безопасности).
// Пароли проверяются через service_role (env SB_SERVICE_KEY) — секрет в браузер не попадает.
// Возвращает профиль БЕЗ пароля. Фронт вызывает:
//   fetch('/api/login',{method:'POST',body:JSON.stringify({kind:'admin'|'staff'|'partner',login,pass})})
//
// Нужные env в Vercel:
//   SB_SERVICE_KEY  — уже есть (service_role)
//   ADMIN_LOGINS    — вшитые админы, формат "email1:pass1,email2:pass2" (переезд из кода)

const SB_URL = process.env.SB_URL || 'https://smddtvaewmmpuyvtuscb.supabase.co';
const SB_SVC = process.env.SB_SERVICE_KEY;

async function sb(path) {
  const r = await fetch(SB_URL + '/rest/v1/' + path, {
    headers: { apikey: SB_SVC, Authorization: 'Bearer ' + SB_SVC }
  });
  if (!r.ok) return [];
  try { return await r.json(); } catch (e) { return []; }
}

function adminLogins() {
  const raw = process.env.ADMIN_LOGINS || '';
  return raw.split(',').map(s => s.trim()).filter(Boolean).map(s => {
    const i = s.indexOf(':');
    return i < 0 ? [s.toLowerCase(), ''] : [s.slice(0, i).trim().toLowerCase(), s.slice(i + 1)];
  });
}

const normPhone = s => String(s || '').replace(/[\s()\-]/g, '').toLowerCase();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!SB_SVC) return res.status(500).json({ error: 'SB_SERVICE_KEY not set' });

  let kind = '', login = '', pass = '';
  try {
    const b = req.body || {};
    kind = String(b.kind || '');
    login = String(b.login || '').trim().toLowerCase();
    pass = String(b.pass || '');
  } catch (e) {}
  if (!login || !pass) return res.status(400).json({ ok: false, error: 'login and pass required' });

  try {
    if (kind === 'admin') {
      // 1) вшитые админы из env ADMIN_LOGINS
      if (adminLogins().some(a => a[0] === login && a[1] === pass)) {
        return res.status(200).json({ ok: true, profile: { name: 'Администратор', email: login, role: 'admin' } });
      }
      // 2) сотрудник с ролью «Админ»
      const rows = await sb('staff?or=(login.eq.' + login + ',email.eq.' + login + ')&select=name,role,login,email,pass,active&limit=1');
      const s = rows && rows[0];
      if (s && s.active !== false && String(s.pass || '') === pass && /^(админ|admin)$/i.test(String(s.role || '').trim())) {
        return res.status(200).json({ ok: true, profile: { name: s.name || '', email: s.email || login, role: 'admin' } });
      }
      return res.status(200).json({ ok: false });
    }

    if (kind === 'staff') {
      const rows = await sb('staff?login=eq.' + login + '&active=eq.true&select=*');
      const m = (rows || []).find(x => String(x.pass || '') === pass);
      if (!m) return res.status(200).json({ ok: false });
      return res.status(200).json({ ok: true, profile: {
        id: m.id, name: m.name, role: m.role, login: m.login,
        shifts_total: m.shifts_total || 0, shifts_weekend: m.shifts_weekend || 0
      } });
    }

    if (kind === 'partner') {
      const rows = await sb('applications?portal_active=eq.true&portal_pass=eq.' + encodeURIComponent(pass) + '&select=email,phone');
      const m = (rows || []).find(a => String(a.email || '').toLowerCase() === login || normPhone(a.phone) === normPhone(login));
      if (!m) return res.status(200).json({ ok: false });
      return res.status(200).json({ ok: true, profile: { email: m.email || login } });
    }

    return res.status(400).json({ error: 'unknown kind' });
  } catch (e) {
    return res.status(500).json({ error: String(e).slice(0, 200) });
  }
}
