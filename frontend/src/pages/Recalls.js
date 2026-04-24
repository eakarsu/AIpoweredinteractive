import React from 'react';
import CrudPage from '../components/CrudPage';

const severityColor = (v) => {
  if (v === 'Critical') return 'danger';
  if (v === 'High') return 'warning';
  return 'primary';
};

const statusColor = (v) => {
  if (v === 'Active') return 'danger';
  if (v === 'Remedy Available') return 'success';
  return 'primary';
};

function Recalls({ showToast }) {
  return (
    <CrudPage
      title="Recall Notices"
      subtitle="Active recalls, safety bulletins, and remedy information"
      endpoint="recalls"
      icon="📢"
      showToast={showToast}
      columns={[
        { key: 'recall_number', label: 'Recall #' },
        { key: 'title', label: 'Title' },
        { key: 'severity', label: 'Severity', badge: true, badgeColor: severityColor },
        { key: 'status', label: 'Status', badge: true, badgeColor: statusColor },
      ]}
      formFields={[
        { name: 'recall_number', label: 'Recall Number', required: true },
        { name: 'title', label: 'Title', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
        { name: 'affected_vehicles', label: 'Affected Vehicles', type: 'textarea' },
        { name: 'severity', label: 'Severity', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], required: true },
        { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Remedy Available', 'Completed'], required: true },
        { name: 'remedy', label: 'Remedy', type: 'textarea' },
        { name: 'date_issued', label: 'Date Issued', type: 'date' },
      ]}
      renderDetail={(item) => (
        <>
          <div className="two-col">
            <div className="detail-field">
              <label>Recall Number</label>
              <p style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 600 }}>{item.recall_number}</p>
            </div>
            <div className="detail-field">
              <label>Date Issued</label>
              <p>{item.date_issued ? new Date(item.date_issued).toLocaleDateString() : '—'}</p>
            </div>
            <div className="detail-field">
              <label>Severity</label>
              <p><span className={`badge badge-${severityColor(item.severity)}`}>{item.severity}</span></p>
            </div>
            <div className="detail-field">
              <label>Status</label>
              <p><span className={`badge badge-${statusColor(item.status)}`}>{item.status}</span></p>
            </div>
          </div>
          <div className="detail-field">
            <label>Description</label>
            <p>{item.description}</p>
          </div>
          <div className="detail-field">
            <label>Affected Vehicles</label>
            <p>{item.affected_vehicles || '—'}</p>
          </div>
          <div className="detail-field" style={{ background: 'rgba(16,185,129,0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
            <label style={{ color: '#10b981' }}>Remedy</label>
            <p>{item.remedy || 'Remedy details pending'}</p>
          </div>
        </>
      )}
    />
  );
}

export default Recalls;
