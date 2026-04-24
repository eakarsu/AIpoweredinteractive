import React from 'react';
import CrudPage from '../components/CrudPage';

function Vehicles({ showToast }) {
  return (
    <CrudPage
      title="Vehicle Models"
      subtitle="Browse and manage supported vehicle models"
      endpoint="vehicles"
      icon="🚗"
      cardMode={true}
      showToast={showToast}
      columns={[
        { key: 'make', label: 'Make', render: (item) => `${item.year} ${item.make} ${item.model} ${item.trim_level || ''}` },
        { key: 'description', label: 'Description' },
        { key: 'year', label: 'Year', badge: true, badgeType: 'info' },
        { key: 'engine_type', label: 'Engine', badge: true, badgeType: 'success' },
      ]}
      formFields={[
        { name: 'make', label: 'Make', required: true },
        { name: 'model', label: 'Model', required: true },
        { name: 'year', label: 'Year', type: 'number', required: true },
        { name: 'trim_level', label: 'Trim Level' },
        { name: 'engine_type', label: 'Engine Type' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]}
      renderDetail={(item) => (
        <>
          <div className="two-col">
            <div className="detail-field">
              <label>Make</label>
              <p>{item.make}</p>
            </div>
            <div className="detail-field">
              <label>Model</label>
              <p>{item.model}</p>
            </div>
            <div className="detail-field">
              <label>Year</label>
              <p>{item.year}</p>
            </div>
            <div className="detail-field">
              <label>Trim Level</label>
              <p>{item.trim_level || '—'}</p>
            </div>
            <div className="detail-field">
              <label>Engine Type</label>
              <p>{item.engine_type || '—'}</p>
            </div>
          </div>
          <div className="detail-field">
            <label>Description</label>
            <p>{item.description || '—'}</p>
          </div>
        </>
      )}
    />
  );
}

export default Vehicles;
