import React from 'react';
import CrudPage from '../components/CrudPage';

const statusColor = (v) => {
  if (v === 'open') return 'warning';
  if (v === 'in_progress') return 'info';
  if (v === 'resolved') return 'success';
  return 'primary';
};

const priorityColor = (v) => {
  if (v === 'high') return 'danger';
  if (v === 'medium') return 'warning';
  return 'success';
};

function Feedback({ showToast }) {
  return (
    <CrudPage
      title="Feedback & Support"
      subtitle="Submit feedback, report issues, and track support tickets"
      endpoint="feedback"
      icon="💬"
      showToast={showToast}
      columns={[
        { key: 'subject', label: 'Subject' },
        { key: 'category', label: 'Category', badge: true, badgeColor: () => 'primary' },
        { key: 'status', label: 'Status', badge: true, badgeColor: statusColor },
        { key: 'priority', label: 'Priority', badge: true, badgeColor: priorityColor },
      ]}
      formFields={[
        { name: 'subject', label: 'Subject', required: true },
        { name: 'message', label: 'Message', type: 'textarea', required: true },
        { name: 'category', label: 'Category', type: 'select', options: ['Technology', 'Maintenance', 'Brakes', 'Climate', 'Electrical', 'Safety Systems', 'Interior', 'Exterior', 'Tires', 'Documentation', 'Feature Request', 'General'], required: true },
        { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high'], required: true },
        { name: 'status', label: 'Status', type: 'select', options: ['open', 'in_progress', 'resolved'] },
        { name: 'response', label: 'Response', type: 'textarea' },
      ]}
      renderDetail={(item) => (
        <>
          <div className="two-col">
            <div className="detail-field">
              <label>Category</label>
              <p><span className="badge badge-primary">{item.category}</span></p>
            </div>
            <div className="detail-field">
              <label>Status</label>
              <p><span className={`badge badge-${statusColor(item.status)}`}>{item.status}</span></p>
            </div>
            <div className="detail-field">
              <label>Priority</label>
              <p><span className={`badge badge-${priorityColor(item.priority)}`}>{item.priority}</span></p>
            </div>
            <div className="detail-field">
              <label>Submitted By</label>
              <p>{item.user_name || '—'}</p>
            </div>
          </div>
          <div className="detail-field">
            <label>Message</label>
            <p>{item.message}</p>
          </div>
          {item.response && (
            <div className="detail-field" style={{ background: 'rgba(16,185,129,0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)', marginTop: '12px' }}>
              <label style={{ color: '#10b981' }}>Response</label>
              <p>{item.response}</p>
            </div>
          )}
        </>
      )}
    />
  );
}

export default Feedback;
