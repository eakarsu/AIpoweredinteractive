import React from 'react';
import CrudPage from '../components/CrudPage';

const difficultyColor = (v) => v === 'Easy' ? 'success' : v === 'Medium' ? 'warning' : 'danger';

function Troubleshooting({ showToast }) {
  return (
    <CrudPage
      title="Troubleshooting"
      subtitle="Diagnose and resolve common vehicle issues"
      endpoint="troubleshooting"
      icon="🔧"
      showToast={showToast}
      columns={[
        { key: 'title', label: 'Issue' },
        { key: 'category', label: 'Category', badge: true, badgeColor: () => 'primary' },
        { key: 'difficulty', label: 'Difficulty', badge: true, badgeColor: difficultyColor },
      ]}
      formFields={[
        { name: 'title', label: 'Title', required: true },
        { name: 'symptom', label: 'Symptom', type: 'textarea', required: true },
        { name: 'cause', label: 'Cause', type: 'textarea', required: true },
        { name: 'solution', label: 'Solution', type: 'textarea', required: true },
        { name: 'difficulty', label: 'Difficulty', type: 'select', options: ['Easy', 'Medium', 'Hard'], required: true },
        { name: 'category', label: 'Category', type: 'select', options: ['Engine', 'Brakes', 'Electrical', 'Climate', 'Transmission', 'Steering', 'Suspension', 'Fuel System', 'Exterior', 'Technology'], required: true },
      ]}
      renderDetail={(item) => (
        <>
          <div className="two-col">
            <div className="detail-field">
              <label>Category</label>
              <p><span className="badge badge-primary">{item.category}</span></p>
            </div>
            <div className="detail-field">
              <label>Difficulty</label>
              <p><span className={`badge badge-${difficultyColor(item.difficulty)}`}>{item.difficulty}</span></p>
            </div>
          </div>
          <div className="detail-field">
            <label>Symptom</label>
            <p>{item.symptom}</p>
          </div>
          <div className="detail-field">
            <label>Cause</label>
            <p>{item.cause}</p>
          </div>
          <div className="detail-field" style={{ background: 'rgba(16,185,129,0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
            <label style={{ color: '#10b981' }}>Solution</label>
            <p>{item.solution}</p>
          </div>
        </>
      )}
    />
  );
}

export default Troubleshooting;
