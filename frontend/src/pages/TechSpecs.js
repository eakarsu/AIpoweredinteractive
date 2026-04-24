import React from 'react';
import CrudPage from '../components/CrudPage';

function TechSpecs({ showToast }) {
  return (
    <CrudPage
      title="Technical Specifications"
      subtitle="Detailed technical specifications for all vehicle models"
      endpoint="specs"
      icon="📐"
      showToast={showToast}
      columns={[
        { key: 'spec_name', label: 'Specification' },
        { key: 'spec_value', label: 'Value', render: (item) => `${item.spec_value} ${item.unit || ''}` },
        { key: 'category', label: 'Category', badge: true, badgeColor: () => 'primary' },
        { key: 'make', label: 'Vehicle', render: (item) => item.make ? `${item.year} ${item.make} ${item.model}` : '—' },
      ]}
      formFields={[
        { name: 'vehicle_id', label: 'Vehicle ID', type: 'number', required: true },
        { name: 'category', label: 'Category', type: 'select', options: ['Performance', 'Battery', 'Dimensions', 'Fuel Economy', 'Capability', 'Engine', 'Transmission', 'Suspension', 'Brakes'], required: true },
        { name: 'spec_name', label: 'Specification Name', required: true },
        { name: 'spec_value', label: 'Value', required: true },
        { name: 'unit', label: 'Unit' },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ]}
      renderDetail={(item) => (
        <>
          <div className="two-col">
            <div className="detail-field">
              <label>Vehicle</label>
              <p>{item.make ? `${item.year} ${item.make} ${item.model}` : '—'}</p>
            </div>
            <div className="detail-field">
              <label>Category</label>
              <p><span className="badge badge-primary">{item.category}</span></p>
            </div>
          </div>
          <div className="detail-field" style={{ background: 'rgba(99,102,241,0.05)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.2)', textAlign: 'center' }}>
            <label>{item.spec_name}</label>
            <p style={{ fontSize: '36px', fontWeight: 800, color: '#6366f1', marginTop: '8px' }}>
              {item.spec_value} <span style={{ fontSize: '16px', fontWeight: 400, color: 'var(--text-muted)' }}>{item.unit}</span>
            </p>
          </div>
          <div className="detail-field" style={{ marginTop: '12px' }}>
            <label>Notes</label>
            <p>{item.notes || '—'}</p>
          </div>
        </>
      )}
    />
  );
}

export default TechSpecs;
