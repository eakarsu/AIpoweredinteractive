import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const API = 'http://localhost:3001/api';

const aiFeatures = [
  { id: 'chat', label: 'General Chat', icon: '💬', desc: 'Ask any vehicle-related question', color: '#6366f1' },
  { id: 'diagnose', label: 'AI Diagnostics', icon: '🔍', desc: 'Describe symptoms to get a diagnosis', color: '#ef4444' },
  { id: 'maintenance', label: 'Maintenance Advisor', icon: '🛠️', desc: 'Get personalized maintenance plans', color: '#10b981' },
  { id: 'warning', label: 'Warning Explainer', icon: '⚠️', desc: 'Understand dashboard warning lights', color: '#f59e0b' },
  { id: 'parts', label: 'Parts Advisor', icon: '⚙️', desc: 'Get parts recommendations', color: '#0ea5e9' },
];

function AIAssistant({ showToast }) {
  const [activeFeature, setActiveFeature] = useState('chat');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  // Chat form
  const [chatMessage, setChatMessage] = useState('');

  // Diagnose form
  const [symptoms, setSymptoms] = useState('');
  const [diagVehicle, setDiagVehicle] = useState('');

  // Maintenance form
  const [maintVehicle, setMaintVehicle] = useState('');
  const [mileage, setMileage] = useState('');
  const [lastService, setLastService] = useState('');

  // Warning form
  const [warningLight, setWarningLight] = useState('');
  const [warnVehicle, setWarnVehicle] = useState('');

  // Parts form
  const [partsVehicle, setPartsVehicle] = useState('');
  const [partsNeed, setPartsNeed] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      let res;
      switch (activeFeature) {
        case 'chat':
          res = await axios.post(`${API}/ai/chat`, { message: chatMessage });
          break;
        case 'diagnose':
          res = await axios.post(`${API}/ai/diagnose`, { symptoms, vehicle: diagVehicle });
          break;
        case 'maintenance':
          res = await axios.post(`${API}/ai/maintenance-advice`, { vehicle: maintVehicle, mileage, last_service: lastService });
          break;
        case 'warning':
          res = await axios.post(`${API}/ai/explain-warning`, { warning_light: warningLight, vehicle: warnVehicle });
          break;
        case 'parts':
          res = await axios.post(`${API}/ai/recommend-parts`, { vehicle: partsVehicle, need: partsNeed });
          break;
        default:
          break;
      }
      setResponse(res.data);
    } catch (err) {
      showToast(err.response?.data?.error || 'AI request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (activeFeature) {
      case 'chat':
        return (
          <div className="form-group">
            <label>Your Question</label>
            <textarea
              className="form-control"
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              placeholder="Ask anything about your vehicle... e.g., 'How do I pair my phone via Bluetooth?' or 'What does the oil pressure light mean?'"
              rows={4}
              required
            />
          </div>
        );
      case 'diagnose':
        return (
          <>
            <div className="form-group">
              <label>Vehicle (Optional)</label>
              <input className="form-control" value={diagVehicle} onChange={e => setDiagVehicle(e.target.value)} placeholder="e.g., 2024 Toyota Camry" />
            </div>
            <div className="form-group">
              <label>Describe Your Symptoms</label>
              <textarea
                className="form-control"
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                placeholder="Describe what's happening... e.g., 'Car makes a grinding noise when braking and vibrates at highway speeds'"
                rows={4}
                required
              />
            </div>
          </>
        );
      case 'maintenance':
        return (
          <>
            <div className="two-col">
              <div className="form-group">
                <label>Vehicle</label>
                <input className="form-control" value={maintVehicle} onChange={e => setMaintVehicle(e.target.value)} placeholder="e.g., 2024 BMW X5" required />
              </div>
              <div className="form-group">
                <label>Current Mileage</label>
                <input className="form-control" value={mileage} onChange={e => setMileage(e.target.value)} placeholder="e.g., 35000" required />
              </div>
            </div>
            <div className="form-group">
              <label>Last Service Description</label>
              <input className="form-control" value={lastService} onChange={e => setLastService(e.target.value)} placeholder="e.g., Oil change at 30,000 miles, 3 months ago" />
            </div>
          </>
        );
      case 'warning':
        return (
          <>
            <div className="form-group">
              <label>Vehicle (Optional)</label>
              <input className="form-control" value={warnVehicle} onChange={e => setWarnVehicle(e.target.value)} placeholder="e.g., 2024 Ford F-150" />
            </div>
            <div className="form-group">
              <label>Warning Light Description</label>
              <textarea
                className="form-control"
                value={warningLight}
                onChange={e => setWarningLight(e.target.value)}
                placeholder="Describe the warning light... e.g., 'Orange engine-shaped light on the dashboard that stays solid'"
                rows={3}
                required
              />
            </div>
          </>
        );
      case 'parts':
        return (
          <>
            <div className="form-group">
              <label>Vehicle (Optional)</label>
              <input className="form-control" value={partsVehicle} onChange={e => setPartsVehicle(e.target.value)} placeholder="e.g., 2024 Honda CR-V" />
            </div>
            <div className="form-group">
              <label>What Do You Need?</label>
              <textarea
                className="form-control"
                value={partsNeed}
                onChange={e => setPartsNeed(e.target.value)}
                placeholder="Describe what you need... e.g., 'Front brake pads and rotors for daily driving'"
                rows={3}
                required
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>🤖 AI Assistant</h2>
          <p>AI-powered vehicle support using OpenRouter</p>
        </div>
      </div>

      {/* AI Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '32px' }}>
        {aiFeatures.map(f => (
          <div
            key={f.id}
            onClick={() => { setActiveFeature(f.id); setResponse(null); }}
            style={{
              background: activeFeature === f.id ? `${f.color}15` : 'var(--bg-card)',
              border: `1px solid ${activeFeature === f.id ? f.color : 'var(--border)'}`,
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{f.icon}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: activeFeature === f.id ? f.color : 'var(--text-primary)' }}>{f.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* AI Form */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {aiFeatures.find(f => f.id === activeFeature)?.icon} {aiFeatures.find(f => f.id === activeFeature)?.label}
        </h3>
        <form onSubmit={handleSubmit}>
          {renderForm()}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '200px', justifyContent: 'center' }}>
            {loading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', margin: 0 }}></div>
                Thinking...
              </>
            ) : (
              <>🤖 Get AI Response</>
            )}
          </button>
        </form>
      </div>

      {/* AI Response - Professional Display */}
      {response && (
        <div className="ai-response">
          <div className="ai-response-header">
            <span className="ai-badge">AI Response</span>
            <span className="model-info">
              Model: {response.model || 'claude-haiku'}
              {response.usage && ` | Tokens: ${response.usage.total_tokens || (response.usage.prompt_tokens + response.usage.completion_tokens)}`}
            </span>
          </div>
          <div className="ai-response-content">
            <ReactMarkdown>{response.response}</ReactMarkdown>
          </div>
          {response.usage && (
            <div className="ai-response-usage">
              <span>Prompt tokens: {response.usage.prompt_tokens}</span>
              <span>Completion tokens: {response.usage.completion_tokens}</span>
              {response.usage.total_tokens && <span>Total tokens: {response.usage.total_tokens}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIAssistant;
