'use strict';

const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function migrate(database = pool) {
  const client = await database.connect();
  try {
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
    const directory = path.join(__dirname, '../migrations');
    for (const name of fs.readdirSync(directory).filter((entry) => entry.endsWith('.sql')).sort()) {
      // These migrations are deliberately idempotent. Reconcile them on every
      // run so an explicitly requested legacy/demo reset cannot leave a table
      // absent while its migration-history row survives.
      const sql = fs.readFileSync(path.join(directory, name), 'utf8').trim()
        .replace(/^BEGIN;\s*/, '')
        .replace(/\s*COMMIT;$/, '');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations(name) VALUES($1) ON CONFLICT(name) DO NOTHING',
          [name],
        );
        await client.query('COMMIT');
        console.log(`reconciled ${name}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrate().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  }).finally(() => pool.end());
}

module.exports = { migrate };
