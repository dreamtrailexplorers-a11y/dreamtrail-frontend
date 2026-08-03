import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDestinations, updateDestination, uploadFile, createTrip } from '../../services/api';
import styles from './Admin.module.css';

import ManagePackages from './ManagePackages';

const FillDestinationDetail = ({ destId, onClose }) => {
  const { id: paramId } = useParams();
  const id = destId || paramId;
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [packageForm, setPackageForm] = useState({ title: '', slug: '', category: 'Tour Package' });
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);

  useEffect(() => {
    const fetchDest = async () => {
      const { data } = await getDestinations();
      const dest = data.find(d => d._id === id);
      if (dest) setFormData(dest);
    };
    fetchDest();
  }, [id]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePackageChange = (e) => setPackageForm({ ...packageForm, [e.target.name]: e.target.value });

  const handleUploadMainImage = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    try {
      const res = await uploadFile(file);
      const fullUrl = `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      setFormData({ ...formData, image: fullUrl });
    } catch(err) {
      alert('Upload failed');
    }
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
              <label className={styles.inputLabel}>Starting Price</label>
              <input name="startingPrice" type="number" value={formData.startingPrice || ''} onChange={handleChange} className={styles.inputField} />
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
              <label className={styles.inputLabel}>Tagline</label>
              <input name="tagline" value={formData.tagline || ''} onChange={handleChange} className={styles.inputField} />
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
