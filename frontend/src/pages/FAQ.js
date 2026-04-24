import React from 'react';
import CrudPage from '../components/CrudPage';

function FAQ({ showToast }) {
  return (
    <CrudPage
      title="FAQ"
      subtitle="Frequently asked questions and answers"
      endpoint="faq"
      icon="❓"
      cardMode={true}
      showToast={showToast}
      columns={[
        { key: 'question', label: 'Question' },
        { key: 'answer', label: 'Answer' },
        { key: 'category', label: 'Category', badge: true, badgeType: 'primary' },
      ]}
      formFields={[
        { name: 'question', label: 'Question', type: 'textarea', required: true },
        { name: 'answer', label: 'Answer', type: 'textarea', required: true },
        { name: 'category', label: 'Category', type: 'select', options: ['Maintenance', 'Diagnostics', 'Technology', 'Tires', 'Safety', 'Fuel', 'Electric', 'Emergency', 'General', 'Parking', 'Towing', 'Features'], required: true },
      ]}
      renderDetail={(item) => (
        <>
          <div className="detail-field">
            <label>Category</label>
            <p><span className="badge badge-primary">{item.category}</span></p>
          </div>
          <div className="detail-field" style={{ background: 'rgba(14,165,233,0.05)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(14,165,233,0.2)' }}>
            <label style={{ color: '#0ea5e9', fontSize: '13px' }}>Question</label>
            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.question}</p>
          </div>
          <div className="detail-field" style={{ marginTop: '12px' }}>
            <label>Answer</label>
            <p>{item.answer}</p>
          </div>
          <div style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>
            {item.helpful_count} people found this helpful
          </div>
        </>
      )}
    />
  );
}

export default FAQ;
