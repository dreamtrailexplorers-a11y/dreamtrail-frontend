import React, { useState, useEffect } from 'react';
import { getAttractions, createAttraction, updateAttraction, deleteAttraction, getDestinations, getTrips, uploadFile } from '../../../services/api';
import styles from '../Admin.module.css';

const generateSlug = (title) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

const ManageAttractions = () => {
  const initialForm = {
    title: '', slug: '', image: '', destination: '', overview: '',
    placesToVisitAround: [{ title: '', desc: '' }],
    thingsToDo: [{ title: '', desc: '' }],
    mustTryFood: [{ title: '', desc: '' }],
    cultureAndNature: '',
    localAttractions: [{ title: '', desc: '' }],
    shoppingSightseeing: [{ title: '', desc: '' }],
    bestTimeToVisit: '',
    faqs: [{ q: '', a: '' }],
    relatedTrips: [],
  };

  const [attractions, setAttractions] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [tripsList, setTripsList] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showFullForm, setShowFullForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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
      const [attrRes, destRes, tripsRes] = await Promise.all([
        getAttractions(),
        getDestinations(),
        getTrips()
      ]);
      setAttractions(attrRes.data);
      setDestinations(destRes.data);
      setTripsList(tripsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title') {
      setFormData({ ...formData, title: value, slug: generateSlug(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleArrayChange = (e, index, field, subField) => {
    const { value } = e.target;
    const newArray = [...formData[field]];
    newArray[index][subField] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field, isFaq = false) => {
    const newItem = isFaq ? { q: '', a: '' } : { title: '', desc: '' };
    setFormData({ ...formData, [field]: [...formData[field], newItem] });
  };

  const removeArrayItem = (index, field) => {
    const newArray = [...formData[field]];
    newArray.splice(index, 1);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingImage(true);
      try {
        const res = await uploadFile(file);
        setFormData(prev => ({ ...prev, image: res.data.url }));
      } catch (err) {
        console.error('Image upload failed', err);
        alert('Image upload failed');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.destination) {
      alert("Please select a destination");
      return;
    }
    try {
      if (editingId) {
        await updateAttraction(editingId, formData);
        alert('Attraction updated successfully!');
      } else {
        await createAttraction(formData);
        alert('Attraction added successfully!');
      }
      fetchData();
      setFormData(initialForm);
      setEditingId(null);
      setShowFullForm(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save attraction');
    }
  };

  const handleEdit = (attraction) => {
    const ensureArray = (arr) => arr && arr.length > 0 ? arr : [{ title: '', desc: '' }];
    const ensureFaq = (arr) => arr && arr.length > 0 ? arr : [{ q: '', a: '' }];
    
    setEditingId(attraction._id);
    setFormData({
      title: attraction.title || '',
      slug: attraction.slug || '',
      image: attraction.image || '',
      destination: attraction.destination || '',
      overview: attraction.overview || '',
      placesToVisitAround: ensureArray(attraction.placesToVisitAround),
      thingsToDo: ensureArray(attraction.thingsToDo),
      mustTryFood: ensureArray(attraction.mustTryFood),
      cultureAndNature: attraction.cultureAndNature || '',
      localAttractions: ensureArray(attraction.localAttractions),
      shoppingSightseeing: ensureArray(attraction.shoppingSightseeing),
      bestTimeToVisit: attraction.bestTimeToVisit || '',
      faqs: ensureFaq(attraction.faqs),
      relatedTrips: attraction.relatedTrips || [],
    });
    setShowFullForm(true);
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this attraction?')) {
      try {
        await deleteAttraction(id);
        fetchData();
      } catch (err) {
        console.error(err);
        alert('Failed to delete attraction');
      }
    }
  };

  const renderArrayField = (fieldLabel, fieldName) => (
    <div className={styles.card} style={{ marginTop: '20px', padding: '20px' }}>
      <h3 className={styles.cardTitle} style={{ fontSize: '1.1rem', marginBottom: '15px' }}>{fieldLabel}</h3>
      {formData[fieldName].map((item, index) => (
        <div key={index} style={{ border: '1px dashed #cbd5e1', padding: '15px', marginBottom: '15px', borderRadius: '8px', background: '#ffffff' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              placeholder="Title"
              value={item.title}
              onChange={(e) => handleArrayChange(e, index, fieldName, 'title')}
              className={styles.inputField}
            />
            <textarea
              placeholder="Description"
              value={item.desc}
              onChange={(e) => handleArrayChange(e, index, fieldName, 'desc')}
              className={styles.textareaField}
              rows="2"
            />
          </div>
          {formData[fieldName].length > 1 && (
            <button type="button" onClick={() => removeArrayItem(index, fieldName)} className={styles.btnDanger} style={{ marginTop: '10px', padding: '4px 10px', fontSize: '0.8rem' }}>
              Remove
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => addArrayItem(fieldName)} className={styles.btnSecondary} style={{ width: '100%' }}>
        + Add {fieldLabel} Item
      </button>
    </div>
  );

  const renderFaqField = () => (
    <div className={styles.card} style={{ marginTop: '20px', padding: '20px' }}>
      <h3 className={styles.cardTitle} style={{ fontSize: '1.1rem', marginBottom: '15px' }}>FAQs</h3>
      {formData.faqs.map((item, index) => (
        <div key={index} style={{ border: '1px dashed #cbd5e1', padding: '15px', marginBottom: '15px', borderRadius: '8px', background: '#ffffff' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              placeholder="Question"
              value={item.q}
              onChange={(e) => handleArrayChange(e, index, 'faqs', 'q')}
              className={styles.inputField}
            />
            <textarea
              placeholder="Answer"
              value={item.a}
              onChange={(e) => handleArrayChange(e, index, 'faqs', 'a')}
              className={styles.textareaField}
              rows="2"
            />
          </div>
          {formData.faqs.length > 1 && (
            <button type="button" onClick={() => removeArrayItem(index, 'faqs')} className={styles.btnDanger} style={{ marginTop: '10px', padding: '4px 10px', fontSize: '0.8rem' }}>
              Remove
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => addArrayItem('faqs', true)} className={styles.btnSecondary} style={{ width: '100%' }}>
        + Add FAQ
      </button>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.adminResponsiveHeader}>
        <div>
          <h2 className={styles.pageHeader} style={{ marginBottom: '0' }}>Manage Attractions</h2>
          <p style={{ color: '#64748b', marginTop: '5px' }}>Manage top destinations and sightseeing places.</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData(initialForm); setShowFullForm(true); }} 
          className={styles.btnPrimary}
        >
          + Add Attraction
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {attractions.map(attraction => (
          <div key={attraction._id} className={styles.card} style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ height: '160px', backgroundColor: '#e2e8f0', backgroundImage: `url(${attraction.image?.startsWith('http') ? attraction.image : `${import.meta.env.VITE_BACKEND_URL}${attraction.image}`})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              {!attraction.image && <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No Image</div>}
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '1.2rem' }}>{attraction.title}</h4>
              <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontWeight: '600' }}>Destination:</span> {attraction.destination}
              </p>

              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                <button onClick={() => handleEdit(attraction)} className={styles.btnSecondary} style={{ flex: 1 }}>Edit</button>
                <button onClick={() => handleDelete(attraction._id)} className={styles.btnDanger} style={{ flex: 1 }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {attractions.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#64748b' }}>No Attractions found. Click "Add Attraction" to create one.</p>
          </div>
        )}
      </div>

      {showFullForm && (
        <div className={styles.modalOverlay} onClick={() => { setShowFullForm(false); setEditingId(null); }} style={{ padding: '20px', zIndex: 1100 }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '100%', maxHeight: '95vh', overflowY: 'auto', padding: 0 }}>
            {/* Modal Header */}
            <div style={{ position: 'sticky', top: 0, backgroundColor: '#ffffff', zIndex: 10, padding: '20px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px 16px 0 0' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>
                {editingId ? `Edit Attraction` : 'Create New Attraction'}
              </h3>
              <button onClick={() => setShowFullForm(false)} className={styles.btnDanger} style={{ padding: '6px 16px' }}>Close</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '30px', backgroundColor: '#f8fafc' }}>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Attraction Title</label>
                    <input name="title" value={formData.title} onChange={handleChange} required className={styles.inputField} />
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Slug (URL)</label>
                    <input name="slug" value={formData.slug} onChange={handleChange} required className={styles.inputField} />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Destination</label>
                    <select name="destination" value={formData.destination} onChange={handleChange} required className={styles.inputField}>
                      <option value="">Select Destination</option>
                      {destinations.map(d => (
                        <option key={d._id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Related Package</label>
                    <select 
                      value={formData.relatedTrips[0] || ""} 
                      onChange={(e) => setFormData({...formData, relatedTrips: e.target.value ? [e.target.value] : []})} 
                      className={styles.inputField}
                      disabled={!formData.destination}
                    >
                      <option value="">-- Select a Package --</option>
                      {tripsList
                        .filter(trip => trip.destination === formData.destination)
                        .map(trip => (
                          <option key={trip._id} value={trip._id}>{trip.title}</option>
                        ))
                      }
                    </select>
                  </div>

                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.inputLabel}>Hero Image</label>
                    <div className={styles.responsiveFlexRow}>
                      <label style={{ cursor: 'pointer', background: '#3498db', color: 'white', padding: '8px 15px', borderRadius: '8px', fontSize: '0.9rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                        <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                      </label>
                      <input value={formData.image} readOnly placeholder="Image URL" className={styles.inputField} style={{ flex: 1, backgroundColor: '#ffffff' }} />
                    </div>
                  </div>

                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.inputLabel}>Overview</label>
                    <textarea name="overview" value={formData.overview} onChange={handleChange} required rows="3" className={styles.textareaField} />
                  </div>

                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.inputLabel}>Culture and Nature</label>
                    <textarea name="cultureAndNature" value={formData.cultureAndNature} onChange={handleChange} rows="2" className={styles.textareaField} />
                  </div>

                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.inputLabel}>Best Time to Visit</label>
                    <textarea name="bestTimeToVisit" value={formData.bestTimeToVisit} onChange={handleChange} rows="2" className={styles.textareaField} />
                  </div>
                </div>

                {renderArrayField('Places to Visit Around', 'placesToVisitAround')}
                {renderArrayField('Things to Do', 'thingsToDo')}
                {renderArrayField('Must-Try Food Dishes', 'mustTryFood')}
                {renderArrayField('Local Attractions', 'localAttractions')}
                {renderArrayField('Shopping & Sightseeing', 'shoppingSightseeing')}
                {renderFaqField()}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                  <button type="button" onClick={() => { setShowFullForm(false); setEditingId(null); }} className={styles.btnSecondary}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.btnPrimary} disabled={uploadingImage}>
                    {editingId ? 'Save Changes' : 'Create Attraction'}
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

export default ManageAttractions;

