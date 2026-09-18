import { db } from './_db.js';
import { authenticate } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  let username;
  try {
    username = authenticate(req);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
  if (!username) return res.status(403).json({ error: 'Not authorized' });

  const sql = db();
  const entries = await sql`SELECT id, type, data FROM entries ORDER BY id`;
  const kv = await sql`SELECT key, value FROM kv`;

  const state = { income: [], permanent: [], temporary: [] };
  entries.forEach((row) => {
    if (state[row.type]) state[row.type].push(row.data);
  });
  const settingsRow = kv.find((r) => r.key === 'settings');
  const templatesRow = kv.find((r) => r.key === 'templates');

  res.status(200).json({
    ...state,
    settings: settingsRow ? settingsRow.value : { rate: 11800, displayCurrency: 'USD' },
    templates: templatesRow ? templatesRow.value : { income: [] },
  });
}
