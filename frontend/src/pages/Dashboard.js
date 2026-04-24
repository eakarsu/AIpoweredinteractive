import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3001/api';

const features = [
  { path: '/vehicles', label: 'Vehicle Models', icon: '🚗', desc: 'Browse all supported vehicle models and configurations', color: '#6366f1', endpoint: 'vehicles' },
  { path: '/manuals', label: 'Owner Manuals', icon: '📖', desc: 'Digital owner manuals with searchable content', color: '#0ea5e9', endpoint: 'manuals' },
  { path: '/troubleshooting', label: 'Troubleshooting', icon: '🔧', desc: 'Diagnose and fix common vehicle issues', color: '#f59e0b', endpoint: 'troubleshooting' },
  { path: '/maintenance', label: 'Maintenance', icon: '🛠️', desc: 'Scheduled maintenance tasks and intervals', color: '#10b981', endpoint: 'maintenance' },
  { path: '/safety', label: 'Safety Features', icon: '🛡️', desc: 'Learn about your vehicles safety systems', color: '#8b5cf6', endpoint: 'safety' },
  { path: '/warnings', label: 'Warning Lights', icon: '⚠️', desc: 'Dashboard warning light meanings and actions', color: '#ef4444', endpoint: 'warnings' },
  { path: '/faq', label: 'FAQ', icon: '❓', desc: 'Frequently asked questions and answers', color: '#06b6d4', endpoint: 'faq' },
  { path: '/recalls', label: 'Recall Notices', icon: '📢', desc: 'Active recalls and safety bulletins', color: '#f97316', endpoint: 'recalls' },
  { path: '/parts', label: 'Parts Catalog', icon: '⚙️', desc: 'OEM and aftermarket parts catalog', color: '#64748b', endpoint: 'parts' },
  { path: '/services', label: 'Service Centers', icon: '📍', desc: 'Find authorized service centers near you', color: '#14b8a6', endpoint: 'services' },
  { path: '/tutorials', label: 'Tutorials', icon: '🎓', desc: 'Step-by-step DIY guides and how-tos', color: '#a855f7', endpoint: 'tutorials' },
  { path: '/warranty', label: 'Warranty Info', icon: '📋', desc: 'Warranty coverage details and claims', color: '#22c55e', endpoint: 'warranty' },
  { path: '/specs', label: 'Tech Specs', icon: '📐', desc: 'Technical specifications for all models', color: '#3b82f6', endpoint: 'specs' },
  { path: '/feedback', label: 'Feedback', icon: '💬', desc: 'Submit feedback and support tickets', color: '#ec4899', endpoint: 'feedback' },
  { path: '/ai', label: 'AI Assistant', icon: '🤖', desc: 'AI-powered vehicle support and diagnostics', color: '#6366f1', endpoint: null },
];

function Dashboard({ showToast }) {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const fetchCounts = async () => {
      const endpoints = features.filter(f => f.endpoint).map(f => f.endpoint);
      const promises = endpoints.map(ep => axios.get(`${API}/${ep}`).then(r => ({ [ep]: r.data.length })).catch(() => ({ [ep]: 0 })));
      const results = await Promise.all(promises);
      const merged = results.reduce((acc, r) => ({ ...acc, ...r }), {});
      setCounts(merged);
    };
    fetchCounts();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Welcome to your AI-Powered Interactive Owner's Manual</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Vehicles</div>
          <div className="stat-value">{counts.vehicles || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Manual Entries</div>
          <div className="stat-value">{counts.manuals || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Recalls</div>
          <div className="stat-value">{counts.recalls || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Service Centers</div>
          <div className="stat-value">{counts.services || 0}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {features.map(f => (
          <div className="dashboard-card" key={f.path} onClick={() => navigate(f.path)}>
            <div className="card-icon-wrapper" style={{ background: `${f.color}20`, color: f.color }}>
              {f.icon}
            </div>
            <div className="card-content">
              <h3>{f.label}</h3>
              <p>{f.desc}</p>
            </div>
            {f.endpoint && counts[f.endpoint] !== undefined && (
              <div className="card-count">{counts[f.endpoint]}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
