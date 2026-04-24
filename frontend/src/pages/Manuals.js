import React from 'react';
import CrudPage from '../components/CrudPage';

function Manuals({ showToast }) {
  return (
    <CrudPage
      title="Owner Manuals"
      subtitle="Digital owner's manual entries with searchable content"
      endpoint="manuals"
      icon="📖"
      cardMode={true}
      showToast={showToast}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'content', label: 'Content' },
        { key: 'category', label: 'Category', badge: true, badgeType: 'primary' },
        { key: 'chapter', label: 'Chapter', badge: true, badgeType: 'info' },
      ]}
      formFields={[
        { name: 'vehicle_id', label: 'Vehicle ID', type: 'number' },
        { name: 'title', label: 'Title', required: true },
        { name: 'category', label: 'Category', type: 'select', options: ['Quick Start', 'Technology', 'Drivetrain', 'Comfort', 'Powertrain', 'Safety', 'Capability', 'Performance', 'Electric'], required: true },
        { name: 'content', label: 'Content', type: 'textarea', required: true },
        { name: 'page_number', label: 'Page Number', type: 'number' },
        { name: 'chapter', label: 'Chapter' },
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
            <div className="detail-field">
              <label>Chapter</label>
              <p>{item.chapter || '—'}</p>
            </div>
            <div className="detail-field">
              <label>Page Number</label>
              <p>{item.page_number || '—'}</p>
            </div>
          </div>
          <div className="detail-field">
            <label>Content</label>
            <p>{item.content}</p>
          </div>
        </>
      )}
    />
  );
}

export default Manuals;
