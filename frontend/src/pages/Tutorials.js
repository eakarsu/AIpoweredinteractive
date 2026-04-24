import React from 'react';
import CrudPage from '../components/CrudPage';

const difficultyColor = (v) => v === 'Beginner' ? 'success' : v === 'Intermediate' ? 'warning' : 'danger';

function Tutorials({ showToast }) {
  return (
    <CrudPage
      title="Tutorials"
      subtitle="Step-by-step DIY guides and how-to instructions"
      endpoint="tutorials"
      icon="🎓"
      cardMode={true}
      showToast={showToast}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'description', label: 'Description' },
        { key: 'difficulty', label: 'Difficulty', badge: true, badgeType: 'success' },
        { key: 'duration', label: 'Duration', badge: true, badgeType: 'info' },
      ]}
      formFields={[
        { name: 'title', label: 'Title', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
        { name: 'category', label: 'Category', type: 'select', options: ['Maintenance', 'Emergency', 'Technology', 'Safety', 'Features', 'Driving', 'Towing'], required: true },
        { name: 'difficulty', label: 'Difficulty', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'], required: true },
        { name: 'duration', label: 'Duration' },
        { name: 'steps', label: 'Steps', type: 'textarea', required: true },
        { name: 'tools_needed', label: 'Tools Needed', type: 'textarea' },
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
            <div className="detail-field">
              <label>Duration</label>
              <p>{item.duration || '—'}</p>
            </div>
          </div>
          <div className="detail-field">
            <label>Description</label>
            <p>{item.description}</p>
          </div>
          <div className="detail-field" style={{ background: 'rgba(99,102,241,0.05)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.2)' }}>
            <label style={{ color: '#818cf8' }}>Steps</label>
            <div style={{ marginTop: '8px' }}>
              {(item.steps || '').split('\n').map((step, i) => (
                <p key={i} style={{ padding: '6px 0', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>{step}</p>
              ))}
            </div>
          </div>
          <div className="detail-field" style={{ marginTop: '12px' }}>
            <label>Tools Needed</label>
            <p>{item.tools_needed || 'None'}</p>
          </div>
        </>
      )}
    />
  );
}

export default Tutorials;
