// Zoho CRM для личного кабинета сотрудника.
// Сейчас: заглушка с демо-данными (детерминированы по email сотрудника).
// Когда появятся ключи — задай env: ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET,
// ZOHO_REFRESH_TOKEN, ZOHO_DC (com|eu|in|...). Тогда вернутся реальные данные.
// Вызов: GET /api/zoho?email=name@softconstruct.com
//
// Формат ответа: { connected:bool, owner, counts:{...}, leads:[], deals:[], contacts:[], tasks:[] }

const DC = process.env.ZOHO_DC || 'com';
const CID = process.env.ZOHO_CLIENT_ID;
const SECRET = process.env.ZOHO_CLIENT_SECRET;
const RT = process.env.ZOHO_REFRESH_TOKEN;

// Supabase — для проверки сессии (модель «каждый видит свой аккаунт»)
const SB_URL = process.env.SB_URL || 'https://smddtvaewmmpuyvtuscb.supabase.co';
const SB_ANON = process.env.SB_ANON_KEY || 'sb_publishable_oPGh3c7PEFreALuOkY6wOA_WovnaNpL';

// Проверяем Bearer-токен Supabase → {email, role}. null, если не авторизован.
async function authUser(req) {
  const h = (req.headers && (req.headers.authorization || req.headers.Authorization)) || '';
  const tok = h.indexOf('Bearer ') === 0 ? h.slice(7) : '';
  if (!tok) return null;
  try {
    const r = await fetch(SB_URL + '/auth/v1/user', { headers: { apikey: SB_ANON, Authorization: 'Bearer ' + tok } });
    if (!r.ok) return null;
    const u = await r.json();
    if (!u || !u.id) return null;
    let role = 'visitor';
    try {
      const pr = await fetch(SB_URL + '/rest/v1/profiles?id=eq.' + u.id + '&select=role', { headers: { apikey: SB_ANON, Authorization: 'Bearer ' + tok } });
      const d = await pr.json();
      if (Array.isArray(d) && d[0] && d[0].role) role = String(d[0].role);
    } catch (e) {}
    return { email: String(u.email || '').toLowerCase(), role };
  } catch (e) { return null; }
}

function hash(str) { let h = 0; for (let i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) | 0; } return Math.abs(h); }
function pick(arr, seed) { return arr[seed % arr.length]; }

// --- ДЕМО-данные: правдоподобный, но фейковый срез CRM по сотруднику ---
function demo(email) {
  const seed = hash(email || 'x');
  const cos = ['NovaBet', 'Arena Play', 'GoldSpin', 'TopOdds', 'LuckyGate', 'PrimeBook', 'RoyalPlay', 'BetHorizonRezerv'];
  const stages = ['Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
  const src = ['Website', 'Referral', 'Event', 'Outbound', 'Partner'];
  const n = (k) => 2 + ((seed >> k) % 4); // 2..5
  const mk = (i, arr) => pick(arr, seed + i * 7);
  const leads = Array.from({ length: n(1) }, (_, i) => ({
    id: 'L' + (seed % 9000 + i),
    company: mk(i, cos),
    name: mk(i, ['A. Petrov', 'M. Sargsyan', 'K. Ivanov', 'R. Haddad', 'T. Kim']),
    source: mk(i, src),
    status: mk(i, ['New', 'Contacted', 'Qualified', 'Working'])
  }));
  const deals = Array.from({ length: n(3) }, (_, i) => ({
    id: 'D' + (seed % 9000 + i),
    name: mk(i, cos) + ' — Sportsbook',
    stage: mk(i + 2, stages),
    amount: (10 + (seed + i * 13) % 90) * 1000,
    closing: '2026-' + String(9 + (i % 4)).padStart(2, '0') + '-' + String(5 + (seed + i) % 23).padStart(2, '0')
  }));
  const contacts = Array.from({ length: n(2) }, (_, i) => ({
    id: 'C' + (seed % 9000 + i),
    name: mk(i, ['Anna K.', 'David M.', 'Sergey P.', 'Lana R.', 'Omar F.']),
    company: mk(i, cos),
    email: 'contact' + i + '@' + mk(i, cos).toLowerCase().replace(/\s/g, '') + '.com'
  }));
  const tasks = Array.from({ length: n(4) }, (_, i) => ({
    id: 'T' + (seed % 9000 + i),
    subject: mk(i, ['Позвонить клиенту', 'Отправить КП', 'Демо встреча', 'Follow-up', 'Подготовить договор']),
    due: '2026-09-' + String(11 + (seed + i) % 18).padStart(2, '0'),
    status: mk(i, ['Open', 'In Progress', 'Completed'])
  }));
  return { leads, deals, contacts, tasks };
}

async function accessToken() {
  const body = new URLSearchParams({
    refresh_token: (RT || '').trim(),
    client_id: (CID || '').trim(),
    client_secret: (SECRET || '').trim(),
    grant_type: 'refresh_token'
  }).toString();
  const r = await fetch(`https://accounts.zoho.${DC}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  let d = {}; try { d = await r.json(); } catch (e) {}
  if (!d.access_token) throw new Error('token: ' + (d.error || ('HTTP ' + r.status)));
  return d.access_token;
}

// Список пользователей Zoho → находим id по email владельца.
async function zohoUsers(token) {
  const r = await fetch(`https://www.zohoapis.${DC}/crm/v3/users?type=AllUsers&per_page=200`, {
    headers: { Authorization: 'Zoho-oauthtoken ' + token }
  });
  if (!r.ok) { let d = {}; try { d = await r.json(); } catch (e) {} return { list: [], error: (d && (d.message || d.code)) || ('HTTP ' + r.status) }; }
  try { const d = await r.json(); return { list: (d && d.users) || [] }; } catch (e) { return { list: [], error: 'parse' }; }
}

