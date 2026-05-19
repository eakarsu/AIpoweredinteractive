const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const pool = require('../db');
require('dotenv').config({ path: '../.env' });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

// AI Chat - General vehicle assistant
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    const systemPrompt = `You are an expert automotive assistant for an AI-Powered Interactive Owner's Manual system.
You help vehicle owners with questions about their vehicles, maintenance, troubleshooting, safety features, and more.
Provide clear, accurate, and helpful responses. Use bullet points and structured formatting when appropriate.
If you're unsure about something specific to a vehicle model, recommend consulting the specific owner's manual or a certified technician.
${context ? `Additional context: ${context}` : ''}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Owner Manual'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'AI service error' });
    }

    const aiResponse = data.choices?.[0]?.message?.content || 'No response generated';

    // Save conversation
    await pool.query(
      'INSERT INTO ai_conversations (question, answer, category) VALUES ($1, $2, $3)',
      [message, aiResponse, 'general']
    );

    res.json({
      response: aiResponse,
      model: data.model,
      usage: data.usage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Troubleshooting - Diagnose vehicle issues
router.post('/diagnose', async (req, res) => {
  try {
    const { symptoms, vehicle } = req.body;

    const systemPrompt = `You are an expert automotive diagnostic assistant. Based on the symptoms described, provide:
1. **Likely Causes** - List the most probable causes ranked by likelihood
2. **Severity Assessment** - Rate the urgency (Critical/High/Medium/Low)
3. **Recommended Actions** - Step-by-step actions the owner should take
4. **Estimated Cost Range** - Approximate repair cost range
5. **Can I Drive?** - Whether it's safe to continue driving

