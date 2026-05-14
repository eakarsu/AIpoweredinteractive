/**
 * Apply pass 5 — backlog endpoints for AIpoweredinteractive (AutoManual AI).
 *
 * Mounted under `/api/extras`. Heavy/external integrations gate on env and
 * return HTTP 503 + `{ missing: <ENV> }` when unset.
 *
 * Categories:
 *   1. service-quality-predict — NEEDS-PRODUCT-DECISION. Default: heuristic
 *      using user-supplied labor-time and parts cost; AI summary if key set.
 *      Real implementation needs Mitchell/Chilton labor-time data.
 *   2. vehicle-telematics      — NEEDS-CREDS (TESLA_API_KEY or BMW_CONNECTED_API_KEY).
 *   3. nhtsa-recall-feed       — NEEDS-CREDS (NHTSA_USER_AGENT). NHTSA's vPIC
 *      and Recalls APIs are open but ask for an identifying UA.
 *   4. parts-retailer          — NEEDS-CREDS (ROCKAUTO_API_KEY or AUTOZONE_API_KEY).
 *   5. appointment-booking     — NEEDS-PRODUCT-DECISION. Default: local
 *      bookings table (no external dealer-network integration).
 */
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

require('dotenv').config({ path: '../.env' });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

router.use(authenticateToken);

async function callOR(systemPrompt, userMessage, maxTokens = 800, temperature = 0.3) {
  if (!OPENROUTER_API_KEY) return { error: 'OPENROUTER_API_KEY not configured' };
  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'AI Owner Manual'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: maxTokens,
        temperature
      })
    });
    const data = await r.json();
    if (data.error) return { error: data.error.message || 'AI service error' };
    return { content: data.choices?.[0]?.message?.content, model: data.model };
  } catch (e) {
    return { error: e.message };
  }
}

