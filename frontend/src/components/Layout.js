import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { section: 'Overview', items: [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/ai', label: 'AI Assistant', icon: '🤖' },
  ]},
  { section: 'Vehicle Info', items: [
    { path: '/vehicles', label: 'Vehicle Models', icon: '🚗' },
    { path: '/manuals', label: 'Owner Manuals', icon: '📖' },
    { path: '/specs', label: 'Tech Specs', icon: '📐' },
  ]},
  { section: 'Support', items: [
    { path: '/troubleshooting', label: 'Troubleshooting', icon: '🔧' },
    { path: '/maintenance', label: 'Maintenance', icon: '🛠️' },
    { path: '/warnings', label: 'Warning Lights', icon: '⚠️' },
    { path: '/safety', label: 'Safety Features', icon: '🛡️' },
  ]},
  { section: 'Resources', items: [
    { path: '/faq', label: 'FAQ', icon: '❓' },
    { path: '/tutorials', label: 'Tutorials', icon: '🎓' },
    { path: '/recalls', label: 'Recall Notices', icon: '📢' },
    { path: '/parts', label: 'Parts Catalog', icon: '⚙️' },
    { path: '/services', label: 'Service Centers', icon: '📍' },
    { path: '/warranty', label: 'Warranty Info', icon: '📋' },
    { path: '/feedback', label: 'Feedback', icon: '💬' },
  ]},
];

function Layout({ children, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">AM</div>
          <div>
            <h1>AutoManual</h1>
            <span>AI-Powered</span>
          </div>
        </div>

        {navItems.map((section) => (
          <div className="nav-section" key={section.section}>
            <div className="nav-section-title">{section.section}</div>
            {section.items.map((item) => (
              <div
                key={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        ))}

        <div className="sidebar-user">
          <div className="user-avatar">
            {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <div className="user-name">{user.full_name}</div>
            <div className="user-email">{user.email}</div>
          </div>
          <button className="logout-btn" onClick={onLogout} title="Logout">
            ⏻
          </button>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
