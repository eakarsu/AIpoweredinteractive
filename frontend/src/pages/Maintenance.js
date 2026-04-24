import React from 'react';
import CrudPage from '../components/CrudPage';

const difficultyColor = (v) => v === 'Easy' ? 'success' : v === 'Medium' ? 'warning' : 'danger';

function Maintenance({ showToast }) {
  return (
    <CrudPage
      title="Maintenance"
      subtitle="Scheduled maintenance tasks and service intervals"
      endpoint="maintenance"
      icon="🛠️"
      showToast={showToast}
      columns={[
        { key: 'task_name', label: 'Task' },
        { key: 'category', label: 'Category', badge: true, badgeColor: () => 'primary' },
        { key: 'estimated_cost', label: 'Est. Cost' },
        { key: 'difficulty', label: 'Difficulty', badge: true, badgeColor: difficultyColor },
      ]}
      formFields={[
        { name: 'task_name', label: 'Task Name', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
        { name: 'interval_miles', label: 'Interval (Miles)', type: 'number' },
        { name: 'interval_months', label: 'Interval (Months)', type: 'number' },
        { name: 'estimated_cost', label: 'Estimated Cost' },
        { name: 'difficulty', label: 'Difficulty', type: 'select', options: ['Easy', 'Medium', 'Hard'], required: true },
        { name: 'category', label: 'Category', type: 'select', options: ['Engine', 'Brakes', 'Tires', 'Electrical', 'Climate', 'Transmission', 'Steering', 'General', 'Drivetrain', 'Exterior'], required: true },
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
              <label>Interval (Miles)</label>
              <p>{item.interval_miles ? `Every ${item.interval_miles.toLocaleString()} miles` : '—'}</p>
            </div>
            <div className="detail-field">
              <label>Interval (Months)</label>
              <p>{item.interval_months ? `Every ${item.interval_months} months` : '—'}</p>
            </div>
            <div className="detail-field">
              <label>Estimated Cost</label>
              <p style={{ color: '#f59e0b', fontWeight: 600 }}>{item.estimated_cost || '—'}</p>
            </div>
          </div>
          <div className="detail-field">
            <label>Description</label>
            <p>{item.description}</p>
          </div>
        </>
      )}
    />
  );
}

export default Maintenance;
