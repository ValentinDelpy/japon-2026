/**
 * Applique les migrations SQL de supabase/migrations dans l'ordre.
 * Usage : DATABASE_URL=postgresql://... node scripts/db-migrate.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = process.env.DATABASE_URL || process.env.DB_URL;
if (!url) { console.error('DATABASE_URL manquant.'); process.exit(1); }

const dir = path.join(ROOT, 'supabase', 'migrations');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

await client.connect();
for (const file of files) {
  process.stdout.write(`→ ${file} … `);
  await client.query(fs.readFileSync(path.join(dir, file), 'utf8'));
  console.log('ok');
}
await client.end();
console.log('✓ migrations appliquées');
