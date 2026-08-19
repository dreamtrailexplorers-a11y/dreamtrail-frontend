import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import styles from '../Admin.module.css';

const ManageCustomPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/custom-pages`);
      setPages(res.data);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load custom pages' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingPage({
      _id: null,
      title: '',
      slug: '',
      blocks: []
    });
  };

  const handleEdit = async (id) => {
    try {
      const pageToEdit = pages.find(p => p._id === id);
      if (pageToEdit) {
        const fullPage = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/custom-pages/${pageToEdit.slug}`);
        setEditingPage(fullPage.data);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load page details' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this custom page?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/custom-pages/${id}`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('adminToken') || ''}` }
        });
        setMessage({ type: 'success', text: 'Page deleted successfully' });
        fetchPages();
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to delete page' });
      }
    }
  };

  const handleSavePage = async () => {
    if (!editingPage.title || !editingPage.slug) {
      setMessage({ type: 'error', text: 'Title and URL slug are required' });
      return;
    }

    try {
      setSaving(true);
      const headers = { Authorization: `Bearer ${sessionStorage.getItem('adminToken') || ''}` };
      
      if (editingPage._id) {
        // Update
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/custom-pages/${editingPage._id}`, editingPage, { headers });
        setMessage({ type: 'success', text: 'Page updated successfully!' });
      } else {
        // Create
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/custom-pages`, editingPage, { headers });
        setMessage({ type: 'success', text: 'Page created successfully!' });
      }
      
      setEditingPage(null);
      fetchPages();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save page' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleAddBlock = (type) => {
    setEditingPage({
      ...editingPage,
      blocks: [...editingPage.blocks, { type, content: '', imageUrl1: '', imageUrl2: '', title: '' }]
    });
  };

  const handleRemoveBlock = (index) => {
    const newBlocks = [...editingPage.blocks];
    newBlocks.splice(index, 1);
    setEditingPage({ ...editingPage, blocks: newBlocks });
  };

  const handleBlockChange = (index, field, value) => {
    const newBlocks = [...editingPage.blocks];
    newBlocks[index][field] = value;
    setEditingPage({ ...editingPage, blocks: newBlocks });
  };

  const handleMoveBlock = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === editingPage.blocks.length - 1)) return;
    const newBlocks = [...editingPage.blocks];
    const temp = newBlocks[index + direction];
    newBlocks[index + direction] = newBlocks[index];
    newBlocks[index] = temp;
    setEditingPage({ ...editingPage, blocks: newBlocks });
  };

  const uploadImageForBlock = async (file, blockIndex, field) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      handleBlockChange(blockIndex, field, res.data.url);
    } catch (err) {
      console.error('Image upload failed', err);
      alert('Image upload failed');
    }
  };

  if (loading) return <div>Loading Custom Pages...</div>;

  return (
    <div className={styles.adminPage}>
      <div className={styles.pageHeader}>
        <h2>Manage Custom Pages</h2>
        <button 
          className={styles.addBtn} 
          onClick={handleAddNew}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          <FiPlus /> Create New Page
        </button>
      </div>

      {message.text && (
        <div className={message.type === 'success' ? styles.successMessage : styles.errorMessage} style={{ marginBottom: '20px', padding: '10px', borderRadius: '4px', backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#991b1b' }}>
          {message.text}
        </div>
      )}

      <div className={styles.adminCard}>
        {pages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No custom pages found. Create one!</p>
        ) : (
          <table className={styles.dataTable} style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#475569' }}>Page Title</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#475569' }}>URL Slug</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px' }}><strong>{page.title}</strong></td>
                  <td style={{ padding: '12px', color: '#3b82f6' }}>/page/{page.slug}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button onClick={() => handleEdit(page._id)} style={{ padding: '6px 12px', marginRight: '10px', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer' }}>
                      <FiEdit /> Edit
                    </button>
                    <button onClick={() => handleDelete(page._id)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer' }}>
                      <FiTrash2 /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* EDIT/CREATE MODAL */}
      {editingPage && (
        <div className={styles.modalOverlay} onClick={() => setEditingPage(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div className={styles.pageHeader} style={{ marginBottom: '20px' }}>
              <h2>{editingPage._id ? 'Edit Custom Page' : 'Create Custom Page'}</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className={styles.cancelBtn} 
                  onClick={() => setEditingPage(null)} 
                  style={{ padding: '8px 16px', background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                >
                  Cancel
                </button>
                <button 
                  className={styles.saveBtn} 
                  onClick={handleSavePage} 
                  disabled={saving} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
                >
                  <FiSave /> {saving ? 'Saving...' : 'Save Page'}
                </button>
              </div>
            </div>

            <div className={styles.adminCard} style={{ marginBottom: '20px' }}>
              <h3>Page Settings</h3>
              <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '5px' }}>Page Title</label>
                  <input type="text" value={editingPage.title} onChange={e => setEditingPage({...editingPage, title: e.target.value})} placeholder="e.g. Refund Policy" style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '5px' }}>URL Slug</label>
                  <input type="text" value={editingPage.slug} onChange={e => setEditingPage({...editingPage, slug: e.target.value})} placeholder="e.g. refund-policy" style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                </div>
              </div>
            </div>

            <div className={styles.adminCard}>
              <div className={styles.adminResponsiveHeader}>
                <h3>Page Builder (Blocks)</h3>
                <select 
                  onChange={(e) => {
                    if(e.target.value) { handleAddBlock(e.target.value); e.target.value = ''; }
                  }}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="">+ Add a block...</option>
                  <option value="text">Text Paragraph</option>
                  <option value="full-image">Full Width Image</option>
                  <option value="half-images">Two Half Images</option>
                  <option value="point-title-text">Point Title & Text</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {editingPage.blocks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '8px', color: '#94a3b8' }}>
                    No blocks added yet. Use the dropdown above to add content.
                  </div>
                ) : (
                  editingPage.blocks.map((block, idx) => (
                    <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ background: '#f1f5f9', padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
                        <strong style={{ fontSize: '0.9rem', color: '#475569', textTransform: 'capitalize' }}>Block {idx + 1} - {block.type.replace('-', ' ')}</strong>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={() => handleMoveBlock(idx, -1)} disabled={idx === 0} style={{ padding: '4px 8px', cursor: 'pointer' }}><FiArrowUp /></button>
                          <button onClick={() => handleMoveBlock(idx, 1)} disabled={idx === editingPage.blocks.length - 1} style={{ padding: '4px 8px', cursor: 'pointer' }}><FiArrowDown /></button>
                          <button onClick={() => handleRemoveBlock(idx)} style={{ padding: '4px 8px', color: '#ef4444', border: '1px solid #fca5a5', background: '#fee2e2', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
                        </div>
                      </div>
                      <div style={{ padding: '15px' }}>
                        
                        {block.type === 'text' && (
                          <textarea 
                            rows="5" 
                            value={block.content} 
                            onChange={(e) => handleBlockChange(idx, 'content', e.target.value)} 
                            placeholder="Enter text paragraph here..."
                            style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', resize: 'vertical' }}
                          />
                        )}

                        {block.type === 'full-image' && (
                          <div>
                            {block.imageUrl1 && <img src={block.imageUrl1.startsWith('http') ? block.imageUrl1 : `${import.meta.env.VITE_BACKEND_URL}${block.imageUrl1}`} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }} />}
                            <input type="file" accept="image/*" onChange={(e) => uploadImageForBlock(e.target.files[0], idx, 'imageUrl1')} style={{ width: '100%' }} />
                          </div>
                        )}

                        {block.type === 'half-images' && (
                          <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '5px' }}>Left Image</label>
                              {block.imageUrl1 && <img src={block.imageUrl1.startsWith('http') ? block.imageUrl1 : `${import.meta.env.VITE_BACKEND_URL}${block.imageUrl1}`} alt="Preview 1" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }} />}
                              <input type="file" accept="image/*" onChange={(e) => uploadImageForBlock(e.target.files[0], idx, 'imageUrl1')} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '5px' }}>Right Image</label>
                              {block.imageUrl2 && <img src={block.imageUrl2.startsWith('http') ? block.imageUrl2 : `${import.meta.env.VITE_BACKEND_URL}${block.imageUrl2}`} alt="Preview 2" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }} />}
                              <input type="file" accept="image/*" onChange={(e) => uploadImageForBlock(e.target.files[0], idx, 'imageUrl2')} />
                            </div>
                          </div>
                        )}

                        {block.type === 'point-title-text' && (
                          <div>
                            <input 
                              type="text" 
                              value={block.title} 
                              onChange={(e) => handleBlockChange(idx, 'title', e.target.value)} 
                              placeholder="Point Title (e.g. 1. Eligibility)"
                              style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '10px', fontWeight: 'bold' }}
                            />
                            <textarea 
                              rows="4" 
                              value={block.content} 
                              onChange={(e) => handleBlockChange(idx, 'content', e.target.value)} 
                              placeholder="Point Description..."
                              style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', resize: 'vertical' }}
                            />
                          </div>
                        )}

                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCustomPages;

