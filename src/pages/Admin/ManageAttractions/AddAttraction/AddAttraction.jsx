import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getDestinations, getTrips, createAttraction, uploadFile } from '../../../../services/api';
import styles from './AddAttraction.module.css';

const generateSlug = (title) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

const AddAttraction = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    image: '',
    destination: '',
    overview: '',
    placesToVisitAround: [{ title: '', desc: '' }],
    thingsToDo: [{ title: '', desc: '' }],
    mustTryFood: [{ title: '', desc: '' }],
    cultureAndNature: '',
    localAttractions: [{ title: '', desc: '' }],
    shoppingSightseeing: [{ title: '', desc: '' }],
    bestTimeToVisit: '',
    faqs: [{ q: '', a: '' }],
    relatedTrips: [],
  });
  
  const [tripsList, setTripsList] = useState([]);

  useEffect(() => {
    fetchDestinations();
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const { data } = await getTrips();
      setTripsList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDestinations = async () => {
    try {
      const { data } = await getDestinations();
      setDestinations(data);
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

  const handleTripToggle = (tripId) => {
    const newRelated = formData.relatedTrips.includes(tripId)
      ? formData.relatedTrips.filter(id => id !== tripId)
      : [...formData.relatedTrips, tripId];
    setFormData({ ...formData, relatedTrips: newRelated });
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
    if (!formData.image) {
      alert("Please wait for the image to upload or select an image.");
      return;
    }
    setLoading(true);
    try {
      await createAttraction(formData);
      alert('Attraction added successfully!');
      navigate('/admin/attractions');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to add attraction');
    } finally {
      setLoading(false);
    }
  };

  const renderArrayField = (fieldLabel, fieldName) => (
    <div className={styles.sectionGroup}>
      <h3 className={styles.sectionTitle}>{fieldLabel}</h3>
      {formData[fieldName].map((item, index) => (
        <div key={index} className={styles.arrayItem}>
          <input
            type="text"
            placeholder="Title"
            value={item.title}
            onChange={(e) => handleArrayChange(e, index, fieldName, 'title')}
            className={styles.input}
          />
          <textarea
            placeholder="Description"
            value={item.desc}
            onChange={(e) => handleArrayChange(e, index, fieldName, 'desc')}
            className={styles.textarea}
            rows="2"
          />
          {formData[fieldName].length > 1 && (
            <button type="button" onClick={() => removeArrayItem(index, fieldName)} className={styles.removeBtn}>
              Remove
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => addArrayItem(fieldName)} className={styles.addMoreBtn}>
        + Add {fieldLabel} Item
      </button>
    </div>
  );

  const renderFaqField = () => (
    <div className={styles.sectionGroup}>
      <h3 className={styles.sectionTitle}>FAQs</h3>
      {formData.faqs.map((item, index) => (
        <div key={index} className={styles.arrayItem}>
          <input
            type="text"
            placeholder="Question"
            value={item.q}
            onChange={(e) => handleArrayChange(e, index, 'faqs', 'q')}
            className={styles.input}
          />
          <textarea
            placeholder="Answer"
            value={item.a}
            onChange={(e) => handleArrayChange(e, index, 'faqs', 'a')}
            className={styles.textarea}
            rows="2"
          />
          {formData.faqs.length > 1 && (
            <button type="button" onClick={() => removeArrayItem(index, 'faqs')} className={styles.removeBtn}>
              Remove
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => addArrayItem('faqs', true)} className={styles.addMoreBtn}>
        + Add FAQ
      </button>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Add New Attraction</h2>
        <button className={styles.backBtn} onClick={() => navigate('/admin/attractions')}>Back</button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.topGrid}>
          <div className={styles.inputGroup}>
            <label>Attraction Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required className={styles.input} />
          </div>

          <div className={styles.inputGroup}>
            <label>Slug</label>
            <input type="text" name="slug" value={formData.slug} onChange={handleChange} required className={styles.input} />
          </div>

          <div className={styles.inputGroup}>
            <label>Destination</label>
            <select name="destination" value={formData.destination} onChange={handleChange} required className={styles.input}>
              <option value="">Select Destination</option>
              {destinations.map(d => (
                <option key={d._id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Select Package (Shown in Attraction)</label>
            <select 
              value={formData.relatedTrips[0] || ""} 
              onChange={(e) => setFormData({...formData, relatedTrips: e.target.value ? [e.target.value] : []})} 
              className={styles.input}
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
            {!formData.destination && <small style={{color: '#888', marginTop: '5px'}}>Please select a destination first to see available packages.</small>}
          </div>

          <div className={styles.inputGroup}>
            <label>Hero Image</label>
            <input type="file" onChange={handleImageUpload} accept="image/*" className={styles.input} />
            {uploadingImage && <p style={{color: 'blue'}}>Uploading image, please wait...</p>}
            {formData.image && <img src={formData.image?.startsWith('http') ? formData.image : `${import.meta.env.VITE_BACKEND_URL}${formData.image}`} alt="Preview" className={styles.previewImage} />}
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Overview</label>
          <textarea name="overview" value={formData.overview} onChange={handleChange} required rows="3" className={styles.textarea} />
        </div>

        {renderArrayField('Places to Visit Around', 'placesToVisitAround')}
        {renderArrayField('Things to Do', 'thingsToDo')}
        {renderArrayField('Must-Try Food Dishes', 'mustTryFood')}
        
        <div className={styles.sectionGroup}>
          <h3 className={styles.sectionTitle}>Culture and Nature</h3>
          <textarea name="cultureAndNature" value={formData.cultureAndNature} onChange={handleChange} rows="2" className={styles.textarea} />
        </div>

        {renderArrayField('Local Attractions', 'localAttractions')}
        {renderArrayField('Shopping & Sightseeing', 'shoppingSightseeing')}

        <div className={styles.sectionGroup}>
          <h3 className={styles.sectionTitle}>Best Time to Visit</h3>
          <textarea name="bestTimeToVisit" value={formData.bestTimeToVisit} onChange={handleChange} rows="2" className={styles.textarea} />
        </div>
        
        {renderFaqField()}

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitBtn} disabled={loading || uploadingImage}>
            {loading ? 'Saving...' : 'Save Attraction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAttraction;

