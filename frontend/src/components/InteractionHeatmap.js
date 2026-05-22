// VIZ: Content x Action Interaction Heatmap
import React, { useEffect, useState } from 'react';

export default function InteractionHeatmap() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || '';
        const res = await fetch('/api/custom-views/interaction-heatmap', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setData(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ color: '#9ca3af' }}>Loading heatmap…</div>;
  if (error) return <div style={{ color: '#fecaca' }}>Error: {error}</div>;
  if (!data) return null;

  const cellColor = (v) => {
    const ratio = v / (data.max || 1);
    const hue = 220 - Math.round(ratio * 200); // blue -> red-ish
    const light = 25 + Math.round(ratio * 35);
    return `hsl(${hue}, 75%, ${light}%)`;
  };

  return (
    <div style={{ background: '#111827', padding: 16, borderRadius: 8 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: '#e5e7eb' }}>Content × Action Heatmap</h3>
      <table style={{ borderCollapse: 'separate', borderSpacing: 4, width: '100%' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', color: '#9ca3af', fontSize: 12, padding: 4 }}>Content</th>
            {data.actions.map((a) => (
              <th key={a} style={{ color: '#9ca3af', fontSize: 12, padding: 4 }}>{a}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.matrix.map((row) => (
            <tr key={row.content}>
              <td style={{ color: '#e5e7eb', fontSize: 13, padding: 4, whiteSpace: 'nowrap' }}>{row.content}</td>
              {data.actions.map((a) => (
                <td
                  key={a}
                  title={`${row.content} / ${a} = ${row[a]}`}
                  style={{
                    background: cellColor(row[a]),
                    color: '#fff',
                    textAlign: 'center',
                    padding: '12px 8px',
                    borderRadius: 4,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    minWidth: 56,
                  }}
                >
                  {row[a]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ color: '#9ca3af', fontSize: 11, marginTop: 8 }}>Max cell value: {data.max}</div>
    </div>
  );
}
