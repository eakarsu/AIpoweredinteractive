import React from 'react';
import CrudPage from '../components/CrudPage';

function SafetyFeatures({ showToast }) {
  return (
    <CrudPage
      title="Safety Features"
      subtitle="Learn about your vehicle's safety systems"
      endpoint="safety"
      icon="🛡️"
      cardMode={true}
      showToast={showToast}
      columns={[
        { key: 'name', label: 'Feature' },
        { key: 'description', label: 'Description' },
        { key: 'category', label: 'Category', badge: true, badgeType: 'success' },
      ]}
      formFields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
        { name: 'how_it_works', label: 'How It Works', type: 'textarea' },
        { name: 'activation_conditions', label: 'Activation Conditions', type: 'textarea' },
        { name: 'category', label: 'Category', type: 'select', options: ['Active Safety', 'Passive Safety', 'Driver Assistance', 'Parking Assist'], required: true },
      ]}
      renderDetail={(item) => (
        <>
          <div className="detail-field">
            <label>Category</label>
            <p><span className="badge badge-success">{item.category}</span></p>
          </div>
          <div className="detail-field">
            <label>Description</label>
            <p>{item.description}</p>
          </div>
          <div className="detail-field" style={{ background: 'rgba(99,102,241,0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.2)' }}>
            <label style={{ color: '#818cf8' }}>How It Works</label>
            <p>{item.how_it_works || '—'}</p>
          </div>
          <div className="detail-field" style={{ background: 'rgba(245,158,11,0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)', marginTop: '12px' }}>
            <label style={{ color: '#f59e0b' }}>Activation Conditions</label>
            <p>{item.activation_conditions || '—'}</p>
          </div>
        </>
      )}
    />
  );
}

export default SafetyFeatures;
