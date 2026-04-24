import React from 'react';
import CrudPage from '../components/CrudPage';

function Parts({ showToast }) {
  return (
    <CrudPage
      title="Parts Catalog"
      subtitle="OEM and aftermarket parts for your vehicle"
      endpoint="parts"
      icon="⚙️"
      showToast={showToast}
      columns={[
        { key: 'part_number', label: 'Part #' },
        { key: 'name', label: 'Name' },
        { key: 'category', label: 'Category', badge: true, badgeColor: () => 'primary' },
        { key: 'price', label: 'Price', render: (item) => `$${Number(item.price).toFixed(2)}` },
        { key: 'in_stock', label: 'Stock', badge: true, badgeColor: (v) => v ? 'success' : 'danger', render: (item) => item.in_stock ? 'In Stock' : 'Out of Stock' },
      ]}
      formFields={[
        { name: 'part_number', label: 'Part Number', required: true },
        { name: 'name', label: 'Name', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'category', label: 'Category', type: 'select', options: ['Brakes', 'Filters', 'Wipers', 'Ignition', 'Electrical', 'Fluids', 'Suspension', 'Lighting', 'Tires', 'Accessories', 'Exterior'], required: true },
        { name: 'price', label: 'Price', type: 'number' },
        { name: 'compatibility', label: 'Compatibility', type: 'textarea' },
        { name: 'in_stock', label: 'In Stock', type: 'select', options: ['true', 'false'] },
      ]}
      renderDetail={(item) => (
        <>
          <div className="two-col">
            <div className="detail-field">
              <label>Part Number</label>
              <p style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 600, color: '#6366f1' }}>{item.part_number}</p>
            </div>
            <div className="detail-field">
              <label>Price</label>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>${Number(item.price).toFixed(2)}</p>
            </div>
            <div className="detail-field">
              <label>Category</label>
              <p><span className="badge badge-primary">{item.category}</span></p>
            </div>
            <div className="detail-field">
              <label>Availability</label>
              <p><span className={`badge badge-${item.in_stock ? 'success' : 'danger'}`}>{item.in_stock ? 'In Stock' : 'Out of Stock'}</span></p>
            </div>
          </div>
          <div className="detail-field">
            <label>Description</label>
            <p>{item.description || '—'}</p>
          </div>
          <div className="detail-field">
            <label>Compatibility</label>
            <p>{item.compatibility || '—'}</p>
          </div>
        </>
      )}
    />
  );
}

export default Parts;
