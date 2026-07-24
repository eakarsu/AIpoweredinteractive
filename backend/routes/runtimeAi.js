'use strict';

const crypto = require('node:crypto');
const express = require('express');
const fetch = require('node-fetch');
const pool = require('../db');

function configuration() {
  const apiKey = String(process.env.OPENROUTER_API_KEY || '').trim();
  const model = String(process.env.OPENROUTER_MODEL || '').trim();
  const baseUrl = String(process.env.OPENROUTER_BASE_URL || '').replace(/\/+$/, '');
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is required');
  if (!model) throw new Error('OPENROUTER_MODEL is required');
  if (baseUrl !== 'https://openrouter.ai/api/v1') throw new Error('OPENROUTER_BASE_URL must be https://openrouter.ai/api/v1');
  return { apiKey, model, endpoint: `${baseUrl}/chat/completions` };
}

const router = express.Router();

router.get('/history', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id,feature,input,output,model,created_at FROM vehicle_ai_interactions
       WHERE tenant_id=$1 AND actor_id=$2 ORDER BY created_at DESC LIMIT 50`,
      [req.user.tenantId, String(req.user.id)],
    );
    res.json({ history: result.rows });
  } catch (error) { next(error); }
});

router.post('/chat', async (req, res, next) => {
  try {
    const message = String(req.body?.message || '').trim();
    if (!message) return res.status(400).json({ error: 'message_required' });
    const { apiKey, model, endpoint } = configuration();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'X-Title': 'AI Owner Manual' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are an automotive owner-manual assistant. Give safe, specific guidance and advise professional inspection when evidence is insufficient.' },
          { role: 'user', content: message },
        ],
        max_tokens: 700,
      }),
    });
    if (!response.ok) throw new Error(`OpenRouter API error (${response.status})`);
    const body = await response.json();
    const answer = String(body.choices?.[0]?.message?.content || '').trim();
    if (!answer) throw new Error('OpenRouter returned an empty response');
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO vehicle_ai_interactions(id,tenant_id,actor_id,feature,input,output,model)
       VALUES($1,$2,$3,'chat',$4::jsonb,$5::jsonb,$6)`,
      [id, req.user.tenantId, String(req.user.id), JSON.stringify({ message }), JSON.stringify({ response: answer }), model],
    );
    res.json({ response: answer, model, interactionId: id });
  } catch (error) { next(error); }
});

module.exports = router;
