import React from 'react';
import CrudPage from '../components/CrudPage';

function Warranty({ showToast }) {
  return (
    <CrudPage
      title="Warranty Information"
      subtitle="Warranty coverage details, terms, and claims info"
      endpoint="warranty"
      icon="📋"
      showToast={showToast}
      columns={[
        { key: 'name', label: 'Warranty' },
        { key: 'coverage_type', label: 'Coverage', badge: true, badgeColor: () => 'primary' },
        { key: 'duration_years', label: 'Years', render: (item) => item.duration_years ? `${item.duration_years} yr` : '—' },
        { key: 'duration_miles', label: 'Miles', render: (item) => item.duration_miles ? `${item.duration_miles.toLocaleString()} mi` : '—' },
      ]}
      formFields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'coverage_type', label: 'Coverage Type', required: true },
        { name: 'duration_years', label: 'Duration (Years)', type: 'number' },
        { name: 'duration_miles', label: 'Duration (Miles)', type: 'number' },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
        { name: 'exclusions', label: 'Exclusions', type: 'textarea' },
        { name: 'deductible', label: 'Deductible', type: 'number' },
      ]}
      renderDetail={(item) => (
        <>
          <div className="two-col">
            <div className="detail-field">
              <label>Coverage Type</label>
              <p><span className="badge badge-primary">{item.coverage_type}</span></p>
            </div>
            <div className="detail-field">
              <label>Deductible</label>
              <p style={{ fontSize: '20px', fontWeight: 700, color: item.deductible > 0 ? '#f59e0b' : '#10b981' }}>
                {item.deductible > 0 ? `$${Number(item.deductible).toFixed(2)}` : 'None ($0)'}
              </p>
            </div>
            <div className="detail-field">
              <label>Duration</label>
              <p style={{ fontSize: '16px', fontWeight: 600 }}>
                {item.duration_years ? `${item.duration_years} years` : ''} {item.duration_years && item.duration_miles ? '/' : ''} {item.duration_miles ? `${item.duration_miles.toLocaleString()} miles` : ''}
              </p>
            </div>
          </div>
          <div className="detail-field">
            <label>Description</label>
            <p>{item.description}</p>
          </div>
          <div className="detail-field" style={{ background: 'rgba(239,68,68,0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
            <label style={{ color: '#ef4444' }}>Exclusions</label>
            <p>{item.exclusions || 'None specified'}</p>
          </div>
        </>
      )}
    />
  );
}

export default Warranty;
