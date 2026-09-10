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
  const email = String((req.query && req.query.email) || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ error: 'email required' });

  // Нет ключей → демо-режим (заглушка)
  if (!CID || !SECRET || !RT) {
    const d = demo(email);
    return res.status(200).json({
      connected: false, owner: email,
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
