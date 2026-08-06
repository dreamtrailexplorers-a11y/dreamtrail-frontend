import React, { useState, useEffect, useRef } from 'react';
import { getSiteSettings, updateSiteSettings, uploadFile } from '../../services/api';
import styles from './Admin.module.css';

const StringArrayInput = ({ title, data = [], onChange }) => {
  const fileInputRef = useRef(null);

  const handleRemove = (index) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleChange = (index, val) => {
    const newData = [...data];
    newData[index] = val;
    onChange(newData);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadFile(file);
      const fullUrl = res.data.url.startsWith('http') ? res.data.url : `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      onChange([...data, fullUrl]);
    } catch (err) {
      alert('Upload failed');
    }
  };

  return (
    <div className={styles.card} style={{ marginTop: '20px', padding: '15px', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
      <h4 className={styles.cardTitle} style={{ fontSize: '1rem', display: 'flex', justifyContent: 'space-between', borderBottom: 'none', paddingBottom: '0' }}>
        {title}
        <div>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*,video/*" onChange={handleUpload} />
          <button type="button" onClick={() => fileInputRef.current.click()} className={styles.btnPrimary} style={{ fontSize: '0.8rem', padding: '4px 8px' }}>Upload File</button>
        </div>
      </h4>
      {data.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: '5px', marginBottom: '5px', marginTop: '10px' }}>
          <input value={item} onChange={(e) => handleChange(i, e.target.value)} className={styles.inputField} style={{ flex: 1, padding: '8px' }} />
          <button type="button" onClick={() => handleRemove(i)} className={styles.btnDanger} style={{ padding: '0 10px' }}>X</button>
        </div>
      ))}
    </div>
  );
};

const ManageSiteSettings = () => {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await getSiteSettings();
      setFormData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSectionSubmit = async (e, keysToSave, sectionName) => {
    e.preventDefault();
    try {
      const payload = {};
      keysToSave.forEach(key => {
        if (formData[key] !== undefined) {
          payload[key] = formData[key];
        }
      });
      await updateSiteSettings(payload);
      alert(`${sectionName} saved successfully!`);
    } catch (err) {
      console.error(err);
      alert(`Failed to save ${sectionName}`);
    }
  };

  const handleSingleUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadFile(file);
      const fullUrl = res.data.url.startsWith('http') ? res.data.url : `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      setFormData({ ...formData, [fieldName]: fullUrl });
    } catch (err) {
      alert('Upload failed');
    }
  };

  const handleBannerArrayChange = (index, field, value) => {
    const newBanners = [...(formData.groupTripBanners || [])];
    newBanners[index] = { ...newBanners[index], [field]: value };
    setFormData({ ...formData, groupTripBanners: newBanners });
  };

  const addBanner = () => {
    const newBanners = [...(formData.groupTripBanners || []), { image: '', title: '', subtitle: '', pillText: '' }];
    setFormData({ ...formData, groupTripBanners: newBanners });
  };

  const removeBanner = (index) => {
    const newBanners = (formData.groupTripBanners || []).filter((_, i) => i !== index);
    setFormData({ ...formData, groupTripBanners: newBanners });
  };

  
  const handleAboutIntroImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadFile(file);
      const fullUrl = res.data.url.startsWith('http') ? res.data.url : `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      const currentImages = formData.aboutPage?.introImages || [];
      setFormData({
        ...formData,
        aboutPage: { ...(formData.aboutPage || {}), introImages: [...currentImages, fullUrl] }
      });
    } catch (err) {
      console.error('Failed to upload image', err);
      alert('Failed to upload image.');
    }
  };

  const removeAboutIntroImage = (idx) => {
    const currentImages = formData.aboutPage?.introImages || [];
    setFormData({
      ...formData,
      aboutPage: { ...(formData.aboutPage || {}), introImages: currentImages.filter((_, i) => i !== idx) }
    });
  };

  const handleAboutNestedChange = (e, section) => {
    setFormData({
      ...formData,
      [section]: {
        ...(formData[section] || {}),
        [e.target.name]: e.target.value
      }
    });
  };

  const handleAboutImageUpload = async (e, section, field) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadFile(file);
      const fullUrl = res.data.url.startsWith('http') ? res.data.url : `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      setFormData({
        ...formData,
        [section]: {
          ...(formData[section] || {}),
          [field]: fullUrl
        }
      });
    } catch (err) {
      console.error('Failed to upload image', err);
      alert('Failed to upload image.');
    }
  };

  const handleAboutPointsChange = (index, field, value, section, arrayField) => {
    const newPoints = [...(formData[section]?.[arrayField] || [])];
    newPoints[index] = { ...newPoints[index], [field]: value };
    setFormData({
      ...formData,
      [section]: { ...(formData[section] || {}), [arrayField]: newPoints }
    });
  };

  const addAboutPoint = (section, arrayField) => {
    const newPoints = [...(formData[section]?.[arrayField] || []), { icon: '', text: '' }];
    setFormData({
      ...formData,
      [section]: { ...(formData[section] || {}), [arrayField]: newPoints }
    });
  };

  const removeAboutPoint = (index, section, arrayField) => {
    const newPoints = (formData[section]?.[arrayField] || []).filter((_, i) => i !== index);
    setFormData({
      ...formData,
      [section]: { ...(formData[section] || {}), [arrayField]: newPoints }
    });
  };
  const handleBannerUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadFile(file);
      const fullUrl = res.data.url.startsWith('http') ? res.data.url : `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      handleBannerArrayChange(index, 'image', fullUrl);
    } catch (err) {
      alert('Upload failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!formData) return <div>No settings found</div>;

  return (
    <div>
      <h2 className={styles.pageHeader}>Manage Site Settings</h2>
      
      {/* 1. Hero Section */}
      <form onSubmit={(e) => handleSectionSubmit(e, ['heroHeading', 'heroImages'], 'Hero Section')} className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Hero Section</h3>
          <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.inputLabel}>Hero Heading</label>
            <textarea name="heroHeading" value={formData.heroHeading || ''} onChange={handleChange} className={styles.textareaField} rows="2" />
          </div>
        </div>
        <StringArrayInput title="Hero Background Images (Slider)" data={formData.heroImages || []} onChange={(d) => setFormData({...formData, heroImages: d})} />
      </form>

      {/* 2. Promotional Banners */}
      <form onSubmit={(e) => handleSectionSubmit(e, ['bannerVideoUrl', 'bannerVideoTitle', 'bannerVideoSubtitle', 'groupTripBanners'], 'Promotional Banners')} className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Promotional Banners</h3>
          <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.inputLabel} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              Video Banner URL
              <label style={{ cursor: 'pointer', backgroundColor: '#3b82f6', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                Upload Video
                <input type="file" style={{ display: 'none' }} accept="video/*" onChange={(e) => handleSingleUpload(e, 'bannerVideoUrl')} />
              </label>
            </label>
            <input name="bannerVideoUrl" value={formData.bannerVideoUrl || ''} onChange={handleChange} className={styles.inputField} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Video Banner Title</label>
            <input name="bannerVideoTitle" value={formData.bannerVideoTitle || ''} onChange={handleChange} className={styles.inputField} placeholder="e.g. Ladakh" />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Video Banner Subtitle</label>
            <input name="bannerVideoSubtitle" value={formData.bannerVideoSubtitle || ''} onChange={handleChange} className={styles.inputField} placeholder="e.g. Uncharted Expeditions" />
          </div>
          
          {/* Divider */}
          <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#e2e8f0', margin: '20px 0' }}></div>
          
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1a1a1a' }}>Group Trip Banners (Slider)</h4>
            <button type="button" onClick={addBanner} className={styles.btnSecondary} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>+ Add Banner</button>
          </div>

          {(formData.groupTripBanners || []).map((banner, index) => (
            <div key={index} style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#64748b' }}>Banner #{index + 1}</span>
                <button type="button" onClick={() => removeBanner(index)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Remove</button>
              </div>
              <div className={styles.formGrid} style={{ gap: '15px' }}>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1', margin: 0 }}>
                  <label className={styles.inputLabel} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    Image URL
                    <label style={{ cursor: 'pointer', backgroundColor: '#3b82f6', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      Upload Photo
                      <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleBannerUpload(e, index)} />
                    </label>
                  </label>
                  <input value={banner.image || ''} onChange={(e) => handleBannerArrayChange(index, 'image', e.target.value)} className={styles.inputField} />
                </div>
                <div className={styles.inputGroup} style={{ margin: 0 }}>
                  <label className={styles.inputLabel}>Subtitle (Small Top)</label>
                  <input value={banner.subtitle || ''} onChange={(e) => handleBannerArrayChange(index, 'subtitle', e.target.value)} className={styles.inputField} placeholder="e.g. It's time for" />
                </div>
                <div className={styles.inputGroup} style={{ margin: 0 }}>
                  <label className={styles.inputLabel}>Title (Big Bold)</label>
                  <input value={banner.title || ''} onChange={(e) => handleBannerArrayChange(index, 'title', e.target.value)} className={styles.inputField} placeholder="e.g. Group Trips" />
                </div>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1', margin: 0 }}>
                  <label className={styles.inputLabel}>Pill Text (Bottom)</label>
                  <input value={banner.pillText || ''} onChange={(e) => handleBannerArrayChange(index, 'pillText', e.target.value)} className={styles.inputField} placeholder="e.g. Join solo or bring your buddy" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </form>

      {/* 3. Contact Info */}
      <form onSubmit={(e) => handleSectionSubmit(e, ['address', 'phone', 'email', 'whatsappNumber'], 'Contact Info')} className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Contact Info</h3>
          <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Address</label>
            <textarea name="address" value={formData.address || ''} onChange={handleChange} className={styles.textareaField} rows="2" />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Phone</label>
            <input name="phone" value={formData.phone || ''} onChange={handleChange} className={styles.inputField} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Email</label>
            <input name="email" value={formData.email || ''} onChange={handleChange} className={styles.inputField} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Whatsapp Number</label>
            <input name="whatsappNumber" value={formData.whatsappNumber || ''} onChange={handleChange} className={styles.inputField} placeholder="e.g. 9099599331" />
          </div>
        </div>
      </form>

      {/* 4. Social Media Links */}
      <form onSubmit={(e) => handleSectionSubmit(e, ['instagram', 'facebook', 'linkedin', 'whatsapp'], 'Social Media Links')} className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Social Media Links</h3>
          <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
        </div>
        <div className={styles.formGrid}>
          {['instagram', 'facebook', 'linkedin', 'whatsapp'].map(platform => (
            <div key={platform} className={styles.inputGroup}>
              <label className={styles.inputLabel} style={{ textTransform: 'capitalize' }}>{platform}</label>
              <input name={platform} value={formData[platform] || ''} onChange={handleChange} className={styles.inputField} />
            </div>
          ))}
        </div>
      </form>

      {/* 5. Footer */}
      <form onSubmit={(e) => handleSectionSubmit(e, ['copyrightText'], 'Footer')} className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Footer</h3>
          <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.inputLabel}>Copyright Text</label>
            <input name="copyrightText" value={formData.copyrightText || ''} onChange={handleChange} className={styles.inputField} />
          </div>
        </div>
      </form>

      {/* 6. Razorpay Integration */}
      <form onSubmit={(e) => handleSectionSubmit(e, ['razorpayKeyId', 'razorpayKeySecret'], 'Razorpay Integration')} className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Razorpay Integration</h3>
          <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Razorpay Key ID</label>
            <input name="razorpayKeyId" value={formData.razorpayKeyId || ''} onChange={handleChange} className={styles.inputField} placeholder="e.g. rzp_test_..." />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Razorpay Key Secret</label>
            <input name="razorpayKeySecret" type="password" value={formData.razorpayKeySecret || ''} onChange={handleChange} className={styles.inputField} placeholder="Enter your secret key" />
          </div>
        </div>
      </form>

      
      {/* 7. About Us Page Settings */}
      <form onSubmit={(e) => handleSectionSubmit(e, ['aboutPage'], 'About Us Page')} className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>About Us Page</h3>
          <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
        </div>
        
        {/* Hero Section */}
        <h4 style={{marginTop: '20px', marginBottom: '10px', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px'}}>Hero Section</h4>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.inputLabel} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              Hero Image
              <label className={styles.btnSecondary} style={{ cursor: 'pointer', padding: '4px 10px', fontSize: '0.75rem' }}>
                Upload Image
                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleAboutImageUpload(e, 'aboutPage', 'heroImage')} />
              </label>
            </label>
            <input name="heroImage" value={formData.aboutPage?.heroImage || ''} onChange={(e) => handleAboutNestedChange(e, 'aboutPage')} className={styles.inputField} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Hero Title</label>
            <input name="heroTitle" value={formData.aboutPage?.heroTitle || ''} onChange={(e) => handleAboutNestedChange(e, 'aboutPage')} className={styles.inputField} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Hero Subtitle</label>
            <input name="heroSubtitle" value={formData.aboutPage?.heroSubtitle || ''} onChange={(e) => handleAboutNestedChange(e, 'aboutPage')} className={styles.inputField} />
          </div>
        </div>

        {/* Intro Section */}
        <h4 style={{marginTop: '20px', marginBottom: '10px', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px'}}>Intro Section</h4>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Intro Title 1</label>
            <input name="introTitle1" value={formData.aboutPage?.introTitle1 || ''} onChange={(e) => handleAboutNestedChange(e, 'aboutPage')} className={styles.inputField} />
          </div>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.inputLabel}>Intro Text 1</label>
            <textarea name="introText1" value={formData.aboutPage?.introText1 || ''} onChange={(e) => handleAboutNestedChange(e, 'aboutPage')} className={styles.textareaField} rows="3" />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Intro Title 2</label>
            <input name="introTitle2" value={formData.aboutPage?.introTitle2 || ''} onChange={(e) => handleAboutNestedChange(e, 'aboutPage')} className={styles.inputField} />
          </div>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.inputLabel}>Intro Text 2</label>
            <textarea name="introText2" value={formData.aboutPage?.introText2 || ''} onChange={(e) => handleAboutNestedChange(e, 'aboutPage')} className={styles.textareaField} rows="3" />
          </div>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.inputLabel} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              Collage Images
              <label className={styles.btnSecondary} style={{ cursor: 'pointer', padding: '4px 10px', fontSize: '0.75rem' }}>
                Upload Image
                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleAboutIntroImageUpload} />
              </label>
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
              {(formData.aboutPage?.introImages || []).map((img, idx) => (
                <div key={idx} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removeAboutIntroImage(idx)} className={styles.btnDanger} style={{ position: 'absolute', top: 0, right: 0, padding: '2px 6px', fontSize: '0.75rem' }}>X</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Story Section */}
        <h4 style={{marginTop: '20px', marginBottom: '10px', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px'}}>Our Story Section</h4>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.inputLabel} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              Story Image
              <label className={styles.btnSecondary} style={{ cursor: 'pointer', padding: '4px 10px', fontSize: '0.75rem' }}>
                Upload Image
                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleAboutImageUpload(e, 'aboutPage', 'storyImage')} />
              </label>
            </label>
            <input name="storyImage" value={formData.aboutPage?.storyImage || ''} onChange={(e) => handleAboutNestedChange(e, 'aboutPage')} className={styles.inputField} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Story Title</label>
            <input name="storyTitle" value={formData.aboutPage?.storyTitle || ''} onChange={(e) => handleAboutNestedChange(e, 'aboutPage')} className={styles.inputField} />
          </div>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.inputLabel}>Story Text</label>
            <textarea name="storyText" value={formData.aboutPage?.storyText || ''} onChange={(e) => handleAboutNestedChange(e, 'aboutPage')} className={styles.textareaField} rows="4" />
          </div>
        </div>

        {/* Community Section */}
        <h4 style={{marginTop: '20px', marginBottom: '10px', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px'}}>Community & Features</h4>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Community Title</label>
            <input name="communityTitle" value={formData.aboutPage?.communityTitle || ''} onChange={(e) => handleAboutNestedChange(e, 'aboutPage')} className={styles.inputField} />
          </div>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.inputLabel}>Community Text</label>
            <textarea name="communityText" value={formData.aboutPage?.communityText || ''} onChange={(e) => handleAboutNestedChange(e, 'aboutPage')} className={styles.textareaField} rows="3" />
          </div>
          
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1', borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label className={styles.inputLabel} style={{ margin: 0 }}>Community Points (Grid Items)</label>
              <button type="button" onClick={() => addAboutPoint('aboutPage', 'communityPoints')} className={styles.btnSecondary} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>+ Add Point</button>
            </div>
            {(formData.aboutPage?.communityPoints || []).map((point, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                <input 
                  placeholder="Point Text (e.g. Safe & Secure)" 
                  value={point.text || ''} 
                  onChange={(e) => handleAboutPointsChange(index, 'text', e.target.value, 'aboutPage', 'communityPoints')} 
                  className={styles.inputField} 
                />
                <button type="button" onClick={() => removeAboutPoint(index, 'aboutPage', 'communityPoints')} className={styles.btnDanger} style={{ padding: '8px 12px' }}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      </form>

      {/* 8. About Us Snippet (Home Page) */}
      <form onSubmit={(e) => handleSectionSubmit(e, ['aboutSnippet'], 'About Snippet')} className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>About Snippet (Homepage)</h3>
          <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Snippet Title</label>
            <input name="title" value={formData.aboutSnippet?.title || ''} onChange={(e) => handleAboutNestedChange(e, 'aboutSnippet')} className={styles.inputField} />
          </div>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.inputLabel}>Snippet Text</label>
            <textarea name="text" value={formData.aboutSnippet?.text || ''} onChange={(e) => handleAboutNestedChange(e, 'aboutSnippet')} className={styles.textareaField} rows="4" />
          </div>
          
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1', borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label className={styles.inputLabel} style={{ margin: 0 }}>Snippet Points</label>
              <button type="button" onClick={() => addAboutPoint('aboutSnippet', 'points')} className={styles.btnSecondary} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>+ Add Point</button>
            </div>
            {(formData.aboutSnippet?.points || []).map((point, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                <input 
                  placeholder="Icon Class (e.g. FiStar) or keep empty" 
                  value={point.icon || ''} 
                  onChange={(e) => handleAboutPointsChange(index, 'icon', e.target.value, 'aboutSnippet', 'points')} 
                  className={styles.inputField} 
                  style={{ width: '150px' }}
                />
                <input 
                  placeholder="Point Text (e.g. 17+ Years Experience)" 
                  value={point.text || ''} 
                  onChange={(e) => handleAboutPointsChange(index, 'text', e.target.value, 'aboutSnippet', 'points')} 
                  className={styles.inputField} 
                />
                <button type="button" onClick={() => removeAboutPoint(index, 'aboutSnippet', 'points')} className={styles.btnDanger} style={{ padding: '8px 12px' }}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      </form>


      {/* 8. Careers Content */}
      <form onSubmit={(e) => handleSectionSubmit(e, ['careersContent'], 'Careers Content')} className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Careers Content</h3>
          <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <textarea name="careersContent" value={formData.careersContent || ''} onChange={handleChange} className={styles.textareaField} rows="4" placeholder="Use plain text or basic HTML..." />
          </div>
        </div>
      </form>

      {/* 9. Contact Us Content */}
      <form onSubmit={(e) => handleSectionSubmit(e, ['contactUsContent'], 'Contact Us Content')} className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Contact Us Content</h3>
          <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <textarea name="contactUsContent" value={formData.contactUsContent || ''} onChange={handleChange} className={styles.textareaField} rows="4" placeholder="Use plain text or basic HTML..." />
          </div>
        </div>
      </form>

      {/* 10. Terms & Conditions Content */}
      <form onSubmit={(e) => handleSectionSubmit(e, ['termsContent'], 'Terms & Conditions Content')} className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Terms & Conditions Content</h3>
          <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <textarea name="termsContent" value={formData.termsContent || ''} onChange={handleChange} className={styles.textareaField} rows="4" placeholder="Use plain text or basic HTML..." />
          </div>
        </div>
      </form>

      {/* 11. Privacy Policy Content */}
      <form onSubmit={(e) => handleSectionSubmit(e, ['privacyPolicyContent'], 'Privacy Policy Content')} className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Privacy Policy Content</h3>
          <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <textarea name="privacyPolicyContent" value={formData.privacyPolicyContent || ''} onChange={handleChange} className={styles.textareaField} rows="4" placeholder="Use plain text or basic HTML..." />
          </div>
        </div>
      </form>

      {/* 12. Payment Details Content */}
      <form onSubmit={(e) => handleSectionSubmit(e, ['paymentDetailsContent'], 'Payment Details Content')} className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Payment Details Content</h3>
          <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <textarea name="paymentDetailsContent" value={formData.paymentDetailsContent || ''} onChange={handleChange} className={styles.textareaField} rows="4" placeholder="Use plain text or basic HTML..." />
          </div>
        </div>
      </form>

    </div>
  );
};

export default ManageSiteSettings;