Be thorough but clear. Use plain language that a non-mechanic can understand.`;

    const userMessage = `Vehicle: ${vehicle || 'Not specified'}\nSymptoms: ${symptoms}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Owner Manual'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 1024,
        temperature: 0.5
      })
    });

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'No diagnosis generated';

    await pool.query(
      'INSERT INTO ai_conversations (question, answer, category) VALUES ($1, $2, $3)',
      [userMessage, aiResponse, 'diagnosis']
    );

    res.json({ response: aiResponse, model: data.model, usage: data.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Maintenance Advisor
router.post('/maintenance-advice', async (req, res) => {
  try {
    const { vehicle, mileage, last_service } = req.body;

    const systemPrompt = `You are a maintenance scheduling advisor. Based on the vehicle info provided, create a personalized maintenance plan. Include:
1. **Immediate Actions** - Services needed now
2. **Upcoming Services** - What's due in the next 3-6 months
3. **Long-term Planning** - Major services on the horizon
4. **Cost Estimation** - Approximate total maintenance budget
5. **Tips** - Money-saving tips and DIY opportunities

Format the response clearly with sections and bullet points.`;

    const userMessage = `Vehicle: ${vehicle || 'Not specified'}\nCurrent Mileage: ${mileage || 'Not specified'}\nLast Service: ${last_service || 'Not specified'}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Owner Manual'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 1024,
        temperature: 0.6
      })
    });

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'No advice generated';

    await pool.query(
      'INSERT INTO ai_conversations (question, answer, category) VALUES ($1, $2, $3)',
      [userMessage, aiResponse, 'maintenance']
    );

    res.json({ response: aiResponse, model: data.model, usage: data.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Warning Light Explainer
router.post('/explain-warning', async (req, res) => {
  try {
    const { warning_light, vehicle } = req.body;

    const systemPrompt = `You are an automotive warning light expert. When a user describes a warning light, explain:
1. **What It Means** - Clear explanation of the warning
2. **Severity Level** - How serious this is (use a visual scale)
3. **Immediate Steps** - What to do right now
4. **Common Causes** - Most likely reasons for this warning
5. **Safe to Drive?** - Whether you can continue driving and for how long

Be reassuring but honest. Safety always comes first.`;

    const userMessage = `Warning light: ${warning_light}\nVehicle: ${vehicle || 'Not specified'}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Owner Manual'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 1024,
        temperature: 0.5
      })
    });

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'No explanation generated';

    await pool.query(
      'INSERT INTO ai_conversations (question, answer, category) VALUES ($1, $2, $3)',
      [userMessage, aiResponse, 'warning']
    );

    res.json({ response: aiResponse, model: data.model, usage: data.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Parts Recommender
router.post('/recommend-parts', async (req, res) => {
  try {
    const { vehicle, need } = req.body;

    const systemPrompt = `You are an automotive parts advisor. Based on the user's needs, recommend:
1. **Recommended Parts** - Specific parts needed with quality tiers (OEM/Premium/Budget)
2. **Compatibility Notes** - Important fitment considerations
3. **Installation Difficulty** - DIY feasibility rating
4. **Price Ranges** - Expected cost for each quality tier
5. **Pro Tips** - Things to watch out for during purchase/installation`;

    const userMessage = `Vehicle: ${vehicle || 'Not specified'}\nNeed: ${need}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Owner Manual'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 1024,
        temperature: 0.6
      })
    });

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'No recommendation generated';

    await pool.query(
      'INSERT INTO ai_conversations (question, answer, category) VALUES ($1, $2, $3)',
      [userMessage, aiResponse, 'parts']
    );

    res.json({ response: aiResponse, model: data.model, usage: data.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Maintenance Predictor - predict when service will be needed based on vehicle data and maintenance history
router.post('/maintenance-predict', async (req, res) => {
  try {
    const { vehicle_id, vehicle, mileage, driving_style, climate, last_services } = req.body;

    let history = last_services;
    if (!history && vehicle_id) {
      try {
        const result = await pool.query(
          'SELECT service_type, service_date, mileage_at_service, notes FROM maintenance WHERE vehicle_id = $1 ORDER BY service_date DESC LIMIT 30',
          [vehicle_id]
        );
        history = result.rows.map(r => `${r.service_date}: ${r.service_type} @ ${r.mileage_at_service} mi (${r.notes || 'n/a'})`).join('\n');
      } catch (_) {}
    }

    const systemPrompt = 'You are a vehicle maintenance prediction AI. Predict next-service-need windows based on mileage, driving style, climate, and history. Return JSON only.';
    const userMessage = `Vehicle: ${vehicle || 'unknown'}
Current Mileage: ${mileage || 'unknown'}
Driving Style: ${driving_style || 'normal'}
Climate: ${climate || 'temperate'}

Recent service history:
${history || 'None provided'}

Return JSON only:
{
  "predictions": [
    {"service": "string", "predicted_in_miles": 0, "predicted_in_days": 0, "urgency": "low|medium|high", "reason": "string", "estimated_cost_usd": 0}
  ],
  "overdue_services": ["string"],
  "monitoring_recommendations": ["string"],
  "summary": "string"
}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Owner Manual'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 1024,
        temperature: 0.4
      })
    });

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'No prediction generated';

    await pool.query(
      'INSERT INTO ai_conversations (question, answer, category) VALUES ($1, $2, $3)',
      [userMessage, aiResponse, 'maintenance-predict']
    );

    res.json({ response: aiResponse, model: data.model, usage: data.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Recall Impact Assessment - flag recalls affecting a user's vehicle
router.post('/recall-impact-assess', async (req, res) => {
  try {
    const { vehicle_id, vehicle, vin, recalls } = req.body;

    let recallList = recalls;
    if (!recallList) {
      try {
        const result = await pool.query(
          'SELECT recall_id, title, description, severity, issued_at, fix_action FROM recalls ORDER BY issued_at DESC LIMIT 30'
        );
        recallList = result.rows;
      } catch (_) { recallList = []; }
    }

    const systemPrompt = 'You are an automotive safety analyst. Determine which recalls likely affect this vehicle and how urgently to act. Return JSON only.';
    const userMessage = `Vehicle: ${vehicle || 'unknown'}
VIN: ${vin || 'unknown'}
Vehicle ID: ${vehicle_id || 'unknown'}

Recall pool:
${(recallList || []).map(r => `id=${r.recall_id || r.id || 'n/a'} title=${r.title} severity=${r.severity || 'n/a'} issued=${r.issued_at || 'n/a'} desc=${r.description || ''} fix=${r.fix_action || 'n/a'}`).join('\n') || 'None provided'}

Return JSON only:
{
  "affected_recalls": [{"id": "string", "applies_to_vehicle": true, "severity": "low|moderate|high|critical", "urgency": "routine|soon|stop_driving", "reason": "string", "owner_action": "string"}],
  "non_applicable": [{"id": "string", "why_not": "string"}],
  "overall_priority": "none|routine|soon|urgent",
  "summary": "string"
}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Owner Manual'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 1024,
        temperature: 0.3
      })
    });

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'No recall assessment generated';

    await pool.query(
      'INSERT INTO ai_conversations (question, answer, category) VALUES ($1, $2, $3)',
      [userMessage, aiResponse, 'recall-impact']
    );

    res.json({ response: aiResponse, model: data.model, usage: data.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get AI conversation history
router.get('/history', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ai_conversations ORDER BY created_at DESC LIMIT 50');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
