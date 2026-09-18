import { neon } from '@neondatabase/serverless';

let sql;

// Lazily creates the Neon client on first use so a missing env var fails
// with a clear error at request time rather than at cold-start import time.
export function db() {
  if (!sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}
