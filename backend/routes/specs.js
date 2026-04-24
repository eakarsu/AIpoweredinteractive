const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, v.make, v.model, v.year
      FROM specs s LEFT JOIN vehicles v ON s.vehicle_id = v.id
      ORDER BY v.make, s.category, s.spec_name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, v.make, v.model, v.year
      FROM specs s LEFT JOIN vehicles v ON s.vehicle_id = v.id
      WHERE s.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { vehicle_id, category, spec_name, spec_value, unit, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO specs (vehicle_id, category, spec_name, spec_value, unit, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [vehicle_id, category, spec_name, spec_value, unit, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { vehicle_id, category, spec_name, spec_value, unit, notes } = req.body;
    const result = await pool.query(
      'UPDATE specs SET vehicle_id=$1, category=$2, spec_name=$3, spec_value=$4, unit=$5, notes=$6 WHERE id=$7 RETURNING *',
      [vehicle_id, category, spec_name, spec_value, unit, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM specs WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