// --- 1. SERVICE-QUALITY-PREDICT (NEEDS-PRODUCT-DECISION) -------------------
// PRODUCT-DECISION: caller supplies labor_hours and parts_cost; we compute a
// reasonableness band from a static avg labor rate ($120/hr default). Real
// impl would lookup Mitchell or Chilton flat-rate guides.
router.post('/service-quality-predict', async (req, res) => {
  try {
    const {
      vehicle, service_type, quoted_total, labor_hours = 0, parts_cost = 0,
      shop_rating, use_ai_summary = false,
      labor_rate_per_hour = Number(process.env.SERVICE_LABOR_RATE_USD) || 120,
    } = req.body || {};
    if (!service_type || typeof quoted_total !== 'number') {
      return res.status(400).json({ error: 'service_type and quoted_total required' });
    }
    const expected = Math.max(0, Number(labor_hours) * labor_rate_per_hour) + Math.max(0, Number(parts_cost));
    const band_low = expected * 0.85;
    const band_high = expected * 1.20;
    let verdict = 'reasonable';
    if (quoted_total < band_low) verdict = 'below_expected';
    else if (quoted_total > band_high) verdict = 'above_expected';
    const heuristic = {
      service_type,
      vehicle: vehicle || null,
      quoted_total,
      expected_total: Number(expected.toFixed(2)),
      band: { low: Number(band_low.toFixed(2)), high: Number(band_high.toFixed(2)) },
      verdict,
      labor_rate_per_hour,
      shop_rating: shop_rating ?? null,
    };
    let ai_summary = null;
    if (use_ai_summary) {
      const r = await callOR(
        'You are an automotive service advisor. Given a quote and a heuristic band, advise the owner. JSON only.',
        `${JSON.stringify(heuristic)}\nReturn {"recommendation": string, "questions_to_ask_shop": [string], "red_flags": [string]}.`
      );
      if (r.error) {
        if (r.error.includes('OPENROUTER_API_KEY')) {
          return res.json({ heuristic, ai_unavailable: true, missing: 'OPENROUTER_API_KEY' });
        }
        return res.status(502).json({ error: r.error });
      }
      ai_summary = r.content;
    }
    res.json({ heuristic, ai_summary, source: 'heuristic-only (no Mitchell/Chilton data)' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 2. VEHICLE TELEMATICS (NEEDS-CREDS) ------------------------------------
router.post('/telematics/snapshot', async (req, res) => {
  if (!process.env.TESLA_API_KEY && !process.env.BMW_CONNECTED_API_KEY && !process.env.OBD2_API_KEY) {
    return res.status(503).json({
      error: 'Vehicle telematics not configured',
      missing: 'TESLA_API_KEY (or BMW_CONNECTED_API_KEY / OBD2_API_KEY)',
    });
  }
  const { vin, provider } = req.body || {};
  if (!vin) return res.status(400).json({ error: 'vin required' });
  return res.status(202).json({
    queued: true,
    provider: provider || (process.env.TESLA_API_KEY ? 'tesla'
                          : process.env.BMW_CONNECTED_API_KEY ? 'bmw'
                          : 'obd2'),
    vin,
    note: 'Snapshot would be fetched from provider; outbound HTTP intentionally not wired in stub.',
  });
});

// --- 3. NHTSA RECALL FEED (NEEDS-CREDS: USER-AGENT) -------------------------
router.post('/nhtsa-recall/pull', async (req, res) => {
  if (!process.env.NHTSA_USER_AGENT) {
    return res.status(503).json({
      error: 'NHTSA pull not configured',
      missing: 'NHTSA_USER_AGENT',
      hint: 'Set to "Your-App contact@example.com" — NHTSA prefers identifying UAs.',
    });
  }
  const { make, model, year } = req.body || {};
  if (!make || !model || !year) return res.status(400).json({ error: 'make, model, year required' });
  const url = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${encodeURIComponent(year)}`;
  return res.json({
    pull_planned: true,
    url,
    user_agent: process.env.NHTSA_USER_AGENT,
    note: 'URL ready; outbound HTTP intentionally not wired in this stub.',
  });
});

// --- 4. PARTS RETAILER (NEEDS-CREDS) ----------------------------------------
router.post('/parts-retailer/lookup', async (req, res) => {
  if (!process.env.ROCKAUTO_API_KEY && !process.env.AUTOZONE_API_KEY) {
    return res.status(503).json({
      error: 'Parts retailer not configured',
      missing: 'ROCKAUTO_API_KEY (or AUTOZONE_API_KEY)',
    });
  }
  const { part_number, vehicle } = req.body || {};
  if (!part_number) return res.status(400).json({ error: 'part_number required' });
  return res.status(202).json({
    queued: true,
    provider: process.env.ROCKAUTO_API_KEY ? 'rockauto' : 'autozone',
    part_number,
    vehicle: vehicle || null,
    note: 'Outbound HTTP intentionally not wired in stub.',
  });
});

// --- 5. APPOINTMENT BOOKING (NEEDS-PRODUCT-DECISION) ------------------------
// PRODUCT-DECISION: local bookings only. Dealer-network APIs require OEM
// partnerships per brand — out of scope. We expose CRUD for "service_appointments".
async function ensureBookingsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_appointments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        vehicle_id INTEGER,
        shop_name TEXT,
        service_type TEXT,
        scheduled_at TIMESTAMPTZ,
        notes TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_appt_user ON service_appointments(user_id);
    `);
  } catch (_) {}
}
ensureBookingsTable();

router.post('/appointments', async (req, res) => {
  try {
    const { vehicle_id, shop_name, service_type, scheduled_at, notes } = req.body || {};
    if (!service_type || !scheduled_at) {
      return res.status(400).json({ error: 'service_type and scheduled_at required' });
    }
    const r = await pool.query(
      `INSERT INTO service_appointments (user_id, vehicle_id, shop_name, service_type, scheduled_at, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user?.id || null, vehicle_id || null, shop_name || null, service_type, scheduled_at, notes || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/appointments', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT * FROM service_appointments WHERE user_id = $1 OR user_id IS NULL ORDER BY scheduled_at DESC LIMIT 100`,
      [req.user?.id || null]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/appointments/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM service_appointments WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)`, [req.params.id, req.user?.id || null]);
    res.json({ deleted: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
