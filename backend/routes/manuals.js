const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, v.make, v.model, v.year
      FROM manuals m LEFT JOIN vehicles v ON m.vehicle_id = v.id
      ORDER BY m.chapter, m.page_number
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, v.make, v.model, v.year
      FROM manuals m LEFT JOIN vehicles v ON m.vehicle_id = v.id
      WHERE m.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Manual not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { vehicle_id, title, category, content, page_number, chapter } = req.body;
    const result = await pool.query(
      'INSERT INTO manuals (vehicle_id, title, category, content, page_number, chapter) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [vehicle_id, title, category, content, page_number, chapter]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { vehicle_id, title, category, content, page_number, chapter } = req.body;
    const result = await pool.query(
      'UPDATE manuals SET vehicle_id=$1, title=$2, category=$3, content=$4, page_number=$5, chapter=$6 WHERE id=$7 RETURNING *',
      [vehicle_id, title, category, content, page_number, chapter, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Manual not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM manuals WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Manual not found' });
    res.json({ message: 'Manual deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