// Реальная выборка по владельцу (по email). Возвращает {data, error}.
async function coqlByOwner(token, module, email, fields) {
  const q = `select ${fields} from ${module} where Owner.email = '${String(email).replace(/'/g, '')}' limit 200`;
  const r = await fetch(`https://www.zohoapis.${DC}/crm/v3/coql`, {
    method: 'POST',
    headers: { Authorization: 'Zoho-oauthtoken ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ select_query: q })
  });
  if (r.status === 204) return { data: [] };
  let d = {}; try { d = await r.json(); } catch (e) {}
  if (!r.ok) return { data: [], error: (d && (d.message || d.code)) || ('HTTP ' + r.status) };
  return { data: (d && d.data) || [] };
}

// --- Запись в Zoho ---
async function resolveOwnerId(token, email) {
  try { const U = await zohoUsers(token); const u = (U.list || []).find(x => String(x.email || '').toLowerCase() === String(email).toLowerCase()); return u ? u.id : null; } catch (e) { return null; }
}
async function zput(token, module, id, fields) {
  const r = await fetch(`https://www.zohoapis.${DC}/crm/v3/${module}/${id}`, { method: 'PUT', headers: { Authorization: 'Zoho-oauthtoken ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ data: [fields] }) });
  let d = {}; try { d = await r.json(); } catch (e) {} return { ok: r.ok, d };
}
async function zpost(token, module, fields) {
  const r = await fetch(`https://www.zohoapis.${DC}/crm/v3/${module}`, { method: 'POST', headers: { Authorization: 'Zoho-oauthtoken ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ data: [fields] }) });
  let d = {}; try { d = await r.json(); } catch (e) {} return { ok: r.ok, d };
}
async function znote(token, module, id, title, content) {
  const r = await fetch(`https://www.zohoapis.${DC}/crm/v3/${module}/${id}/Notes`, { method: 'POST', headers: { Authorization: 'Zoho-oauthtoken ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ data: [{ Note_Title: title || 'Заметка', Note_Content: content || '' }] }) });
  let d = {}; try { d = await r.json(); } catch (e) {} return { ok: r.ok, d };
}
const WRITE_MODULES = { Leads: 1, Deals: 1, Contacts: 1, Tasks: 1 };

export default async function handler(req, res) {
  // Запись в Zoho (создание/обновление/заметка). Только авторизованным; сотрудник — только свой owner.
  if (req.method === 'POST') {
    const auth = await authUser(req);
    if (!auth) return res.status(401).json({ error: 'auth required' });
    if (!CID || !SECRET || !RT) return res.status(400).json({ error: 'zoho not configured' });
    const isAdmin = auth.role === 'admin';
    const b = (req.body && typeof req.body === 'object') ? req.body : {};
    const action = String(b.action || ''), module = String(b.module || ''), id = b.id ? String(b.id) : '';
    const data = (b.data && typeof b.data === 'object') ? b.data : {};
    const ownerEmail = String(b.owner || auth.email || '').toLowerCase();
    if (!isAdmin && ownerEmail && ownerEmail !== auth.email) return res.status(403).json({ error: 'forbidden' });
    if (!WRITE_MODULES[module]) return res.status(400).json({ error: 'bad module' });
    try {
      const token = await accessToken();
      if (action === 'update') {
        if (!id) return res.status(400).json({ error: 'id required' });
        const r = await zput(token, module, id, data);
        return res.status(r.ok ? 200 : 400).json({ ok: r.ok, result: r.d });
      }
      if (action === 'note') {
        if (!id) return res.status(400).json({ error: 'id required' });
        const r = await znote(token, module, id, data.title, data.content);
        return res.status(r.ok ? 200 : 400).json({ ok: r.ok, result: r.d });
      }
      if (action === 'create') {
        const fields = Object.assign({}, data);
        if (ownerEmail) { const oid = await resolveOwnerId(token, ownerEmail); if (oid) fields.Owner = { id: String(oid) }; }
        const r = await zpost(token, module, fields);
        return res.status(r.ok ? 200 : 400).json({ ok: r.ok, result: r.d });
      }
      return res.status(400).json({ error: 'unknown action' });
    } catch (e) { return res.status(500).json({ error: String((e && e.message) || e) }); }
  }

  // Health-check: проверка ключей и обмена токена. Без данных CRM и без секретов.
  if (req.query && (req.query.health || req.query.health === '')) {
    const env = { client_id: !!CID, client_secret: !!SECRET, refresh_token: !!RT, dc: DC };
    if (!CID || !SECRET || !RT) return res.status(200).json({ health: true, env, token_ok: false, reason: 'missing_env' });
    try {
      const t = await accessToken();
      let users = 0, uerr; try { const U = await zohoUsers(t); users = (U.list || []).length; uerr = U.error; } catch (e) { uerr = String(e && e.message || e); }
      // Проба COQL (нужен scope ZohoCRM.coql.READ). Не возвращаем данные — только ok/ошибку.
      let coql_ok = false, coql_error; try { const P = await coqlByOwner(t, 'Contacts', '__healthcheck__@none.invalid', 'id'); coql_ok = !P.error; coql_error = P.error; } catch (e) { coql_error = String(e && e.message || e); }
      return res.status(200).json({ health: true, env, token_ok: true, zoho_users: users, users_error: uerr, coql_ok, coql_error });
    } catch (e) {
      return res.status(200).json({ health: true, env, token_ok: false, error: String((e && e.message) || e) });
    }
  }

  const auth = await authUser(req);
  const isAdmin = !!auth && auth.role === 'admin';
  let email = String((req.query && req.query.email) || '').trim().toLowerCase();
  // Модель «каждый свой»: сотрудник видит только свой email; админ — любой.
  if (auth && !isAdmin) email = auth.email;
  if (!email && auth) email = auth.email;
  if (!email) return res.status(400).json({ error: 'email required' });

  // Реальные данные Zoho — только авторизованным. Неавторизованным → демо (утечки нет).
  const canReal = !!auth;

  // Нет сессии, нет ключей, или ошибка → демо-режим
  if (!canReal || !CID || !SECRET || !RT) {
    const d = demo(email);
    return res.status(200).json({
      connected: false, owner: email, demo: true,
      reason: !canReal ? 'not_authenticated' : 'no_zoho_keys',
      counts: { leads: d.leads.length, deals: d.deals.length, contacts: d.contacts.length, tasks: d.tasks.length },
      ...d
    });
  }

  try {
    const token = await accessToken();
    if (!token) throw new Error('no access_token (проверь refresh token/ключи)');

    // Выборка напрямую по владельцу (Owner.email = email сотрудника)
    const [L, D, C, T] = await Promise.all([
      coqlByOwner(token, 'Leads', email, 'id,Company,Full_Name,Lead_Source,Lead_Status,Email,Phone'),
      coqlByOwner(token, 'Deals', email, 'id,Deal_Name,Stage,Amount,Closing_Date'),
      coqlByOwner(token, 'Contacts', email, 'id,Full_Name,Account_Name,Email,Phone'),
      coqlByOwner(token, 'Tasks', email, 'id,Subject,Due_Date,Status')
    ]);
    const leads = L.data, deals = D.data, contacts = C.data, tasks = T.data;
    const errs = [L.error, D.error, C.error, T.error].filter(Boolean);
    return res.status(200).json({
      connected: true, owner: email,
      counts: { leads: leads.length, deals: deals.length, contacts: contacts.length, tasks: tasks.length },
      leads, deals, contacts, tasks,
      note: errs.length ? ('coql_error: ' + errs[0]) : undefined
    });
  } catch (e) {
    const d = demo(email);
    return res.status(200).json({ connected: false, owner: email, error: String(e && e.message || e), counts: { leads: d.leads.length, deals: d.deals.length, contacts: d.contacts.length, tasks: d.tasks.length }, ...d });
  }
}
