import crypto from 'crypto';

// Verifies a Telegram Mini App initData string against the bot token.
// This is the standard check from Telegram's docs — it proves the request
// really came from Telegram for this bot, not just anyone who can guess
// the API URL. Returns the lowercase username, or null if invalid.
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
function verifyTelegramAuth(initData) {
  if (!initData) return null;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN is not set');

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  // Constant-time compare to avoid leaking timing info about the hash.
  const a = Buffer.from(computedHash, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  // Reject stale initData (older than 24h) to limit the replay window.
  const authDate = parseInt(params.get('auth_date') || '0', 10);
  if (!authDate || Date.now() / 1000 - authDate > 86400) return null;

  try {
    const user = JSON.parse(params.get('user') || '{}');
    return (user.username || '').toLowerCase() || null;
  } catch (e) {
    return null;
  }
}

function isAllowedUsername(username) {
  if (!username) return false;
  const allowed = (process.env.ALLOWED_USERNAMES || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(username);
}

// Call at the top of every API route. Returns the authenticated username,
// or null if the request should be rejected with 403.
export function authenticate(req) {
  const initData = req.headers['x-telegram-init-data'];
  const username = verifyTelegramAuth(initData);
  if (!isAllowedUsername(username)) return null;
  return username;
}
