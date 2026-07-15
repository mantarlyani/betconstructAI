// Диагностика окружения. GET /api/env-check — показывает какие env-переменные ВИДИТ функция (только да/нет, без значений).
export default async function handler(req, res){
  const has = k => { const v = process.env[k]; return { present: !!(v && String(v).trim()), len: v ? String(v).length : 0 }; };
  return res.status(200).json({
    GOOGLE_CLIENT_ID: has('GOOGLE_CLIENT_ID'),
    GOOGLE_CLIENT_SECRET: has('GOOGLE_CLIENT_SECRET'),
    GOOGLE_REDIRECT: has('GOOGLE_REDIRECT'),
    SB_SERVICE_KEY: has('SB_SERVICE_KEY'),
    SB_URL: has('SB_URL'),
    all_google_or_sb_keys: Object.keys(process.env).filter(k=>/GOOGLE|SB_|SUPA/i.test(k)).sort()
  });
}
