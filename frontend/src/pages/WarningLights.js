import React from 'react';
import CrudPage from '../components/CrudPage';

const severityColor = (v) => {
  if (v === 'Critical') return 'danger';
  if (v === 'High') return 'warning';
  if (v === 'Medium') return 'primary';
  return 'success';
};

const colorBadge = (v) => {
  if (v === 'red') return 'danger';
  if (v === 'amber') return 'warning';
  return 'info';
};

function WarningLights({ showToast }) {
  return (
    <CrudPage
      title="Warning Lights"
      subtitle="Dashboard warning light meanings and required actions"
      endpoint="warnings"
      icon="⚠️"
      showToast={showToast}
      columns={[
        { key: 'name', label: 'Warning' },
        { key: 'color', label: 'Color', badge: true, badgeColor: colorBadge },
        { key: 'severity', label: 'Severity', badge: true, badgeColor: severityColor },
        { key: 'category', label: 'Category' },
      ]}
      formFields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'icon', label: 'Icon Identifier' },
        { name: 'color', label: 'Light Color', type: 'select', options: ['red', 'amber', 'green', 'blue'], required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
        { name: 'severity', label: 'Severity', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], required: true },
        { name: 'action_required', label: 'Action Required', type: 'textarea', required: true },
        { name: 'category', label: 'Category', type: 'select', options: ['Engine', 'Brakes', 'Electrical', 'Safety', 'Tires', 'Transmission', 'Steering', 'Drivetrain', 'Body', 'Fuel System', 'Emissions'], required: true },
      ]}
      renderDetail={(item) => (
        <>
          <div className="two-col">
            <div className="detail-field">
              <label>Color</label>
              <p><span className={`badge badge-${colorBadge(item.color)}`}>{item.color}</span></p>
            </div>
            <div className="detail-field">
              <label>Severity</label>
              <p><span className={`badge badge-${severityColor(item.severity)}`}>{item.severity}</span></p>
            </div>
            <div className="detail-field">
              <label>Category</label>
              <p>{item.category}</p>
            </div>
          </div>
          <div className="detail-field">
            <label>Description</label>
            <p>{item.description}</p>
          </div>
          <div className="detail-field" style={{
            background: item.severity === 'Critical' ? 'rgba(239,68,68,0.05)' : 'rgba(245,158,11,0.05)',
            padding: '16px', borderRadius: '8px',
            border: `1px solid ${item.severity === 'Critical' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.2)'}`
          }}>
            <label style={{ color: item.severity === 'Critical' ? '#ef4444' : '#f59e0b' }}>Action Required</label>
            <p>{item.action_required}</p>
          </div>
        </>
      )}
    />
  );
}

export default WarningLights;
