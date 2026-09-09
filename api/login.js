// Serverless-функция: проверка входа на СЕРВЕРЕ (блок безопасности, Этап A).
// Пароли проверяются через service_role (env SB_SERVICE_KEY) — секрет в браузер не попадает.
// Возвращает профиль БЕЗ пароля.
//   kind:'admin'  -> {ok, profile}
//   kind:'staff'  -> {ok, profile}
//   без kind / kind:'auto' (единый /login) -> {ok, dest:'admin'|'staff', profile}
// Нужные env: SB_SERVICE_KEY, ADMIN_LOGINS ("email1:pass1,email2:pass2").

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

async function checkAdmin(login, pass) {
  // 1) вшитые админы из env
  if (adminLogins().some(a => a[0] === login && a[1] === pass)) {
    return { name: 'Администратор', email: login, role: 'admin' };
  }
  // 2) сотрудник с ролью «Админ»
  const rows = await sb('staff?or=(login.eq.' + login + ',email.eq.' + login + ')&select=name,role,login,email,pass,active&limit=1');
  const s = rows && rows[0];
  if (s && s.active !== false && String(s.pass || '') === pass && /^(админ|admin)$/i.test(String(s.role || '').trim())) {
    return { name: s.name || '', email: s.email || login, role: 'admin' };
  }
  return null;
}

async function checkStaff(login, pass) {
  const rows = await sb('staff?login=eq.' + login + '&active=eq.true&select=*');
  const m = (rows || []).find(x => String(x.pass || '') === pass);
  if (!m) return null;
  return {
    id: m.id, name: m.name, role: m.role, login: m.login,
    shifts_total: m.shifts_total || 0, shifts_weekend: m.shifts_weekend || 0
  };
}

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
      const p = await checkAdmin(login, pass);
      return res.status(200).json(p ? { ok: true, profile: p } : { ok: false });
    }
    if (kind === 'staff') {
      const p = await checkStaff(login, pass);
      return res.status(200).json(p ? { ok: true, profile: p } : { ok: false });
    }
    // единый вход /login — определяем роль сами: сначала админ, потом сотрудник
    let p = await checkAdmin(login, pass);
    if (p) return res.status(200).json({ ok: true, dest: 'admin', profile: p });
    p = await checkStaff(login, pass);
    if (p) return res.status(200).json({ ok: true, dest: 'staff', profile: p });
    return res.status(200).json({ ok: false });
  } catch (e) {
    return res.status(500).json({ error: String(e).slice(0, 200) });
  }
}
