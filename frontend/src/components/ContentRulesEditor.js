// NON-VIZ: Content Rules Editor — CRUD for branching triggers
import React, { useEffect, useState } from 'react';

const EMPTY = {
  name: '',
  triggerEvent: 'quiz_completed',
  contentType: 'tutorial',
  condition: '',
  action: '',
  priority: 1,
  active: true,
};

const TRIGGERS = ['quiz_completed', 'idle_30s', 'hotspot_clicked', 'video_paused', 'scroll_50pct'];
const CONTENT_TYPES = ['tutorial', 'video', 'interactive_image', 'quiz', 'overlay'];

export default function ContentRulesEditor() {
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || '';
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/custom-views/content-rules', { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      setItems(j.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line

  const save = async () => {
    setError(null);
    try {
      const url = editingId
        ? `/api/custom-views/content-rules/${editingId}`
        : '/api/custom-views/content-rules';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(draft) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDraft(EMPTY);
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    try {
      const res = await fetch(`/api/custom-views/content-rules/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const edit = (r) => {
    setEditingId(r.id);
    setDraft({
      name: r.name,
      triggerEvent: r.triggerEvent,
      contentType: r.contentType,
      condition: r.condition,
      action: r.action,
      priority: r.priority,
      active: r.active,
    });
  };

  const cancel = () => {
    setEditingId(null);
    setDraft(EMPTY);
  };

  const fld = { padding: 8, background: '#1f2937', color: '#e5e7eb', border: '1px solid #374151', borderRadius: 4, fontSize: 13 };

  return (
    <div style={{ background: '#111827', padding: 16, borderRadius: 8 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: '#e5e7eb' }}>Content Rules Editor</h3>
      <p style={{ color: '#9ca3af', fontSize: 12, marginBottom: 12 }}>
        Define branching triggers — when an event fires on a content type, evaluate a condition and run an action.
      </p>

      {error && <div style={{ background: '#7f1d1d', color: '#fecaca', padding: 8, borderRadius: 4, marginBottom: 10 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 10 }}>
        <input style={fld} placeholder="Rule name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <select style={fld} value={draft.triggerEvent} onChange={(e) => setDraft({ ...draft, triggerEvent: e.target.value })}>
          {TRIGGERS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select style={fld} value={draft.contentType} onChange={(e) => setDraft({ ...draft, contentType: e.target.value })}>
          {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input style={fld} placeholder="Condition (e.g. score >= 80)" value={draft.condition} onChange={(e) => setDraft({ ...draft, condition: e.target.value })} />
        <input style={fld} placeholder="Action (e.g. unlock_module)" value={draft.action} onChange={(e) => setDraft({ ...draft, action: e.target.value })} />
        <input style={fld} type="number" placeholder="Priority" value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })} />
      </div>
      <label style={{ color: '#e5e7eb', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
        Active
      </label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={save}
          disabled={!draft.name || !draft.triggerEvent}
          style={{ padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer', opacity: !draft.name ? 0.5 : 1 }}
        >
          {editingId ? 'Update Rule' : 'Create Rule'}
        </button>
        {editingId && (
          <button onClick={cancel} style={{ padding: '8px 16px', background: '#374151', color: '#e5e7eb', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Cancel
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ color: '#9ca3af' }}>Loading rules…</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: '#9ca3af', textAlign: 'left' }}>
              <th style={{ padding: 6 }}>Name</th>
              <th style={{ padding: 6 }}>Trigger</th>
              <th style={{ padding: 6 }}>Content</th>
              <th style={{ padding: 6 }}>Condition</th>
              <th style={{ padding: 6 }}>Action</th>
              <th style={{ padding: 6 }}>P</th>
              <th style={{ padding: 6 }}>On</th>
              <th style={{ padding: 6 }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} style={{ borderTop: '1px solid #1f2937', color: '#e5e7eb' }}>
                <td style={{ padding: 6 }}>{r.name}</td>
                <td style={{ padding: 6, fontFamily: 'monospace', color: '#a5b4fc' }}>{r.triggerEvent}</td>
                <td style={{ padding: 6 }}>{r.contentType}</td>
                <td style={{ padding: 6, fontFamily: 'monospace', color: '#9ca3af' }}>{r.condition || '—'}</td>
                <td style={{ padding: 6, fontFamily: 'monospace', color: '#34d399' }}>{r.action || '—'}</td>
                <td style={{ padding: 6 }}>{r.priority}</td>
                <td style={{ padding: 6 }}>{r.active ? '✓' : '·'}</td>
                <td style={{ padding: 6 }}>
                  <button onClick={() => edit(r)} style={{ marginRight: 4, padding: '4px 8px', background: '#1f2937', color: '#e5e7eb', border: '1px solid #374151', borderRadius: 3, cursor: 'pointer', fontSize: 12 }}>
                    Edit
                  </button>
                  <button onClick={() => remove(r.id)} style={{ padding: '4px 8px', background: '#7f1d1d', color: '#fecaca', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 12 }}>
                    Del
                  </button>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr><td colSpan="8" style={{ padding: 10, color: '#9ca3af' }}>No rules yet.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
