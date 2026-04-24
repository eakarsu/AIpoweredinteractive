const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM warranty ORDER BY coverage_type, name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM warranty WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, coverage_type, duration_years, duration_miles, description, exclusions, deductible } = req.body;
    const result = await pool.query(
      'INSERT INTO warranty (name, coverage_type, duration_years, duration_miles, description, exclusions, deductible) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [name, coverage_type, duration_years, duration_miles, description, exclusions, deductible]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, coverage_type, duration_years, duration_miles, description, exclusions, deductible } = req.body;
    const result = await pool.query(
      'UPDATE warranty SET name=$1, coverage_type=$2, duration_years=$3, duration_miles=$4, description=$5, exclusions=$6, deductible=$7 WHERE id=$8 RETURNING *',
      [name, coverage_type, duration_years, duration_miles, description, exclusions, deductible, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM warranty WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
