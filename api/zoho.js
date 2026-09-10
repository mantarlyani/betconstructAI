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
  const url = `https://accounts.zoho.${DC}/oauth/v2/token?refresh_token=${RT}&client_id=${CID}&client_secret=${SECRET}&grant_type=refresh_token`;
  const r = await fetch(url, { method: 'POST' });
  const d = await r.json();
  return d.access_token;
}

// Реальная выборка по владельцу. COQL: where Owner.email = '<email>'.
async function coql(token, module, email, fields) {
  const q = `select ${fields} from ${module} where Owner.email = '${email.replace(/'/g, '')}' limit 20`;
  const r = await fetch(`https://www.zohoapis.${DC}/crm/v3/coql`, {
    method: 'POST',
    headers: { Authorization: 'Zoho-oauthtoken ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ select_query: q })
  });
  if (!r.ok) return [];
  const d = await r.json();
  return (d && d.data) || [];
}

export default async function handler(req, res) {
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
    const [leads, deals, contacts, tasks] = await Promise.all([
      coql(token, 'Leads', email, 'Company,Full_Name,Lead_Source,Lead_Status'),
      coql(token, 'Deals', email, 'Deal_Name,Stage,Amount,Closing_Date'),
      coql(token, 'Contacts', email, 'Full_Name,Account_Name,Email'),
      coql(token, 'Tasks', email, 'Subject,Due_Date,Status')
    ]);
    return res.status(200).json({
      connected: true, owner: email,
      counts: { leads: leads.length, deals: deals.length, contacts: contacts.length, tasks: tasks.length },
      leads, deals, contacts, tasks
    });
  } catch (e) {
    const d = demo(email);
    return res.status(200).json({ connected: false, owner: email, error: String(e && e.message || e), counts: { leads: d.leads.length, deals: d.deals.length, contacts: d.contacts.length, tasks: d.tasks.length }, ...d });
  }
}
