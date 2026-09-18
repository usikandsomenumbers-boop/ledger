import { db } from './_db.js';
import { authenticate } from './_auth.js';

export default async function handler(req, res) {
  let username;
  try {
    username = authenticate(req);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
  if (!username) return res.status(403).json({ error: 'Not authorized' });

  const sql = db();

  if (req.method === 'POST') {
    const { type, entry } = req.body || {};
    if (!type || !entry || !entry.id) return res.status(400).json({ error: 'Missing type or entry' });
    if (!['income', 'permanent', 'temporary'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }
    await sql`
      INSERT INTO entries (id, type, data)
      VALUES (${entry.id}, ${type}, ${JSON.stringify(entry)}::jsonb)
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, type = EXCLUDED.type, updated_at = now()
    `;
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query || {};
    if (!id) return res.status(400).json({ error: 'Missing id' });
    await sql`DELETE FROM entries WHERE id = ${id}`;
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
