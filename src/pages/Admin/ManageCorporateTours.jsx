import React, { useState, useEffect } from 'react';
import { getSiteSettings, updateSiteSettings, uploadFile } from '../../services/api';
import styles from './Admin.module.css';
import Loader from '../../components/Loader/Loader';

const ManageCorporateTours = () => {
  const [settingsData, setSettingsData] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getSiteSettings();
      setSettingsData(res.data);
      const ct = res.data.corporateTours || {};
      setData({
        heroTitle: ct.heroTitle || '',
        heroSubtitle: ct.heroSubtitle || '',
        heroImage: ct.heroImage || '',
        statsTitle: ct.statsTitle || '',
        statsText: ct.statsText || '',
        stats: ct.stats || [],
        featuresTitle: ct.featuresTitle || '',
        featuresText: ct.featuresText || '',
        features: ct.features || [],
        offeringsTitle: ct.offeringsTitle || '',
        offeringsText: ct.offeringsText || '',
        offerings: ct.offerings || [],
        galleryTitle: ct.galleryTitle || '',
        galleryText: ct.galleryText || '',
        galleryImages: ct.galleryImages || [],
        videoUrl: ct.videoUrl || '',
        stepsTitle: ct.stepsTitle || '',
        stepsText: ct.stepsText || '',
        steps: ct.steps || [],
        testimonialsTitle: ct.testimonialsTitle || '',
        testimonials: ct.testimonials || [],
        formTitle: ct.formTitle || '',
        formText: ct.formText || '',
        contactPhone: ct.contactPhone || '+91 98980 36338\n+91 98985 54465',
        contactWhatsapp: ct.contactWhatsapp || '+91 98985 54465',
        contactEmail: ct.contactEmail || 'info@dreamridersmototouring.com',
        contactLocation: ct.contactLocation || 'Ahmedabad, Gujarat, India',
        formPoints: ct.formPoints || []
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...settingsData, corporateTours: data };
      await updateSiteSettings(payload);
      alert('Corporate Tours settings saved successfully!');
    } catch (error) {
      alert('Error saving settings');
    }
  };

  const handleChange = (field, value) => {
    setData({ ...data, [field]: value });
  };

  const handleUploadImage = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadFile(file);
      const url = res.data.url.startsWith('http') ? res.data.url : `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      handleChange(field, url);
    } catch (err) {
      alert('Upload failed');
    }
  };

  const ArrayEditor = ({ title, field, template }) => {
    const arr = data[field] || [];
    const updateItem = (i, k, v) => {
      const newArr = [...arr];
      newArr[i] = { ...newArr[i], [k]: v };
      handleChange(field, newArr);
    };
    const removeItem = (i) => {
      handleChange(field, arr.filter((_, idx) => idx !== i));
    };
    const addItem = () => {
      handleChange(field, [...arr, template]);
    };
    
    return (
      <div className={styles.card} style={{ marginBottom: '20px' }}>
        <h4 className={styles.cardTitle}>{title}</h4>
        {arr.map((item, i) => (
          <div key={i} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
            {Object.keys(template).map(k => (
              <div key={k} style={{ marginBottom: '5px' }}>
                <label style={{ fontSize: '0.8rem', display: 'block', textTransform: 'capitalize' }}>{k}</label>
                {k === 'image' || k === 'icon' ? (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input value={item[k] || ''} onChange={(e) => updateItem(i, k, e.target.value)} className={styles.inputField} style={{ flex: 1 }} />
                    <label className={styles.btnSecondary} style={{ cursor: 'pointer', padding: '8px' }}>
                      Upload
                      <input type="file" style={{ display: 'none' }} accept="image/*" onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const res = await uploadFile(file);
                        const url = res.data.url.startsWith('http') ? res.data.url : `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
                        updateItem(i, k, url);
                      }} />
                    </label>
                  </div>
                ) : (
                  <input value={item[k] || ''} onChange={(e) => updateItem(i, k, e.target.value)} className={styles.inputField} style={{ width: '100%' }} />
                )}
              </div>
            ))}
            <button type="button" onClick={() => removeItem(i)} className={styles.btnDanger} style={{ marginTop: '5px' }}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addItem} className={styles.btnSecondary}>Add Item</button>
      </div>
    );
  };

  const StringArrayEditor = ({ title, field }) => {
    const arr = data[field] || [];
    const updateItem = (i, v) => {
      const newArr = [...arr];
      newArr[i] = v;
      handleChange(field, newArr);
    };
    const removeItem = (i) => {
      handleChange(field, arr.filter((_, idx) => idx !== i));
    };
    const addItem = () => {
      handleChange(field, [...arr, '']);
    };
    
    return (
      <div className={styles.card} style={{ marginBottom: '20px' }}>
        <h4 className={styles.cardTitle}>{title}</h4>
        {arr.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
            <input value={item} onChange={(e) => updateItem(i, e.target.value)} className={styles.inputField} style={{ flex: 1 }} />
            <label className={styles.btnSecondary} style={{ cursor: 'pointer', padding: '8px' }}>
              Upload
              <input type="file" style={{ display: 'none' }} accept="image/*" onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const res = await uploadFile(file);
                const url = res.data.url.startsWith('http') ? res.data.url : `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
                updateItem(i, url);
              }} />
            </label>
            <button type="button" onClick={() => removeItem(i)} className={styles.btnDanger}>X</button>
          </div>
        ))}
        <button type="button" onClick={addItem} className={styles.btnSecondary}>Add Image</button>
      </div>
    );
  };

  if (loading || !data) return <Loader fullScreen={false} />;

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Manage Corporate Tours Page</h2>
        <button onClick={handleSave} className={styles.btnPrimary}>Save Changes</button>
      </div>
      
      <div className={styles.formContainer}>
        {/* HERO */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Hero Section</h3>
          <div className={styles.formGroup}>
            <label>Hero Title</label>
            <input value={data.heroTitle} onChange={(e) => handleChange('heroTitle', e.target.value)} className={styles.inputField} />
          </div>
          <div className={styles.formGroup}>
            <label>Hero Subtitle</label>
            <input value={data.heroSubtitle} onChange={(e) => handleChange('heroSubtitle', e.target.value)} className={styles.inputField} />
          </div>
          <div className={styles.formGroup}>
            <label>Hero Image URL</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input value={data.heroImage} onChange={(e) => handleChange('heroImage', e.target.value)} className={styles.inputField} style={{ flex: 1 }} />
              <label className={styles.btnSecondary} style={{ cursor: 'pointer', padding: '10px' }}>
                Upload Image
                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleUploadImage(e, 'heroImage')} />
              </label>
            </div>
            {data.heroImage && <img src={data.heroImage} alt="Hero" style={{ height: '100px', marginTop: '10px', objectFit: 'cover' }} />}
          </div>
        </div>

        {/* STATS */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Stats Section</h3>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input value={data.statsTitle} onChange={(e) => handleChange('statsTitle', e.target.value)} className={styles.inputField} />
          </div>
          <div className={styles.formGroup}>
            <label>Text</label>
            <textarea value={data.statsText} onChange={(e) => handleChange('statsText', e.target.value)} className={styles.inputField} rows={3} />
          </div>
          <ArrayEditor title="Stats Items" field="stats" template={{ number: '', label: '' }} />
        </div>

        {/* FEATURES */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Features Section</h3>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input value={data.featuresTitle} onChange={(e) => handleChange('featuresTitle', e.target.value)} className={styles.inputField} />
          </div>
          <div className={styles.formGroup}>
            <label>Text</label>
            <textarea value={data.featuresText} onChange={(e) => handleChange('featuresText', e.target.value)} className={styles.inputField} rows={3} />
          </div>
          <ArrayEditor title="Feature Items" field="features" template={{ title: '', text: '', icon: '' }} />
        </div>

        {/* OFFERINGS */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Offerings Section</h3>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input value={data.offeringsTitle} onChange={(e) => handleChange('offeringsTitle', e.target.value)} className={styles.inputField} />
          </div>
          <div className={styles.formGroup}>
            <label>Text</label>
            <textarea value={data.offeringsText} onChange={(e) => handleChange('offeringsText', e.target.value)} className={styles.inputField} rows={3} />
          </div>
          <ArrayEditor title="Offering Items" field="offerings" template={{ title: '', text: '', image: '' }} />
        </div>

        {/* GALLERY */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Gallery Section</h3>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input value={data.galleryTitle} onChange={(e) => handleChange('galleryTitle', e.target.value)} className={styles.inputField} />
          </div>
          <div className={styles.formGroup}>
            <label>Text</label>
            <textarea value={data.galleryText} onChange={(e) => handleChange('galleryText', e.target.value)} className={styles.inputField} rows={3} />
          </div>
          <StringArrayEditor title="Gallery Images" field="galleryImages" />
        </div>

        {/* VIDEO */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Video Section</h3>
          <div className={styles.formGroup}>
            <label>YouTube Embed URL</label>
            <input value={data.videoUrl} onChange={(e) => handleChange('videoUrl', e.target.value)} className={styles.inputField} placeholder="https://www.youtube.com/embed/..." />
          </div>
        </div>

        {/* STEPS */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Steps Section</h3>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input value={data.stepsTitle} onChange={(e) => handleChange('stepsTitle', e.target.value)} className={styles.inputField} />
          </div>
          <div className={styles.formGroup}>
            <label>Text</label>
            <textarea value={data.stepsText} onChange={(e) => handleChange('stepsText', e.target.value)} className={styles.inputField} rows={3} />
          </div>
          <ArrayEditor title="Steps" field="steps" template={{ title: '', text: '' }} />
        </div>

        {/* TESTIMONIALS */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Testimonials Section</h3>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input value={data.testimonialsTitle} onChange={(e) => handleChange('testimonialsTitle', e.target.value)} className={styles.inputField} />
          </div>
          <ArrayEditor title="Testimonial Items" field="testimonials" template={{ text: '', name: '', designation: '' }} />
        </div>

        {/* FORM */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Contact Form Section</h3>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input value={data.formTitle} onChange={(e) => handleChange('formTitle', e.target.value)} className={styles.inputField} />
          </div>
          <div className={styles.formGroup}>
            <label>Text</label>
            <textarea value={data.formText} onChange={(e) => handleChange('formText', e.target.value)} className={styles.inputField} rows={3} />
          </div>
          <div className={styles.formGroup}>
            <label>Contact Phone (Supports multiple lines)</label>
            <textarea value={data.contactPhone} onChange={(e) => handleChange('contactPhone', e.target.value)} className={styles.inputField} rows={2} />
          </div>
          <div className={styles.formGroup}>
            <label>Contact WhatsApp</label>
            <input value={data.contactWhatsapp} onChange={(e) => handleChange('contactWhatsapp', e.target.value)} className={styles.inputField} />
          </div>
          <div className={styles.formGroup}>
            <label>Contact Email</label>
            <input value={data.contactEmail} onChange={(e) => handleChange('contactEmail', e.target.value)} className={styles.inputField} />
          </div>
          <div className={styles.formGroup}>
            <label>Contact Location</label>
            <input value={data.contactLocation} onChange={(e) => handleChange('contactLocation', e.target.value)} className={styles.inputField} />
          </div>
          <ArrayEditor title="Form Bullet Points (Not used in current design)" field="formPoints" template={{ text: '' }} />
        </div>
      </div>
    </div>
  );
};

export default ManageCorporateTours;
