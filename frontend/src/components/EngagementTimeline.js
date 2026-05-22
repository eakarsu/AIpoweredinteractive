// VIZ: User Engagement Timeline (SVG line chart)
import React, { useEffect, useState } from 'react';

export default function EngagementTimeline() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || '';
        const res = await fetch('/api/custom-views/engagement-timeline?days=14', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const j = await res.json();
        setData(j);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ color: '#9ca3af' }}>Loading timeline…</div>;
  if (error) return <div style={{ color: '#fecaca' }}>Error: {error}</div>;
  if (!data?.series?.length) return <div style={{ color: '#9ca3af' }}>No data.</div>;

  const series = data.series;
  const W = 640;
  const H = 220;
  const PAD = 36;
  const maxV = Math.max(...series.map((p) => p.sessions));
  const points = series.map((p, i) => {
    const x = PAD + (i / (series.length - 1)) * (W - PAD * 2);
    const y = H - PAD - (p.sessions / maxV) * (H - PAD * 2);
    return [x, y, p];
  });
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');

  return (
    <div style={{ background: '#111827', padding: 16, borderRadius: 8 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: '#e5e7eb' }}>User Engagement Timeline</h3>
      <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 10 }}>
        Sessions: {data.summary.totalSessions} · Interactions: {data.summary.totalInteractions} · Avg min/session: {data.summary.avgMinutes}
      </div>
      <svg width={W} height={H} style={{ background: '#0b1220', borderRadius: 6 }}>
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#374151" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#374151" />
        <path d={path} fill="none" stroke="#6366f1" strokeWidth="2.5" />
        {points.map(([x, y, p], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="3.5" fill="#a5b4fc" />
            {i % 3 === 0 && (
              <text x={x} y={H - 12} fontSize="10" fill="#9ca3af" textAnchor="middle">
                {p.date.slice(5)}
              </text>
            )}
          </g>
        ))}
        <text x={8} y={PAD} fontSize="10" fill="#9ca3af">{maxV}</text>
        <text x={8} y={H - PAD} fontSize="10" fill="#9ca3af">0</text>
      </svg>
    </div>
  );
}
