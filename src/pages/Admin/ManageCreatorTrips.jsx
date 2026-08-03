import React, { useState, useEffect } from 'react';
import { getCreatorTrips, createCreatorTrip, updateCreatorTrip, deleteCreatorTrip, getTrips, uploadFile } from '../../services/api';
import styles from './Admin.module.css';

const StringArrayInput = ({ title, data = [], onChange, isImage = false, uploadFile }) => {
  const handleAdd = () => onChange([...data, '']);
  const handleRemove = (i) => onChange(data.filter((_, idx) => idx !== i));
  const handleChange = (i, value) => {
    const newData = [...data];
    newData[i] = value;
    onChange(newData);
  };

  const handleUploadImage = async (e, i) => {
    const file = e.target.files[0];
    if(!file) return;
    try {
      const res = await uploadFile(file);
      const fullUrl = `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      handleChange(i, fullUrl);
    } catch(err) {
      alert('Upload failed');
    }
  };

  return (
    <div className={styles.card} style={{ marginTop: '20px', padding: '15px', gridColumn: '1 / -1' }}>
      <h4 className={styles.cardTitle} style={{ fontSize: '1rem', marginBottom: '10px' }}>{title}</h4>
      {data.map((item, i) => (
        <div key={i} className={styles.responsiveFlexRow} style={{ marginBottom: '5px' }}>
          {isImage && (
            <label style={{ cursor: 'pointer', background: '#3498db', color: 'white', padding: '8px', borderRadius: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              Upload Image
              <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleUploadImage(e, i)} />
            </label>
          )}
          <input value={item} onChange={(e) => handleChange(i, e.target.value)} className={styles.inputField} style={{ flex: 1, padding: '8px', backgroundColor: isImage ? '#f9f9f9' : '#fff' }} />
          <button type="button" onClick={() => handleRemove(i)} className={styles.btnDanger}>X</button>
        </div>
      ))}
      <button type="button" onClick={handleAdd} className={styles.btnSecondary} style={{ marginTop: '10px' }}>+ Add Image</button>
    </div>
  );
};

const ManageCreatorTrips = () => {
  const [creatorTrips, setCreatorTrips] = useState([]);
  const [allTrips, setAllTrips] = useState([]);
  const [editingTrip, setEditingTrip] = useState(null);
  const [showFullForm, setShowFullForm] = useState(false);
  
  const initialForm = {
    title: '', slug: '', curatorName: '', curatorAvatar: '', 
    curatorFollowers: '', aboutItinerary: '', hotelCategory: '', 
    meals: '', linkedTrip: '', galleryImages: []
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchData();
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

  const fetchData = async () => {
    try {
      const [creatorRes, tripsRes] = await Promise.all([
        getCreatorTrips(),
        getTrips()
      ]);
      setCreatorTrips(creatorRes.data);
      setAllTrips(tripsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'linkedTrip' && value) {
      const selectedTrip = allTrips.find(t => t._id === value);
      if (selectedTrip) {
        setFormData(prev => ({
          ...prev,
          linkedTrip: value,
          title: prev.title || selectedTrip.title,
          slug: prev.slug || (selectedTrip.slug ? selectedTrip.slug + '-creator' : ''),
          hotelCategory: prev.hotelCategory || selectedTrip.hotelCategory || '',
          meals: prev.meals || selectedTrip.meals || '',
          aboutItinerary: prev.aboutItinerary || selectedTrip.aboutTrip || '',
          galleryImages: prev.galleryImages.length > 0 ? prev.galleryImages : (selectedTrip.galleryImages || [])
        }));
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    try {
      const res = await uploadFile(file);
      const fullUrl = `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      setFormData(prev => ({ ...prev, curatorAvatar: fullUrl }));
    } catch(err) {
      alert('Upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.linkedTrip) {
      alert("Please select a linked package.");
      return;
    }
    
    try {
      if (editingTrip) {
        await updateCreatorTrip(editingTrip._id, formData);
        alert('Creator Trip updated successfully');
      } else {
        await createCreatorTrip(formData);
        alert('Creator Trip created successfully');
      }
      setFormData(initialForm);
      setEditingTrip(null);
      setShowFullForm(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error saving Creator Trip');
    }
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    let gallery = trip.galleryImages && trip.galleryImages.length > 0 
      ? [...trip.galleryImages] 
      : [''];
      
    setFormData({
      title: trip.title,
      slug: trip.slug,
      curatorName: trip.curatorName || '',
      curatorAvatar: trip.curatorAvatar || '',
      curatorFollowers: trip.curatorFollowers || '',
      aboutItinerary: trip.aboutItinerary || '',
      hotelCategory: trip.hotelCategory || '',
      meals: trip.meals || '',
      linkedTrip: trip.linkedTrip?._id || trip.linkedTrip || '',
      galleryImages: gallery
    });
    setShowFullForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this creator trip?')) {
      try {
        await deleteCreatorTrip(id);
        fetchData();
      } catch (error) {
        console.error(error);
        alert('Error deleting creator trip');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 className={styles.pageHeader} style={{ marginBottom: '0' }}>Creator Trips</h2>
          <p style={{ color: '#64748b', marginTop: '5px' }}>Manage all influencer and creator curated trips.</p>
        </div>
        <button 
          onClick={() => { setEditingTrip(null); setFormData(initialForm); setShowFullForm(true); }} 
          className={styles.btnPrimary}
        >
          + Add Creator Trip
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {creatorTrips.map(trip => (
          <div key={trip._id} className={styles.card} style={{ margin: 0, padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              {trip.curatorAvatar ? (
                <img src={trip.curatorAvatar} alt="avatar" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
              ) : (
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                  {trip.curatorName ? trip.curatorName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div>
                <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>{trip.curatorName || 'Unknown Curator'}</h4>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{trip.curatorFollowers || 'No followers data'}</span>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px', flex: 1 }}>
              <h5 style={{ margin: '0 0 5px 0', color: '#334155', fontSize: '1rem' }}>{trip.title}</h5>
              <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <strong>Linked Package:</strong> {trip.linkedTrip?.title || 'Unknown'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
              <button onClick={() => handleEdit(trip)} className={styles.btnSecondary} style={{ flex: 1 }}>Edit</button>
              <button onClick={() => handleDelete(trip._id)} className={styles.btnDanger} style={{ flex: 1 }}>Delete</button>
            </div>
          </div>
        ))}
        {creatorTrips.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#64748b' }}>No Creator Trips found. Click "Add Creator Trip" to create one.</p>
          </div>
        )}
      </div>

      {showFullForm && (
        <div className={styles.modalOverlay} onClick={() => { setShowFullForm(false); setEditingTrip(null); }} style={{ padding: '20px', zIndex: 1100 }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '100%', maxHeight: '95vh', overflowY: 'auto', padding: 0 }}>
            {/* Modal Header */}
            <div style={{ position: 'sticky', top: 0, backgroundColor: '#ffffff', zIndex: 10, padding: '20px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px 16px 0 0' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>
                {editingTrip ? `Edit: ${formData.title}` : 'Create New Creator Trip'}
              </h3>
              <button onClick={() => setShowFullForm(false)} className={styles.btnDanger} style={{ padding: '6px 16px' }}>Close</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '30px', backgroundColor: '#f8fafc' }}>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Title</label>
                    <input name="title" value={formData.title} onChange={handleChange} required className={styles.inputField} placeholder="e.g. Experience Spiti Valley" />
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Slug (URL)</label>
                    <input name="slug" value={formData.slug} onChange={handleChange} required className={styles.inputField} placeholder="e.g. experience-spiti" />
                  </div>

                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.inputLabel}>Link to Existing Package (Tour/Group Trip)</label>
                    <select name="linkedTrip" value={formData.linkedTrip} onChange={handleChange} required className={styles.inputField}>
                      <option value="">-- Select Package --</option>
                      {allTrips.map(t => (
                        <option key={t._id} value={t._id}>{t.title} ({t.destination})</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Curator Name</label>
                    <input name="curatorName" value={formData.curatorName} onChange={handleChange} required className={styles.inputField} placeholder="e.g. Aditi Raval" />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Followers Count</label>
                    <input name="curatorFollowers" value={formData.curatorFollowers} onChange={handleChange} className={styles.inputField} placeholder="e.g. 205.2k followers" />
                  </div>

                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.inputLabel}>Curator Avatar URL</label>
                    <div className={styles.responsiveFlexRow}>
                      <label style={{ cursor: 'pointer', background: '#3498db', color: 'white', padding: '8px 15px', borderRadius: '8px', fontSize: '0.9rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                        Upload Avatar
                        <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleUploadAvatar} />
                      </label>
                      <input name="curatorAvatar" value={formData.curatorAvatar} onChange={handleChange} className={styles.inputField} placeholder="https://..." style={{ flex: 1, backgroundColor: '#ffffff' }} />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Hotel Category Override</label>
                    <input name="hotelCategory" value={formData.hotelCategory} onChange={handleChange} className={styles.inputField} placeholder="e.g. Premium" />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Meals Override</label>
                    <input name="meals" value={formData.meals} onChange={handleChange} className={styles.inputField} placeholder="e.g. Breakfast + Dinner" />
                  </div>

                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.inputLabel}>About this Itinerary</label>
                    <textarea name="aboutItinerary" value={formData.aboutItinerary} onChange={handleChange} className={styles.textareaField}></textarea>
                  </div>
                </div>

                <StringArrayInput title="Custom Gallery Images (Overrides Linked Trip Images)" isImage={true} data={formData.galleryImages} onChange={(d) => setFormData({...formData, galleryImages: d})} uploadFile={uploadFile} />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                  <button type="button" onClick={() => { setShowFullForm(false); setEditingTrip(null); }} className={styles.btnSecondary}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
                    {editingTrip ? 'Save Changes' : 'Create Creator Trip'}
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

export default ManageCreatorTrips;
