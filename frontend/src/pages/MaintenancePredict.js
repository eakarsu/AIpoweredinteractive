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

function MaintenancePredict({ showToast }) {
  const [vehicleId, setVehicleId] = useState('');
  const [historyText, setHistoryText] = useState('');
  const [currentMileage, setCurrentMileage] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    try {
      const payload = {};
      if (vehicleId) payload.vehicle_id = vehicleId;
      if (currentMileage) payload.current_mileage = Number(currentMileage);
      if (historyText.trim()) {
        const parsed = safeParseJSON(historyText.trim(), null);
        if (Array.isArray(parsed)) payload.history = parsed;
        else payload.history_text = historyText.trim();
      }
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/ai/maintenance-predict`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setResponse(res.data);
    } catch (err) {
      showToast?.(err.response?.data?.error || 'AI request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const predictions = response?.parsed?.predictions || response?.parsed?.next_services || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>🛠️ Maintenance Predictor</h2>
          <p>Predict next service windows from maintenance history</p>
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
                placeholder="Pulls history from server"
              />
            </div>
            <div className="form-group">
              <label>Current Mileage</label>
              <input
                className="form-control"
                type="number"
                value={currentMileage}
                onChange={(e) => setCurrentMileage(e.target.value)}
                placeholder="e.g., 45000"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Maintenance History (JSON array or free text)</label>
            <textarea
              className="form-control"
              rows={6}
              value={historyText}
              onChange={(e) => setHistoryText(e.target.value)}
              placeholder='[{"date":"2024-06-01","mileage":40000,"service":"Oil change"}]  — or paste a freeform list'
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
                Predicting...
              </>
            ) : (
              <>🤖 Predict Next Services</>
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

          {predictions.length > 0 && (
            <div style={{ padding: '16px 24px' }}>
              <h4 style={{ marginBottom: 12 }}>Predicted Services</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#0f172a' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Service</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Mileage Window</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Day Window</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Urgency</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Cost Est</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 12px' }}>{p.service || p.name || '-'}</td>
                      <td style={{ padding: '8px 12px' }}>
                        {p.mileage_window || p.mileage || '-'}
                      </td>
                      <td style={{ padding: '8px 12px' }}>{p.day_window || p.days || '-'}</td>
                      <td style={{ padding: '8px 12px' }}>{p.urgency || '-'}</td>
                      <td style={{ padding: '8px 12px' }}>{p.cost_estimate || p.cost || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="ai-response-content">
            <ReactMarkdown>{response.response || response.content || JSON.stringify(response.parsed, null, 2)}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default MaintenancePredict;
