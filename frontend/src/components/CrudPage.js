import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const API = 'http://localhost:3001/api';

function CrudPage({ title, subtitle, endpoint, columns, formFields, renderDetail, cardMode, icon, showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [search, setSearch] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/${endpoint}`);
      setItems(res.data);
    } catch (err) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [endpoint, showToast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreate = () => {
    const initial = {};
    formFields.forEach(f => { initial[f.name] = f.default || ''; });
    setFormData(initial);
    setEditItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setFormData({ ...item });
    setEditItem(item);
    setShowForm(true);
    setSelectedItem(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`${API}/${endpoint}/${id}`);
      showToast('Item deleted successfully');
      setSelectedItem(null);
      fetchItems();
    } catch (err) {
      showToast('Failed to delete item', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await axios.put(`${API}/${endpoint}/${editItem.id}`, formData);
        showToast('Item updated successfully');
      } else {
        await axios.post(`${API}/${endpoint}`, formData);
        showToast('Item created successfully');
      }
      setShowForm(false);
      fetchItems();
    } catch (err) {
      showToast('Operation failed', 'error');
    }
  };

  const filtered = items.filter(item => {
    if (!search) return true;
    const s = search.toLowerCase();
    return Object.values(item).some(v =>
      v && String(v).toLowerCase().includes(s)
    );
  });

  if (selectedItem) {
    return (
      <div>
        <button className="back-btn" onClick={() => setSelectedItem(null)}>
          ← Back to {title}
        </button>
        <div className="detail-view">
          <div className="detail-header">
            <h3>{selectedItem[columns[0]?.key] || 'Detail'}</h3>
            <div className="btn-group">
              <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(selectedItem)}>
                ✏️ Edit
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedItem.id)}>
                🗑️ Delete
              </button>
            </div>
          </div>
          <div className="detail-body">
            {renderDetail ? renderDetail(selectedItem) : (
              formFields.map(f => (
                <div className="detail-field" key={f.name}>
                  <label>{f.label}</label>
                  <p>{String(selectedItem[f.name] || '—')}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>{icon} {title}</h2>
          <p>{subtitle}</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          + New {title.replace(/s$/, '').replace(/ies$/, 'y')}
        </button>
      </div>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder={`Search ${title.toLowerCase()}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{icon}</div>
          <p>No items found</p>
        </div>
      ) : cardMode ? (
        <div className="cards-grid">
          {filtered.map(item => (
            <div className="card" key={item.id} onClick={() => setSelectedItem(item)}>
              {columns.map((col, i) => {
                if (col.badge) {
                  return (
                    <span className={`badge badge-${col.badgeType || 'primary'}`} key={i}>
                      {item[col.key]}
                    </span>
                  );
                }
                if (i === 0) return <h3 key={i}>{col.render ? col.render(item) : item[col.key]}</h3>;
                if (i === 1) return <p key={i}>{String(col.render ? col.render(item) : (item[col.key] || '')).substring(0, 120)}...</p>;
                return null;
              })}
              <div className="card-meta">
                {columns.slice(2).filter(c => c.badge).map((col, i) => (
                  <span className={`badge badge-${col.badgeType || 'primary'}`} key={i}>
                    {item[col.key]}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {columns.map((col, i) => (
                  <th key={i}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} onClick={() => setSelectedItem(item)}>
                  {columns.map((col, i) => (
                    <td key={i}>
                      {col.badge ? (
                        <span className={`badge badge-${col.badgeColor ? col.badgeColor(item[col.key]) : 'primary'}`}>
                          {item[col.key]}
                        </span>
                      ) : col.render ? col.render(item) : (
                        String(item[col.key] || '—').substring(0, 80)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? 'Edit' : 'New'} {title.replace(/s$/, '').replace(/ies$/, 'y')}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formFields.map(f => (
                  <div className="form-group" key={f.name}>
                    <label>{f.label}</label>
                    {f.type === 'textarea' ? (
                      <textarea
                        className="form-control"
                        value={formData[f.name] || ''}
                        onChange={e => setFormData({ ...formData, [f.name]: e.target.value })}
                        required={f.required}
                      />
                    ) : f.type === 'select' ? (
                      <select
                        className="form-control"
                        value={formData[f.name] || ''}
                        onChange={e => setFormData({ ...formData, [f.name]: e.target.value })}
                        required={f.required}
                      >
                        <option value="">Select...</option>
                        {f.options.map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={f.type || 'text'}
                        className="form-control"
                        value={formData[f.name] || ''}
                        onChange={e => setFormData({ ...formData, [f.name]: e.target.value })}
                        required={f.required}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export { API };
export default CrudPage;
