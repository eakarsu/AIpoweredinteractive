// Custom Views — AI-Powered Interactive Content
// 4 endpoints: engagement-timeline, interaction-heatmap, interaction-report (PDF), content-rules (CRUD)
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// In-memory store for content branching rules (seeded with examples)
let _rulesAutoId = 4;
const contentRules = [
  {
    id: 1,
    name: 'Onboarding Quiz Branch',
    triggerEvent: 'quiz_completed',
    contentType: 'tutorial',
    condition: 'score >= 80',
    action: 'unlock_advanced_module',
    priority: 1,
    active: true,
    createdAt: '2026-05-12T10:00:00Z',
  },
  {
    id: 2,
    name: 'Idle Re-Engagement',
    triggerEvent: 'idle_30s',
    contentType: 'video',
    condition: 'progress < 25',
    action: 'show_interactive_prompt',
    priority: 2,
    active: true,
    createdAt: '2026-05-13T09:30:00Z',
  },
  {
    id: 3,
    name: 'Hotspot Drill-Down',
    triggerEvent: 'hotspot_clicked',
    contentType: 'interactive_image',
    condition: 'region == "engine"',
    action: 'open_detail_overlay',
    priority: 3,
    active: false,
    createdAt: '2026-05-14T14:15:00Z',
  },
];

// Synthetic time-series + interaction data
function buildEngagementTimeline(days = 14) {
  const out = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const sessions = 40 + Math.round(Math.sin(i / 2) * 18 + Math.random() * 25);
    const avgMin = +(3 + Math.cos(i / 3) * 1.4 + Math.random() * 1.2).toFixed(2);
    const completions = Math.max(5, Math.round(sessions * (0.35 + Math.random() * 0.3)));
    out.push({
      date: d.toISOString().slice(0, 10),
      sessions,
      avgMinutes: avgMin,
      completions,
      interactions: Math.round(sessions * (4 + Math.random() * 3)),
    });
  }
  return out;
}

const CONTENT_ITEMS = [
  'Engine Tutorial',
  'Brake System Video',
  'Dashboard Quiz',
  'Safety Checklist',
  'Maintenance Guide',
  'Warning Lights Demo',
];
const ACTIONS = ['view', 'click', 'complete', 'replay', 'share'];

function buildHeatmap() {
  const matrix = CONTENT_ITEMS.map((content) => {
    const row = { content };
    let total = 0;
    ACTIONS.forEach((action) => {
      const v = Math.round(20 + Math.random() * 140);
      row[action] = v;
      total += v;
    });
    row.total = total;
    return row;
  });
  return { contentItems: CONTENT_ITEMS, actions: ACTIONS, matrix };
}

// 1) VIZ: user engagement timeline
router.get('/engagement-timeline', auth, async (req, res) => {
  try {
    const days = Math.min(60, Math.max(7, parseInt(req.query.days, 10) || 14));
    const series = buildEngagementTimeline(days);
    const totalSessions = series.reduce((s, p) => s + p.sessions, 0);
    const totalInteractions = series.reduce((s, p) => s + p.interactions, 0);
    const avgMinutes = +(series.reduce((s, p) => s + p.avgMinutes, 0) / series.length).toFixed(2);
    res.json({
      ok: true,
      days,
      series,
      summary: { totalSessions, totalInteractions, avgMinutes },
    });
  } catch (e) {
    res.status(500).json({ error: e.message || 'engagement-timeline failed' });
  }
});

// 2) VIZ: content x action interaction heatmap
router.get('/interaction-heatmap', auth, async (req, res) => {
  try {
    const data = buildHeatmap();
    const max = Math.max(
      ...data.matrix.flatMap((r) => data.actions.map((a) => r[a]))
    );
    res.json({ ok: true, ...data, max });
  } catch (e) {
    res.status(500).json({ error: e.message || 'interaction-heatmap failed' });
  }
});

