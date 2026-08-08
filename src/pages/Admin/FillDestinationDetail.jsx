import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDestinations, updateDestination, uploadFile } from '../../services/api';
import styles from './Admin.module.css';
import { iconMap, iconNamesMap } from '../../utils/iconMap';

const FillDestinationDetail = ({ destId, onClose }) => {
  const { id: paramId } = useParams();
  const id = destId || paramId;
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchDest = async () => {
      const { data } = await getDestinations();
      const dest = data.find(d => d._id === id);
      if (dest) setFormData(dest);
    };
    fetchDest();
  }, [id]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUploadMainImage = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    try {
      const res = await uploadFile(file);
      const fullUrl = res.data.url.startsWith('http') ? res.data.url : `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      setFormData({ ...formData, image: fullUrl });
    } catch(err) {
      alert('Upload failed');
    }
  };

  const handleIconChange = (iconName) => {
    setFormData({ ...formData, icon: iconName });
  };

  const handleWhyUsChange = (index, field, value) => {
    const newWhyUs = [...(formData.whyChooseUs || [])];
    newWhyUs[index] = { ...newWhyUs[index], [field]: value };
    setFormData({ ...formData, whyChooseUs: newWhyUs });
  };

  const addWhyUsItem = () => {
    const newWhyUs = [...(formData.whyChooseUs || []), { title: '', description: '' }];
    setFormData({ ...formData, whyChooseUs: newWhyUs });
  };

  const removeWhyUsItem = (index) => {
    const newWhyUs = (formData.whyChooseUs || []).filter((_, i) => i !== index);
    setFormData({ ...formData, whyChooseUs: newWhyUs });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData) {
      await updateDestination(formData._id, formData);
      alert('Destination Details Updated!');
      if (onClose) onClose();
    }
  };

  if (!formData) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className={styles.pageHeader} style={{ margin: 0 }}>Edit Destination</h2>
        <button type="button" onClick={() => { if(onClose) { onClose() } else { navigate('/admin/destinations') } }} className={styles.btnSecondary}>
          {onClose ? 'Close' : 'Back to Destinations'}
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <h3 className={styles.cardTitle} style={{ marginBottom: '10px', fontSize: '1.1rem' }}>Destination Details</h3>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Destination Name</label>
              <input name="name" value={formData.name || ''} onChange={handleChange} className={styles.inputField} required />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Cover Image URL</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label className={styles.btnPrimary} style={{ cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', padding: '8px 12px' }}>
                  Upload Image
                  <input type="file" style={{ display: 'none' }} onChange={handleUploadMainImage} accept="image/*" />
                </label>
                <input name="image" value={formData.image || ''} onChange={handleChange} placeholder="Or enter image URL" className={styles.inputField} style={{ flex: 1 }} />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Destination Type</label>
              <select name="type" value={formData.type || 'international'} onChange={handleChange} className={styles.inputField} required>
                <option value="domestic">Domestic</option>
                <option value="international">International</option>
              </select>
            </div>
            <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.inputLabel}>About Text</label>
              <textarea name="aboutText" value={formData.aboutText || ''} onChange={handleChange} className={styles.inputField} rows="2" />
            </div>

            {/* Icon Selection */}
            <div className={styles.inputGroup} style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <label className={styles.inputLabel}>Select Icon</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', marginTop: '5px', maxHeight: '150px', overflowY: 'auto', padding: '5px' }}>
                {Object.keys(iconMap).map(iconName => (
                  <div 
                    key={iconName}
                    onClick={() => handleIconChange(iconName)}
                    style={{
                      padding: '8px 4px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '5px',
                      border: formData.icon === iconName ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: formData.icon === iconName ? '#eff6ff' : '#fff',
                      color: formData.icon === iconName ? '#3b82f6' : '#475569'
                    }}
                    title={iconNamesMap[iconName] || iconName}
                  >
                    <div style={{ fontSize: '1.5rem' }}>{iconMap[iconName]}</div>
                    <span style={{ fontSize: '0.65rem', textAlign: 'center', lineHeight: '1.1' }}>{iconNamesMap[iconName] || iconName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Choose Us */}
            <div className={styles.inputGroup} style={{ gridColumn: '1 / -1', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
              <label className={styles.inputLabel}>Why Choose Us (Optional)</label>
              {(formData.whyChooseUs || []).map((item, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>Item {index + 1}</span>
                    <button type="button" onClick={() => removeWhyUsItem(index)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Remove</button>
                  </div>
                  <input 
                    type="text" 
                    value={item.title || ''} 
                    onChange={(e) => handleWhyUsChange(index, 'title', e.target.value)}
                    placeholder="Title (e.g., Most Experienced Company)"
                    className={styles.inputField}
                    style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                  />
                  <textarea 
                    value={item.description || ''} 
                    onChange={(e) => handleWhyUsChange(index, 'description', e.target.value)}
                    placeholder="Description..."
                    className={styles.inputField}
                    rows={2}
                    style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                  />
                </div>
              ))}
              <button 
                type="button"
                onClick={addWhyUsItem}
                style={{ width: '100%', padding: '8px', backgroundColor: '#f1f5f9', color: '#3b82f6', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
              >
                + Add Item
              </button>
            </div>
            
          </div>
        </div>

        <div className={styles.btnGroup} style={{ marginTop: '15px', justifyContent: 'flex-end' }}>
          <button type="submit" className={styles.btnPrimary} style={{ padding: '10px 20px' }}>
            Update Destination
          </button>
        </div>
      </form>
    </div>
  );
};

export default FillDestinationDetail;

