import React from 'react';
import CrudPage from '../components/CrudPage';

function ServiceCenters({ showToast }) {
  return (
    <CrudPage
      title="Service Centers"
      subtitle="Find authorized service and repair centers"
      endpoint="services"
      icon="📍"
      cardMode={true}
      showToast={showToast}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'city', label: 'City' },
        { key: 'rating', label: 'Rating', badge: true, badgeType: 'success' },
      ]}
      formFields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'address', label: 'Address', required: true },
        { name: 'city', label: 'City', required: true },
        { name: 'state', label: 'State', required: true },
        { name: 'zip', label: 'ZIP Code' },
        { name: 'phone', label: 'Phone' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'rating', label: 'Rating (0-5)', type: 'number' },
        { name: 'services_offered', label: 'Services Offered', type: 'textarea' },
        { name: 'hours', label: 'Hours', type: 'textarea' },
      ]}
      renderDetail={(item) => (
        <>
          <div className="two-col">
            <div className="detail-field">
              <label>Rating</label>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>
                {'★'.repeat(Math.floor(item.rating))}{'☆'.repeat(5 - Math.floor(item.rating))} {item.rating}
              </p>
            </div>
            <div className="detail-field">
              <label>Phone</label>
              <p style={{ fontSize: '16px', fontWeight: 600 }}>{item.phone || '—'}</p>
            </div>
          </div>
          <div className="two-col">
            <div className="detail-field">
              <label>Address</label>
              <p>{item.address}, {item.city}, {item.state} {item.zip}</p>
            </div>
            <div className="detail-field">
              <label>Email</label>
              <p>{item.email || '—'}</p>
            </div>
          </div>
          <div className="detail-field">
            <label>Hours</label>
            <p>{item.hours || '—'}</p>
          </div>
          <div className="detail-field">
            <label>Services Offered</label>
            <p>{item.services_offered || '—'}</p>
          </div>
        </>
      )}
    />
  );
}

export default ServiceCenters;