// 3) NON-VIZ: interaction report as PDF (minimal hand-crafted PDF, no library)
router.get('/interaction-report', auth, async (req, res) => {
  try {
    const days = 7;
    const series = buildEngagementTimeline(days);
    const heat = buildHeatmap();
    const totalSessions = series.reduce((s, p) => s + p.sessions, 0);
    const totalInteractions = series.reduce((s, p) => s + p.interactions, 0);

    // Compose PDF text lines
    const lines = [
      'AI-Powered Interactive Content - Interaction Report',
      `Generated: ${new Date().toISOString()}`,
      `Window: last ${days} days`,
      '',
      'Engagement Summary',
      `  Total Sessions: ${totalSessions}`,
      `  Total Interactions: ${totalInteractions}`,
      '',
      'Daily Sessions',
    ];
    series.forEach((p) => lines.push(`  ${p.date}  sessions=${p.sessions}  interactions=${p.interactions}`));
    lines.push('');
    lines.push('Top Content by Interactions');
    const ranked = [...heat.matrix].sort((a, b) => b.total - a.total).slice(0, 5);
    ranked.forEach((r, i) => lines.push(`  ${i + 1}. ${r.content} (total=${r.total})`));

    // Build a simple single-page PDF
    function escapePdf(s) {
      return String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    }
    const contentParts = ['BT', '/F1 12 Tf', '14 TL', '50 760 Td'];
    lines.forEach((ln, idx) => {
      contentParts.push(`(${escapePdf(ln)}) Tj`);
      if (idx < lines.length - 1) contentParts.push('T*');
    });
    contentParts.push('ET');
    const stream = contentParts.join('\n');

    const objects = [];
    objects.push('<< /Type /Catalog /Pages 2 0 R >>');
    objects.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>');
    objects.push(`<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`);
    objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

    let pdf = '%PDF-1.4\n';
    const offsets = [];
    objects.forEach((body, i) => {
      offsets.push(Buffer.byteLength(pdf, 'utf8'));
      pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
    });
    const xrefStart = Buffer.byteLength(pdf, 'utf8');
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    offsets.forEach((off) => {
      pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="interaction-report.pdf"');
    res.send(Buffer.from(pdf, 'utf8'));
  } catch (e) {
    res.status(500).json({ error: e.message || 'interaction-report failed' });
  }
});

// 4) NON-VIZ: content rules CRUD
router.get('/content-rules', auth, async (req, res) => {
  res.json({ ok: true, items: contentRules });
});

router.post('/content-rules', auth, async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.name || !b.triggerEvent) {
      return res.status(400).json({ error: 'name and triggerEvent are required' });
    }
    const rule = {
      id: ++_rulesAutoId,
      name: String(b.name),
      triggerEvent: String(b.triggerEvent),
      contentType: b.contentType || 'tutorial',
      condition: b.condition || '',
      action: b.action || 'noop',
      priority: Number(b.priority) || contentRules.length + 1,
      active: b.active !== false,
      createdAt: new Date().toISOString(),
    };
    contentRules.push(rule);
    res.json({ ok: true, item: rule });
  } catch (e) {
    res.status(500).json({ error: e.message || 'create failed' });
  }
});

router.put('/content-rules/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const idx = contentRules.findIndex((r) => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'rule not found' });
    const b = req.body || {};
    contentRules[idx] = {
      ...contentRules[idx],
      ...(b.name !== undefined ? { name: String(b.name) } : {}),
      ...(b.triggerEvent !== undefined ? { triggerEvent: String(b.triggerEvent) } : {}),
      ...(b.contentType !== undefined ? { contentType: String(b.contentType) } : {}),
      ...(b.condition !== undefined ? { condition: String(b.condition) } : {}),
      ...(b.action !== undefined ? { action: String(b.action) } : {}),
      ...(b.priority !== undefined ? { priority: Number(b.priority) } : {}),
      ...(b.active !== undefined ? { active: !!b.active } : {}),
    };
    res.json({ ok: true, item: contentRules[idx] });
  } catch (e) {
    res.status(500).json({ error: e.message || 'update failed' });
  }
});

router.delete('/content-rules/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const idx = contentRules.findIndex((r) => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'rule not found' });
    const [removed] = contentRules.splice(idx, 1);
    res.json({ ok: true, removed });
  } catch (e) {
    res.status(500).json({ error: e.message || 'delete failed' });
  }
});

module.exports = router;
