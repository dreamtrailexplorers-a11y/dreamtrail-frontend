import React, { useState, useEffect } from 'react';
import { getReviews, createReview, deleteReview, uploadFile, getDestinations, getTrips } from '../../services/api';
import styles from './Admin.module.css';

const StarRating = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{
            fontSize: '28px',
            cursor: 'pointer',
            color: star <= (hovered || value) ? '#f5a623' : 'transparent',
            WebkitTextStroke: star <= (hovered || value) ? '0px' : '1.5px #333',
            transition: 'color 0.15s',
            userSelect: 'none',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const StringArrayInput = ({ title, data = [], onChange, isImage = false, maxItems }) => {
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
      const fullUrl = res.data.url.startsWith('http') ? res.data.url : `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      handleChange(i, fullUrl);
    } catch(err) {
      alert('Upload failed');
    }
  };

  return (
    <div className={styles.card} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
      <h4 className={styles.cardTitle} style={{ fontSize: '0.9rem', marginBottom: '10px', color: '#475569', textTransform: 'uppercase' }}>{title}</h4>
      {data.map((item, i) => (
        <div key={i} className={styles.responsiveFlexRow} style={{ marginBottom: '10px' }}>
          {isImage && (
            <label style={{ cursor: 'pointer', background: '#3498db', color: 'white', padding: '8px 15px', borderRadius: '8px', fontSize: '0.9rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
              Upload Image
              <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleUploadImage(e, i)} />
            </label>
          )}
          <input value={item} onChange={(e) => handleChange(i, e.target.value)} placeholder="Image URL" className={styles.inputField} style={{ flex: 1, backgroundColor: '#ffffff' }} />
          <button type="button" onClick={() => handleRemove(i)} className={styles.btnDanger} style={{ padding: '8px 12px', borderRadius: '8px' }}>X</button>
        </div>
      ))}
      {(!maxItems || data.length < maxItems) && (
        <button type="button" onClick={handleAdd} className={styles.btnSecondary} style={{ marginTop: '5px' }}>+ Add Image</button>
      )}
    </div>
  );
};

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showFullForm, setShowFullForm] = useState(false);
  
  const initialForm = {
    author: '',
    location: '',
    avatar: '',
    rating: 0,
    tripImage: '',
    tripImages: [],
    review: '',
    destination: '',
    tripSlug: ''
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [destinations, setDestinations] = useState([]);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    fetchReviews();
    fetchDropdownData();
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

  const fetchDropdownData = async () => {
    try {
      const [destRes, tripsRes] = await Promise.all([getDestinations(), getTrips()]);
      setDestinations(destRes.data);
      setTrips(tripsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await getReviews();
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUploadMainImage = async (e, fieldName) => {
    const file = e.target.files[0];
    if(!file) return;
    try {
      const res = await uploadFile(file);
      const fullUrl = res.data.url.startsWith('http') ? res.data.url : `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      setFormData(prev => ({ ...prev, [fieldName]: fullUrl }));
    } catch(err) {
      alert('Upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rating || formData.rating === 0) {
      alert('Please select a star rating');
      return;
    }
    try {
      if (editingId) {
        await deleteReview(editingId); // Currently simulating update by deleting and recreating
        await createReview(formData);
      } else {
        await createReview(formData);
      }
      fetchReviews();
      setFormData(initialForm);
      setEditingId(null);
      setShowFullForm(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save review');
    }
  };

  const handleEdit = (rev) => {
    setEditingId(rev._id);
    let images = rev.tripImages && rev.tripImages.length > 0 ? rev.tripImages : (rev.tripImage ? [rev.tripImage] : []);
    setFormData({ ...rev, tripImages: images });
    setShowFullForm(true);
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview(id);
        fetchReviews();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.adminResponsiveHeader}>
        <div>
          <h2 className={styles.pageHeader} style={{ marginBottom: '0' }}>Manage Reviews</h2>
          <p style={{ color: '#64748b', marginTop: '5px' }}>Manage customer testimonials and feedback.</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData(initialForm); setShowFullForm(true); }} 
          className={styles.btnPrimary}
        >
          + Add Review
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {reviews.map(rev => (
            <div key={rev._id} style={{ 
              background: '#ffffff', 
              borderRadius: '24px', 
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', 
              overflow: 'hidden', 
              display: 'flex', 
              flexDirection: 'column', 
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              border: '1px solid #f1f5f9',
              position: 'relative'
            }}>
              {/* Hero Image */}
              <div style={{ 
                height: '110px', 
                backgroundColor: '#e2e8f0', 
                backgroundImage: `url(${rev.tripImage || (rev.tripImages?.length > 0 ? rev.tripImages[0] : null) || rev.avatar})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}></div>
                {(!rev.tripImage && !(rev.tripImages?.length > 0) && !rev.avatar) && <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', position: 'relative', zIndex: 1 }}>No Image</div>}
              </div>
              
              {/* Body */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', backgroundColor: '#fff' }}>
                
                {/* Avatar & Info */}
                <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 2, marginBottom: '15px' }}>
                  <div style={{ marginTop: '-40px' }}>
                    {rev.avatar ? (
                      <img src={rev.avatar} alt="author" style={{ width: '65px', height: '65px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', backgroundColor: '#cbd5e1', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} />
                    ) : (
                      <div style={{ width: '65px', height: '65px', borderRadius: '50%', backgroundColor: '#3b82f6', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '1.5rem', boxShadow: '0 4px 8px rgba(59,130,246,0.2)' }}>
                        {rev.author ? rev.author.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                  <div style={{ paddingTop: '5px' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.2px' }}>{rev.author}</h4>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {rev.destination && <span style={{ fontSize: '0.65rem', color: '#4338ca', backgroundColor: '#e0e7ff', padding: '3px 8px', borderRadius: '10px', fontWeight: '800', textTransform: 'uppercase' }}>{rev.destination}</span>}
                      {rev.tripSlug && <span style={{ fontSize: '0.65rem', color: '#0284c7', backgroundColor: '#e0f2fe', padding: '3px 8px', borderRadius: '10px', fontWeight: '800', textTransform: 'uppercase' }}>PKG: {rev.tripSlug}</span>}
                    </div>
                  </div>
                </div>

                {/* Stars */}
                <div style={{ display: 'flex', gap: '3px', marginBottom: '10px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} style={{ fontSize: '16px', color: star <= rev.rating ? '#fbbf24' : '#e2e8f0' }}>★</span>
                  ))}
                </div>

                {/* Watermark Quote */}
                <span style={{ position: 'absolute', right: '15px', top: '50px', fontSize: '4.5rem', color: '#f8fafc', fontWeight: '900', lineHeight: 1, zIndex: 0, userSelect: 'none', fontFamily: 'Georgia, serif' }}>"</span>

                {/* Review Text */}
                <p style={{ margin: '0 0 15px 0', fontSize: '0.85rem', color: '#334155', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5', fontStyle: 'italic', position: 'relative', zIndex: 1 }}>
                  "{rev.review}"
                </p>
  
                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '12px', position: 'relative', zIndex: 1 }}>
                  <button onClick={() => handleEdit(rev)} style={{ flex: 1, padding: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', color: '#475569', fontWeight: '700', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(rev._id)} style={{ flex: 1, padding: '8px', backgroundColor: '#fff1f2', border: '1px solid #ffe4e6', borderRadius: '10px', cursor: 'pointer', color: '#e11d48', fontWeight: '700', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
        ))}
        {reviews.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#64748b' }}>No Reviews found. Click "Add Review" to create one.</p>
          </div>
        )}
      </div>

      {showFullForm && (
        <div className={styles.modalOverlay} onClick={() => { setShowFullForm(false); setEditingId(null); }} style={{ padding: '20px', zIndex: 1100 }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', width: '100%', maxHeight: '95vh', overflowY: 'auto', padding: 0 }}>
            {/* Modal Header */}
            <div style={{ position: 'sticky', top: 0, backgroundColor: '#ffffff', zIndex: 10, padding: '20px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px 16px 0 0' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>
                {editingId ? `Edit Review` : 'Create New Review'}
              </h3>
              <button onClick={() => setShowFullForm(false)} className={styles.btnDanger} style={{ padding: '6px 16px' }}>Close</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '30px', backgroundColor: '#f8fafc' }}>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.inputLabel}>Destination (Optional - Shows on all trips in dest)</label>
                    <select name="destination" value={formData.destination} onChange={handleChange} className={styles.inputField}>
                      <option value="">Select Destination</option>
                      {destinations.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                  
                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.inputLabel}>Package (Optional - Shows ONLY on this package)</label>
                    <select name="tripSlug" value={formData.tripSlug} onChange={handleChange} className={styles.inputField}>
                      <option value="">Select Package</option>
                      {trips.filter(t => !formData.destination || t.destination === formData.destination).map(t => (
                        <option key={t._id} value={t.slug}>{t.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.inputLabel}>Author</label>
                    <input name="author" value={formData.author} onChange={handleChange} placeholder="Author" required className={styles.inputField} />
                  </div>

                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.inputLabel}>Avatar URL</label>
                    <div className={styles.responsiveFlexRow}>
                      <label style={{ cursor: 'pointer', background: '#3498db', color: 'white', padding: '8px 15px', borderRadius: '8px', fontSize: '0.9rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                        Upload Avatar
                        <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleUploadMainImage(e, 'avatar')} />
                      </label>
                      <input name="avatar" value={formData.avatar} onChange={handleChange} placeholder="Avatar URL" className={styles.inputField} style={{ flex: 1, backgroundColor: '#ffffff' }} />
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.inputLabel}>Rating</label>
                    <div style={{ backgroundColor: '#fff', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'inline-block' }}>
                      <StarRating
                        value={formData.rating}
                        onChange={(val) => setFormData({ ...formData, rating: val })}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <StringArrayInput 
                      title="Trip Images (0 to 4 Images)" 
                      data={formData.tripImages} 
                      onChange={(d) => setFormData({...formData, tripImages: d})} 
                      isImage={true} 
                      maxItems={4} 
                    />
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '5px' }}>Leave empty for text-only review. Upload 1, 2, 3, or 4 images to create a gallery.</p>
                  </div>
                  
                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.inputLabel}>Review Text</label>
                    <textarea name="review" value={formData.review} onChange={handleChange} placeholder="Review text" required className={styles.textareaField} style={{ minHeight: '120px' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                  <button type="button" onClick={() => { setShowFullForm(false); setEditingId(null); }} className={styles.btnSecondary}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
                    {editingId ? 'Save Changes' : 'Create Review'}
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

export default ManageReviews;

