import { db } from './_db.js';
import { authenticate } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let username;
  try {
    username = authenticate(req);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
  if (!username) return res.status(403).json({ error: 'Not authorized' });

  const { key, value } = req.body || {};
  if (!key || value === undefined) return res.status(400).json({ error: 'Missing key or value' });
  if (!['settings', 'templates'].includes(key)) return res.status(400).json({ error: 'Invalid key' });

  const sql = db();
  await sql`
    INSERT INTO kv (key, value)
    VALUES (${key}, ${JSON.stringify(value)}::jsonb)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
  `;
  res.status(200).json({ ok: true });
}
