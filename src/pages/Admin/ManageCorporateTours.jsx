import React, { useState, useEffect } from 'react';
import { getSiteSettings, updateSiteSettings, uploadFile, getEnquiries, deleteEnquiry } from '../../services/api';
import styles from './Admin.module.css';
import Loader from '../../components/Loader/Loader';
import { FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ManageCorporateTours = () => {
  const [settingsData, setSettingsData] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, enqRes] = await Promise.all([
        getSiteSettings(),
        getEnquiries()
      ]);
      const resData = settingsRes.data || {};
      setSettingsData(resData);
      
      const allEnq = enqRes.data || [];
      const corporateEnq = allEnq.filter(e => e.tripTitle === 'Corporate Tour Enquiry');
      setEnquiries(corporateEnq);
      
      const ct = resData.corporateTours || {};
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
      toast.success('Corporate Tours settings saved successfully!');
    } catch (error) {
      toast.error('Error saving settings');
    }
  };

  const handleDeleteEnquiry = async (id) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      try {
        await deleteEnquiry(id);
        setEnquiries(enquiries.filter(e => e._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;
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
        <button onClick={() => setIsEditModalOpen(true)} className={styles.btnPrimary}>Edit Corporate Details</button>
      </div>
      
      {isEditModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ background: '#f8fafc', borderRadius: '12px', width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Edit Corporate Tours Page</h3>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: '#64748b', lineHeight: 1 }}>&times;</button>
            </div>
            
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
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
            <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '15px', backgroundColor: '#fff' }}>
              <button onClick={() => setIsEditModalOpen(false)} style={{ padding: '10px 20px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>Cancel</button>
              <button onClick={(e) => { handleSave(e); setIsEditModalOpen(false); }} className={styles.btnPrimary}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ENQUIRIES TABLE */}
        <div className={styles.card} style={{ marginTop: '40px' }}>
          <h3 className={styles.cardTitle}>Corporate Enquiries</h3>
          {enquiries.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No corporate enquiries found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                    <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Date</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Name</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Phone</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Company</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Trip Type & Dest</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Team Size & Budget</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Message</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map((enq) => (
                    <tr key={enq._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td data-label="Date">{formatDate(enq.createdAt)}</td>
                      <td data-label="Name" style={{fontWeight:"600"}}>{enq.name}<br/><small>{enq.email}</small></td>
                      <td data-label="Phone">{enq.phone}</td>
                      <td data-label="Company">{enq.companyName || '-'}</td>
                      <td data-label="Trip Type & Dest">
                        <div>{enq.tripType || '-'}</div>
                        <div style={{fontSize: '0.85em', color: '#64748b'}}>{enq.destination || '-'}</div>
                      </td>
                      <td data-label="Team Size & Budget">
                        <div>{enq.teamSize || '-'}</div>
                        <div style={{fontSize: '0.85em', color: '#64748b'}}>{enq.budget || '-'}</div>
                      </td>
                      <td data-label="Message">{enq.message}</td>
                      <td data-label="Actions">
                        <button onClick={() => handleDeleteEnquiry(enq._id)} className={styles.btnDanger} style={{ padding: '6px' }}>
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </div>
  );
};

export default ManageCorporateTours;
