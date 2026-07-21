'use strict';

const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const pool = require('../db');

async function main(env = process.env) {
  if (env.BOOTSTRAP_ACKNOWLEDGEMENT !== 'create-initial-admin') {
    throw new Error('BOOTSTRAP_ACKNOWLEDGEMENT=create-initial-admin is required');
  }
  const email = String(env.PROVISION_ADMIN_EMAIL || env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(env.PROVISION_ADMIN_PASSWORD || env.ADMIN_PASSWORD || '');
  const fullName = String(env.PROVISION_ADMIN_NAME || env.BOOTSTRAP_ADMIN_NAME || 'Vehicle Administrator').trim();
  const tenantId = String(env.TENANT_ID || env.GOVERNANCE_TENANT_ID || crypto.randomUUID()).trim();
  if (!email.includes('@') || password.length < 12 || !fullName || !tenantId) {
    throw new Error('A valid email, 12-character password, name, and tenant are required');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users(email,password,full_name,role,tenant_id)
     VALUES($1,$2,$3,'owner',$4)
     ON CONFLICT(email) DO UPDATE SET
       password=EXCLUDED.password,
       full_name=EXCLUDED.full_name,
       role='owner',
       tenant_id=EXCLUDED.tenant_id`,
    [email, passwordHash, fullName, tenantId],
  );
  console.log(`Provisioned vehicle administrator ${email}`);
}

if (require.main === module) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => pool.end());
}

module.exports = { main };
