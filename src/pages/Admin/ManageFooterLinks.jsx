import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSave, FiPlus, FiTrash2, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import styles from './Admin.module.css';

const ManageFooterLinks = () => {
  const [footerToursIndia, setFooterToursIndia] = useState([]);
  const [footerToursAsia, setFooterToursAsia] = useState([]);
  const [footerOtherLinks, setFooterOtherLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [originalSettings, setOriginalSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/settings`);
      setOriginalSettings(res.data);
      if (res.data) {
        setFooterToursIndia(res.data.footerToursIndia || []);
        setFooterToursAsia(res.data.footerToursAsia || []);
        setFooterOtherLinks(res.data.footerOtherLinks || []);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load footer links' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = (categoryData, setter) => {
    setter([...categoryData, { label: '', url: '' }]);
  };

  const handleRemoveLink = (categoryData, setter, index) => {
    const newLinks = [...categoryData];
    newLinks.splice(index, 1);
    setter(newLinks);
  };

  const handleLinkChange = (categoryData, setter, index, field, value) => {
    const newLinks = [...categoryData];
    newLinks[index][field] = value;
    setter(newLinks);
  };

  const handleMoveUp = (categoryData, setter, index) => {
    if (index === 0) return;
    const newLinks = [...categoryData];
    const temp = newLinks[index - 1];
    newLinks[index - 1] = newLinks[index];
    newLinks[index] = temp;
    setter(newLinks);
  };

  const handleMoveDown = (categoryData, setter, index) => {
    if (index === categoryData.length - 1) return;
    const newLinks = [...categoryData];
    const temp = newLinks[index + 1];
    newLinks[index + 1] = newLinks[index];
    newLinks[index] = temp;
    setter(newLinks);
  };

  const handleSave = async () => {
    const allLinks = [...footerToursIndia, ...footerToursAsia, ...footerOtherLinks];
    const invalidLink = allLinks.find(link => !link.label.trim() || !link.url.trim());
    if (invalidLink) {
      setMessage({ type: 'error', text: 'All links must have a label and a URL' });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      const updatedSettings = { 
        ...originalSettings, 
        footerToursIndia, 
        footerToursAsia, 
        footerOtherLinks 
      };
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/settings`, updatedSettings, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('adminToken') || ''}`
        }
      });
      setMessage({ type: 'success', text: 'Footer & Mobile links saved successfully!' });
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to save footer links' });
    } finally {
      setSaving(false);
    }
  };

  const renderLinkSection = (title, categoryData, setter) => (
    <div className={styles.adminCard} style={{ marginBottom: '30px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <button 
          onClick={() => handleAddLink(categoryData, setter)}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          <FiPlus /> Add Link
        </button>
      </div>

      {categoryData.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No links configured in this section. Add one!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {categoryData.map((link, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '15px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '5px' }}>Link Label</label>
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => handleLinkChange(categoryData, setter, idx, 'label', e.target.value)}
                  placeholder="e.g. Motorcycle Tours"
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '5px' }}>URL Route</label>
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => handleLinkChange(categoryData, setter, idx, 'url', e.target.value)}
                  placeholder="e.g. /tour-packages"
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '5px', paddingTop: '20px' }}>
                <button 
                  onClick={() => handleMoveUp(categoryData, setter, idx)} 
                  disabled={idx === 0}
                  style={{ padding: '8px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: idx === 0 ? '#cbd5e1' : '#475569' }}
                  title="Move Up"
                >
                  <FiArrowUp />
                </button>
                <button 
                  onClick={() => handleMoveDown(categoryData, setter, idx)} 
                  disabled={idx === categoryData.length - 1}
                  style={{ padding: '8px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: idx === categoryData.length - 1 ? 'not-allowed' : 'pointer', color: idx === categoryData.length - 1 ? '#cbd5e1' : '#475569' }}
                  title="Move Down"
                >
                  <FiArrowDown />
                </button>
                <button 
                  onClick={() => handleRemoveLink(categoryData, setter, idx)}
                  style={{ padding: '8px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer', color: '#ef4444' }}
                  title="Remove Link"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.adminPage}>
      <div className={styles.pageHeader}>
        <h2>Manage Footer & Mobile Links</h2>
        <button 
          className={styles.saveBtn} 
          onClick={handleSave}
          disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message.text && (
        <div className={message.type === 'success' ? styles.successMessage : styles.errorMessage} style={{ marginBottom: '20px', padding: '10px', borderRadius: '4px', backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#991b1b' }}>
          {message.text}
        </div>
      )}

      {renderLinkSection('Motorcycle Tours (India)', footerToursIndia, setFooterToursIndia)}
      {renderLinkSection('Asia', footerToursAsia, setFooterToursAsia)}
      {renderLinkSection('Other Links', footerOtherLinks, setFooterOtherLinks)}
      
    </div>
  );
};

export default ManageFooterLinks;

