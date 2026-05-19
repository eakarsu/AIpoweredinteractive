import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const API = 'http://localhost:3001/api';

function safeParseJSON(text, fallback) {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function RecallImpactAssess({ showToast }) {
  const [vehicleId, setVehicleId] = useState('');
  const [vin, setVin] = useState('');
  const [recallsText, setRecallsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    try {
      const payload = {};
      if (vehicleId) payload.vehicle_id = vehicleId;
      if (vin) payload.vin = vin;
      if (recallsText.trim()) {
        const parsed = safeParseJSON(recallsText.trim(), null);
        if (Array.isArray(parsed)) payload.recalls = parsed;
        else payload.recalls_text = recallsText.trim();
      }
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/ai/recall-impact-assess`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setResponse(res.data);
    } catch (err) {
      showToast?.(err.response?.data?.error || 'AI request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const affected = response?.parsed?.affected || response?.parsed?.applicable || [];
  const notApplicable = response?.parsed?.not_applicable || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>📢 Recall Impact Assessor</h2>
          <p>Determine which recalls apply to a vehicle and how urgent</p>
        </div>
      </div>

      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="two-col">
            <div className="form-group">
              <label>Vehicle ID (optional)</label>
              <input
                className="form-control"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                placeholder="Pulls recalls from server"
              />
            </div>
            <div className="form-group">
              <label>VIN (optional)</label>
              <input
                className="form-control"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                placeholder="17-char VIN"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Recalls (JSON array or free text)</label>
            <textarea
              className="form-control"
              rows={6}
              value={recallsText}
              onChange={(e) => setRecallsText(e.target.value)}
              placeholder='[{"id":"NHTSA-23V123","summary":"Brake actuator may fail"}]'
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ minWidth: '220px', justifyContent: 'center' }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', margin: 0 }}></div>
                Assessing...
              </>
            ) : (
              <>🤖 Assess Recall Impact</>
            )}
          </button>
        </form>
      </div>

      {response && (
        <div className="ai-response">
          <div className="ai-response-header">
            <span className="ai-badge">AI Response</span>
            <span className="model-info">
              Model: {response.model || 'claude-haiku'}
              {response.usage && ` | Tokens: ${response.usage.total_tokens || ''}`}
            </span>
          </div>

          {affected.length > 0 && (
            <div style={{ padding: '16px 24px' }}>
              <h4 style={{ marginBottom: 12, color: '#ef4444' }}>Affected / Applicable</h4>
              {affected.map((r, i) => (
                <div
                  key={i}
                  style={{
                    background: '#7f1d1d22',
                    border: '1px solid #7f1d1d',
                    borderRadius: 8,
                    padding: '10px 14px',
                    marginBottom: 8,
                    fontSize: 13,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>
                    {r.id || r.recall_id || '-'}{' '}
                    {r.urgency && (
                      <span style={{ color: '#fca5a5', marginLeft: 8 }}>[{r.urgency}]</span>
                    )}
                  </div>
                  {r.summary && <div style={{ color: '#fecaca' }}>{r.summary}</div>}
                  {r.action && <div style={{ color: '#cbd5e1' }}>Action: {r.action}</div>}
                </div>
              ))}
            </div>
          )}

          {notApplicable.length > 0 && (
            <div style={{ padding: '16px 24px' }}>
              <h4 style={{ marginBottom: 12, color: '#10b981' }}>Not Applicable</h4>
              {notApplicable.map((r, i) => (
                <div
                  key={i}
                  style={{
                    background: '#0f172a',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    marginBottom: 8,
                    fontSize: 13,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{r.id || r.recall_id || '-'}</div>
                  {r.reason && <div style={{ color: '#94a3b8' }}>{r.reason}</div>}
                </div>
              ))}
            </div>
          )}

          <div className="ai-response-content">
            <ReactMarkdown>
              {response.response || response.content || JSON.stringify(response.parsed, null, 2)}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecallImpactAssess;
