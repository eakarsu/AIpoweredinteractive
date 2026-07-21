const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const crypto = require('crypto');
const authenticateToken = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (!user.tenant_id) return res.status(403).json({ error: 'Account has not been assigned to a tenant' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name, tenantId: user.tenant_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, tenantId: user.tenant_id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id,email,full_name,role,tenant_id FROM users WHERE id=$1 AND tenant_id=$2',
      [req.user.id, req.user.tenantId],
    );
    if (!result.rowCount) return res.status(401).json({ error: 'Identity is no longer active' });
    const user = result.rows[0];
    return res.json({ user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, tenantId: user.tenant_id } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !full_name || typeof password !== 'string' || password.length < 12) return res.status(422).json({ error: 'Valid email, name, and password of at least 12 characters are required' });
    const tenantId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password, full_name, role, tenant_id) VALUES ($1, $2, $3, 'owner', $4) RETURNING id, email, full_name, role, tenant_id",
      [email, hashedPassword, full_name, tenantId]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name, tenantId: user.tenant_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
