import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { section: 'Overview', items: [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/ai', label: 'AI Assistant', icon: '🤖' },
    { path: '/ai-maintenance-predict', label: 'Maintenance Predict', icon: '🛠️' },
    { path: '/ai-recall-impact', label: 'Recall Impact', icon: '📢' },
    { path: '/custom-views', label: 'Interactive Views', icon: '🎯' },
  // === Batch 06 Gaps & Frontend Mounts ===
  { path: '/cf-agentic-vehicle-health-monitoring', label: 'Agentic vehicle health monitoring', icon: '✨' },
  { path: '/cf-computer-vision-damage-assessment', label: 'Computer vision damage assessment', icon: '✨' },
  { path: '/cf-recall-proactive-management', label: 'Recall proactive management', icon: '✨' },
  { path: '/cf-smart-maintenance-scheduling', label: 'Smart maintenance scheduling', icon: '✨' },
  { path: '/cf-parts-compatibility-optimization', label: 'Parts compatibility optimization', icon: '✨' },
  { path: '/gap-maintenance-without-maintenance', label: 'Maintenance without `/maintenance', icon: '✨' },
  { path: '/gap-recalls-without-recall', label: 'Recalls without `/recall', icon: '✨' },
  { path: '/gap-services-without-service', label: 'Services without `/service', icon: '✨' },
  { path: '/gap-no-real-vehicle-api-integration-bmw-connecteddrive', label: 'No real vehicle API integration (BMW ConnectedDrive, Tesla API, OBD2)', icon: '✨' },
  { path: '/gap-no-parts-ordering-integration-with-retailers', label: 'No parts ordering (integration with retailers)', icon: '✨' },
  { path: '/gap-no-integration-with-mechanics-service-shops', label: 'No integration with mechanics/service shops', icon: '✨' },
  { path: '/gap-no-appointment-booking-scheduling-module', label: 'No appointment booking/scheduling module', icon: '✨' },
  { path: '/gap-no-notifications-module-grep-0', label: 'No notifications module (grep 0)', icon: '✨' },
  { path: '/gap-no-audit-logging-grep-0', label: 'No audit logging (grep 0)', icon: '✨' },
  { path: '/gap-no-webhooks-for-recall-safety-alerts', label: 'No webhooks for recall/safety alerts', icon: '✨' },
  { path: '/gap-no-mobile-app-despite-consumer', label: 'No mobile app despite consumer', icon: '✨' }
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
