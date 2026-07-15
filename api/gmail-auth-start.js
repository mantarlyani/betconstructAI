// Старт подключения Gmail сотрудника (OAuth). GET /api/gmail-auth-start?staff=<staff_id>
// Открывает согласие Google. После разрешения Google вернёт на gmail-auth-callback.
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const REDIRECT  = process.env.GOOGLE_REDIRECT || 'https://betconstructai.com/api/gmail-auth-callback';
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'openid','email'
].join(' ');

export default function handler(req, res){
  if(!CLIENT_ID) return res.status(500).send('GOOGLE_CLIENT_ID not set');
  const staff = (req.query && req.query.staff) || '';
  const url = 'https://accounts.google.com/o/oauth2/v2/auth'
    + '?client_id=' + encodeURIComponent(CLIENT_ID)
    + '&redirect_uri=' + encodeURIComponent(REDIRECT)
    + '&response_type=code'
    + '&access_type=offline&prompt=consent'
    + '&scope=' + encodeURIComponent(SCOPES)
    + '&state=' + encodeURIComponent(staff);
  res.writeHead(302, { Location: url });
  res.end();
}
