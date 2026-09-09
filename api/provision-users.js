// Разовый провижн: заводит Supabase Auth-пользователей для сотрудников из таблицы staff.
// Защищён секретом PROVISION_SECRET. Пароли генерируются и возвращаются ОДИН раз.
// Вызов: POST /api/provision-users?secret=...&only=admins|all
// Нужные env: SB_SERVICE_KEY (service_role), PROVISION_SECRET. SB_URL опционально.

const SB_URL = process.env.SB_URL || 'https://smddtvaewmmpuyvtuscb.supabase.co';
const SVC = process.env.SB_SERVICE_KEY;
const SECRET = process.env.PROVISION_SECRET;

function genPass() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let p = '';
  for (let i = 0; i < 12; i++) p += c[Math.floor(Math.random() * c.length)];
  return p + '!';
}

async function sbRest(path) {
  const r = await fetch(SB_URL + '/rest/v1/' + path, {
    headers: { apikey: SVC, Authorization: 'Bearer ' + SVC }
  });
  if (!r.ok) return [];
  try { return await r.json(); } catch (e) { return []; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const secret = String((req.query && req.query.secret) || (req.body && req.body.secret) || '');
  if (!SECRET || secret !== SECRET) return res.status(403).json({ error: 'forbidden' });
  if (!SVC) return res.status(500).json({ error: 'SB_SERVICE_KEY not set' });

  const only = String((req.query && req.query.only) || 'all').toLowerCase();
  const staff = await sbRest('staff?active=eq.true&select=id,name,login,email,role&order=name');

  const out = [];
  for (const s of staff) {
    const isAdmin = /^(админ|admin)$/i.test(String(s.role || '').trim());
    if (only === 'admins' && !isAdmin) continue;

    const email = (s.email && s.email.trim())
      || (String(s.login || ('u' + s.id)).toLowerCase() + '@betconstructai.local');
    const role = isAdmin ? 'admin' : 'sales'; // грубое деление; is_staff() = true для обоих
    const password = genPass();

    const r = await fetch(SB_URL + '/auth/v1/admin/users', {
      method: 'POST',
      headers: { apikey: SVC, Authorization: 'Bearer ' + SVC, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email, password, email_confirm: true,
        user_metadata: { full_name: s.name || '', role }
      })
    });
    let d = {};
    try { d = await r.json(); } catch (e) {}
    if (r.ok) {
      out.push({ name: s.name, login: s.login, email, password, role });
    } else {
      const msg = (d && (d.msg || d.error_description || d.message)) || ('HTTP ' + r.status);
      out.push({ name: s.name, login: s.login, email, skipped: msg }); // напр. "email exists" — уже заведён
    }
  }

  const created = out.filter(u => u.password).length;
  return res.status(200).json({ total: out.length, created, users: out });
}
