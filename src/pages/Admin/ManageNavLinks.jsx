import React, { useState, useEffect } from 'react';
import { getNavLinks, createNavLink, updateNavLink, deleteNavLink } from '../../services/api';
import styles from './Admin.module.css';

const ManageNavLinks = () => {
  const [links, setLinks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showFullForm, setShowFullForm] = useState(false);
  
  const initialForm = { title: '', path: '', order: 0 };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchLinks();
  }, []);

  useEffect(() => {
    const mainContent = document.getElementById('admin-main-content');
    if (showFullForm) {
      if (mainContent) mainContent.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      if (mainContent) mainContent.style.overflow = 'auto';
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      if (mainContent) mainContent.style.overflow = 'auto';
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [showFullForm]);

  const fetchLinks = async () => {
    try {
      const { data } = await getNavLinks();
      setLinks(data.sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateNavLink(editingId, formData);
      } else {
        await createNavLink(formData);
      }
      fetchLinks();
      setFormData(initialForm);
      setEditingId(null);
      setShowFullForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (link) => {
    setEditingId(link._id);
    setFormData({ title: link.title, path: link.path, order: link.order });
    setShowFullForm(true);
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this link?')) {
      await deleteNavLink(id);
      fetchLinks();
    }
  };

  const loadDefaultLinks = async () => {
    if(window.confirm('This will load default navigation links. Continue?')) {
      const defaultLinks = [
        { title: 'Tour Packages', path: '/tour-packages', order: 1 },
        { title: 'Group Trips', path: '/group-trips', order: 2 },
        { title: 'Creator Trips', path: '/creator-trips', order: 3 },
      ];
      
      try {
        for (const link of defaultLinks) {
          await createNavLink(link);
        }
        fetchLinks();
        alert('Default links loaded successfully!');
      } catch (error) {
        console.error('Error loading default links', error);
        alert('Some links failed to load.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 className={styles.pageHeader} style={{ marginBottom: '0' }}>Manage Navigation Links</h2>
          <p style={{ color: '#64748b', marginTop: '5px' }}>Control the top menu links of your website.</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData(initialForm); setShowFullForm(true); }} 
          className={styles.btnPrimary}
        >
          + Add New Link
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {links.map(link => (
          <div key={link._id} className={styles.card} style={{ margin: 0, padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {link.order}
              </div>
              <div>
                <h4 style={{ margin: '0 0 2px 0', color: '#0f172a', fontSize: '1.1rem' }}>{link.title}</h4>
                <span style={{ fontSize: '0.85rem', color: '#64748b', wordBreak: 'break-all' }}>{link.path}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
              <button onClick={() => handleEdit(link)} className={styles.btnSecondary} style={{ flex: 1, padding: '8px' }}>Edit</button>
              <button onClick={() => handleDelete(link._id)} className={styles.btnDanger} style={{ flex: 1, padding: '8px' }}>Delete</button>
            </div>
          </div>
        ))}
        {links.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>No Navigation Links found. Click "+ Add New Link" or load the default links.</p>
            <button onClick={loadDefaultLinks} className={styles.btnSecondary} style={{ padding: '10px 20px' }}>
              Load Default Links
            </button>
          </div>
        )}
      </div>

      {showFullForm && (
        <div className={styles.modalOverlay} onClick={() => { setShowFullForm(false); setEditingId(null); }} style={{ padding: '20px', zIndex: 1100 }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '100%', padding: 0 }}>
            {/* Modal Header */}
            <div style={{ backgroundColor: '#ffffff', padding: '20px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px 16px 0 0' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>
                {editingId ? 'Edit Link' : 'Add New Link'}
              </h3>
              <button onClick={() => setShowFullForm(false)} className={styles.btnDanger} style={{ padding: '6px 16px' }}>Close</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '30px', backgroundColor: '#f8fafc', borderRadius: '0 0 16px 16px' }}>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.inputLabel}>Title</label>
                    <input name="title" value={formData.title} onChange={handleChange} placeholder="Link Title (e.g. Group Trips)" required className={styles.inputField} />
                  </div>
                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.inputLabel}>Path</label>
                    <input name="path" value={formData.path} onChange={handleChange} placeholder="Link Path (e.g. /group-trips)" required className={styles.inputField} />
                  </div>
                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.inputLabel}>Order</label>
                    <input name="order" type="number" value={formData.order} onChange={handleChange} placeholder="Display Order (e.g. 1)" required className={styles.inputField} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                  <button type="button" onClick={() => { setShowFullForm(false); setEditingId(null); }} className={styles.btnSecondary}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
                    {editingId ? 'Update Link' : 'Add Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageNavLinks;
