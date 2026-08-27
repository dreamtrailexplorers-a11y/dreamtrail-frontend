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
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const mainContent = document.getElementById('admin-main-content');
    if (activeModal) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      if (mainContent) mainContent.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
      if (mainContent) mainContent.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
      if (mainContent) mainContent.style.overflow = 'auto';
    };
  }, [activeModal]);

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

  // --- Dynamic Block Builder Functions ---
  const handleAddPolicyBlock = (field, blockType) => {
    const currentBlocks = formData[field] || [];
    setFormData({
      ...formData,
      [field]: [...currentBlocks, { blockType, content: '' }]
    });
  };

  const handleUpdatePolicyBlock = (field, index, newContent) => {
    const updatedBlocks = [...(formData[field] || [])];
    updatedBlocks[index].content = newContent;
    setFormData({
      ...formData,
      [field]: updatedBlocks
    });
  };

  const handleRemovePolicyBlock = (field, index) => {
    const updatedBlocks = (formData[field] || []).filter((_, i) => i !== index);
    setFormData({
      ...formData,
      [field]: updatedBlocks
    });
  };

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
      setActiveModal(null);
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

  
  const handleMeetTheTeamNestedChange = (e) => {
    setFormData({
      ...formData,
      meetTheTeam: {
        ...(formData.meetTheTeam || {}),
        [e.target.name]: e.target.value
      }
    });
  };

  const handleMeetTheTeamImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { uploadFile } = await import('../../services/api');
      const res = await uploadFile(file);
      const fullUrl = res.data.url.startsWith('http') ? res.data.url : `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      setFormData({
        ...formData,
        meetTheTeam: {
          ...(formData.meetTheTeam || {}),
          [field]: fullUrl
        }
      });
    } catch (err) {
      alert('Upload failed');
    }
  };

  const handleTeamMemberImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { uploadFile } = await import('../../services/api');
      const res = await uploadFile(file);
      const fullUrl = res.data.url.startsWith('http') ? res.data.url : `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      handleTeamMemberChange(index, 'image', fullUrl);
    } catch (err) {
      alert('Upload failed');
    }
  };

  const handleTeamMemberChange = (index, field, value) => {
    const newMembers = [...(formData.meetTheTeam?.teamMembers || [])];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setFormData({
      ...formData,
      meetTheTeam: { ...(formData.meetTheTeam || {}), teamMembers: newMembers }
    });
  };

  const addTeamMember = () => {
    const newMembers = [...(formData.meetTheTeam?.teamMembers || []), { name: '', role: '', description: '', image: '', whatsapp: '', orderNumber: '', teamType: 'Ride Marshal' }];
    setFormData({
      ...formData,
      meetTheTeam: { ...(formData.meetTheTeam || {}), teamMembers: newMembers }
    });
  };

  const removeTeamMember = (index) => {
    const newMembers = (formData.meetTheTeam?.teamMembers || []).filter((_, i) => i !== index);
    setFormData({
      ...formData,
      meetTheTeam: { ...(formData.meetTheTeam || {}), teamMembers: newMembers }
    });
  };


  if (loading) return <div>Loading...</div>;
  if (!formData) return <div>No settings found</div>;


  const renderModalContent = () => {
    switch(activeModal) {

      case 'Pre-Booking Settings':
        return (
          <>
            <form onSubmit={(e) => handleSectionSubmit(e, ['preBookingSettings'], 'Pre-Booking Settings')} className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Pre-Booking & Reminders</h3>
                <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Pre-Booking Amount (â‚¹)</label>
                  <input type="number" value={formData.preBookingSettings?.amount || 5000} onChange={(e) => setFormData({ ...formData, preBookingSettings: { ...formData.preBookingSettings, amount: Number(e.target.value) }})} className={styles.inputField} />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Reminder Start Days</label>
                  <input type="number" value={formData.preBookingSettings?.reminderDaysLeft || 10} onChange={(e) => setFormData({ ...formData, preBookingSettings: { ...formData.preBookingSettings, reminderDaysLeft: Number(e.target.value) }})} className={styles.inputField} />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Reminder Time 1</label>
                  <input type="time" value={formData.preBookingSettings?.reminderTime1 || '10:00'} onChange={(e) => setFormData({ ...formData, preBookingSettings: { ...formData.preBookingSettings, reminderTime1: e.target.value }})} className={styles.inputField} />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Reminder Time 2</label>
                  <input type="time" value={formData.preBookingSettings?.reminderTime2 || '18:00'} onChange={(e) => setFormData({ ...formData, preBookingSettings: { ...formData.preBookingSettings, reminderTime2: e.target.value }})} className={styles.inputField} />
                </div>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Refund Policy Text</label>
                  <textarea value={formData.preBookingSettings?.refundPolicyText || ''} onChange={(e) => setFormData({ ...formData, preBookingSettings: { ...formData.preBookingSettings, refundPolicyText: e.target.value }})} className={styles.inputField} style={{ minHeight: '80px' }} />
                </div>
              </div>
            </form>
          </>
        );

      
      case 'Hero Section':
        return (
          <>
            <form onSubmit={(e) => handleSectionSubmit(e, ['heroSliders'], 'Hero Section')} className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Hero Section</h3>
          <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {(formData.heroSliders || []).map((slide, index) => (
            <div key={index} style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', position: 'relative' }}>
              <button type="button" onClick={() => {
                const newSliders = [...(formData.heroSliders || [])];
                newSliders.splice(index, 1);
                setFormData({...formData, heroSliders: newSliders});
              }} style={{ position: 'absolute', top: '10px', right: '10px', background: '#ffe4e6', color: '#e11d48', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '5px 10px' }}>X Remove</button>
              
              <div className={styles.formGrid}>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Slide Heading</label>
                  <textarea 
                    value={slide.heading} 
                    onChange={(e) => {
                      const newSliders = [...(formData.heroSliders || [])];
                      newSliders[index].heading = e.target.value;
                      setFormData({...formData, heroSliders: newSliders});
                    }} 
                    className={styles.textareaField} rows="2" 
                  />
                </div>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    Background Image URL
                    <label style={{ cursor: 'pointer', backgroundColor: '#3b82f6', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      Upload Image
                      <input type="file" style={{ display: 'none' }} accept="image/*" onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        try {
                          const res = await uploadFile(file);
                          const fullUrl = res.data.url.startsWith('http') ? res.data.url : `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
                          const newSliders = [...(formData.heroSliders || [])];
                          newSliders[index].image = fullUrl;
                          setFormData({...formData, heroSliders: newSliders});
                        } catch (err) {
                          alert('Upload failed');
                        }
                      }} />
                    </label>
                  </label>
                  <input 
                    value={slide.image} 
                    onChange={(e) => {
                      const newSliders = [...(formData.heroSliders || [])];
                      newSliders[index].image = e.target.value;
                      setFormData({...formData, heroSliders: newSliders});
                    }} 
                    className={styles.inputField} 
                  />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => {
            const newSliders = [...(formData.heroSliders || [])];
            newSliders.push({ heading: 'New Slide Heading', image: '' });
            setFormData({...formData, heroSliders: newSliders});
          }} style={{ alignSelf: 'flex-start', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>+ Add Slide</button>
        </div>
      </form>
          </>
        );
      
      case 'Promotional Banners':
        return (
          <>
            <form onSubmit={(e) => handleSectionSubmit(e, ['bannerVideoUrl', 'bannerVideoTitle', 'bannerVideoSubtitle', 'groupTripBanners'], 'Promotional Banners')} className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Promotional Banners</h3>
          <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.inputLabel} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              Video Banner URL (Max 4.5MB limit)
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
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1', margin: 0 }}>
                  <label className={styles.inputLabel}>Link to Category</label>
                  <select value={banner.categoryLink || ''} onChange={(e) => handleBannerArrayChange(index, 'categoryLink', e.target.value)} className={styles.inputField}>
                    <option value="">No Link</option>
                    <option value="Motorcycle Tours">Motorcycle Tours</option>
                    <option value="Group Tours">Group Tours</option>
                    <option value="Winter Tours">Winter Tours</option>
                    <option value="Corporate Tours">Corporate Tours</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </form>
          </>
        );
      
      case 'Contact Info':
        return (
          <>
            <form onSubmit={(e) => handleSectionSubmit(e, ['address', 'phone', 'email', 'whatsappNumber'], 'Contact Info')} className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Contact Info</h3>
          <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Address</label>
            <textarea name="address" value={formData.address || ''} onChange={handleChange} className={styles.textareaField} rows="6" />
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
          </>
        );
      
      case 'Social Media Links':
        return (
          <>
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
          </>
        );
      
      case 'Footer':
        return (
          <>
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
          </>
        );
      
      case 'Razorpay Integration':
        return (
          <>
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
          </>
        );
      
      case 'About Us Page':
        return (
          <>
            <form onSubmit={(e) => handleSectionSubmit(e, ['aboutPage'], 'About Us Page')} className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>About Us Page</h3>
          <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
        </div>
        
        
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

            <div style={{ gridColumn: '1 / -1', marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#334155' }}>Discover More Section (Slider)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Section Title</label>
                    <input name="extraIntrosTitle" value={formData.aboutPage?.extraIntrosTitle || ''} onChange={(e) => handleAboutNestedChange(e, 'aboutPage')} className={styles.inputField} placeholder="e.g. Discover More" />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Section Subtitle</label>
                    <input name="extraIntrosSubtitle" value={formData.aboutPage?.extraIntrosSubtitle || ''} onChange={(e) => handleAboutNestedChange(e, 'aboutPage')} className={styles.inputField} placeholder="e.g. Delve deeper into our vision..." />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Slider Cards</h4>
                <button type="button" onClick={() => addAboutPoint('aboutPage', 'extraIntros')} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Add Card</button>
              </div>
            
              {(formData.aboutPage?.extraIntros || []).map((intro, index) => (
                <div key={index} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Title</label>
                      <input value={intro.title || ''} onChange={(e) => handleAboutPointsChange(index, 'title', e.target.value, 'aboutPage', 'extraIntros')} className={styles.inputField} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Text</label>
                      <textarea value={intro.text || ''} onChange={(e) => handleAboutPointsChange(index, 'text', e.target.value, 'aboutPage', 'extraIntros')} className={styles.textareaField} rows="3" />
                    </div>
                    
                    {/* Points Sub-array for Discover More cards */}
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <label className={styles.inputLabel} style={{ margin: 0 }}>Points (Bullet Points)</label>
                        <button type="button" onClick={() => {
                          const currentExtraIntros = [...(formData.aboutPage?.extraIntros || [])];
                          if (!currentExtraIntros[index].points) currentExtraIntros[index].points = [];
                          currentExtraIntros[index].points.push({ title: '', text: '' });
                          setFormData({ ...formData, aboutPage: { ...formData.aboutPage, extraIntros: currentExtraIntros } });
                        }} className={styles.btnSecondary} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>+ Add Point</button>
                      </div>
                      {(intro.points || []).map((pt, pIdx) => (
                        <div key={pIdx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <input 
                              placeholder="Point Title" 
                              value={pt.title || ''} 
                              onChange={(e) => {
                                const currentExtraIntros = [...(formData.aboutPage?.extraIntros || [])];
                                currentExtraIntros[index].points[pIdx].title = e.target.value;
                                setFormData({ ...formData, aboutPage: { ...formData.aboutPage, extraIntros: currentExtraIntros } });
                              }} 
                              className={styles.inputField} 
                            />
                            <textarea 
                              placeholder="Point Text" 
                              value={pt.text || ''} 
                              onChange={(e) => {
                                const currentExtraIntros = [...(formData.aboutPage?.extraIntros || [])];
                                currentExtraIntros[index].points[pIdx].text = e.target.value;
                                setFormData({ ...formData, aboutPage: { ...formData.aboutPage, extraIntros: currentExtraIntros } });
                              }} 
                              className={styles.textareaField} 
                              rows="2"
                            />
                          </div>
                          <button type="button" onClick={() => {
                            const currentExtraIntros = [...(formData.aboutPage?.extraIntros || [])];
                            currentExtraIntros[index].points.splice(pIdx, 1);
                            setFormData({ ...formData, aboutPage: { ...formData.aboutPage, extraIntros: currentExtraIntros } });
                          }} className={styles.btnDanger} style={{ padding: '8px 12px' }}>Remove</button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button type="button" onClick={() => removeAboutPoint(index, 'aboutPage', 'extraIntros')} className={styles.btnDanger} style={{ padding: '6px 12px', fontSize: '0.85rem', marginTop: '15px' }}>Remove Section</button>
                </div>
              ))}
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

            <div className={styles.inputGroup} style={{ gridColumn: '1 / -1', borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <label className={styles.inputLabel}>Why Choose Us Title</label>
              <input name="whyChooseUsTitle" value={formData.aboutPage?.whyChooseUsTitle || ''} onChange={(e) => handleAboutNestedChange(e, 'aboutPage')} className={styles.inputField} placeholder="e.g. WHY CHOOSE US FOR MOTORCYCLE TOURS" />
            </div>

            <div className={styles.inputGroup} style={{ gridColumn: '1 / -1', borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label className={styles.inputLabel} style={{ margin: 0 }}>Why Choose Us Points</label>
                <button type="button" onClick={() => addAboutPoint('aboutPage', 'whyChooseUsPoints')} className={styles.btnSecondary} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>+ Add Point</button>
              </div>
              {(formData.aboutPage?.whyChooseUsPoints || []).map((point, index) => (
                <div key={index} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #eee', borderRadius: '8px', background: '#fafafa' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Point Title</label>
                      <input 
                        placeholder="e.g. Safety Comes First" 
                        value={point.title || ''} 
                        onChange={(e) => handleAboutPointsChange(index, 'title', e.target.value, 'aboutPage', 'whyChooseUsPoints')} 
                        className={styles.inputField} 
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Point Text</label>
                      <textarea 
                        placeholder="Point Text" 
                        value={point.text || ''} 
                        onChange={(e) => handleAboutPointsChange(index, 'text', e.target.value, 'aboutPage', 'whyChooseUsPoints')} 
                        className={styles.textareaField} 
                        rows="3"
                      />
                    </div>
                  </div>
                  <button type="button" onClick={() => removeAboutPoint(index, 'aboutPage', 'whyChooseUsPoints')} className={styles.btnDanger} style={{ marginTop: '10px', padding: '6px 12px' }}>Remove Point</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        
        <h4 style={{marginTop: '20px', marginBottom: '10px', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px'}}>Our Story Section</h4>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.inputLabel} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              Story Image 1 (Main)
              <label className={styles.btnSecondary} style={{ cursor: 'pointer', padding: '4px 10px', fontSize: '0.75rem' }}>
                Upload Image
                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleAboutImageUpload(e, 'aboutPage', 'storyImage')} />
              </label>
            </label>
            <input name="storyImage" value={formData.aboutPage?.storyImage || ''} onChange={(e) => handleAboutNestedChange(e, 'aboutPage')} className={styles.inputField} />
          </div>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.inputLabel} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              Story Image 2 (Sub 1)
              <label className={styles.btnSecondary} style={{ cursor: 'pointer', padding: '4px 10px', fontSize: '0.75rem' }}>
                Upload Image
                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleAboutImageUpload(e, 'aboutPage', 'storyImage2')} />
              </label>
            </label>
            <input name="storyImage2" value={formData.aboutPage?.storyImage2 || ''} onChange={(e) => handleAboutNestedChange(e, 'aboutPage')} className={styles.inputField} />
          </div>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.inputLabel} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              Story Image 3 (Sub 2)
              <label className={styles.btnSecondary} style={{ cursor: 'pointer', padding: '4px 10px', fontSize: '0.75rem' }}>
                Upload Image
                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleAboutImageUpload(e, 'aboutPage', 'storyImage3')} />
              </label>
            </label>
            <input name="storyImage3" value={formData.aboutPage?.storyImage3 || ''} onChange={(e) => handleAboutNestedChange(e, 'aboutPage')} className={styles.inputField} />
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
          </>
        );
      
      case 'About Snippet':
        return (
          <>
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
          </>
        );
      
      case 'Careers Content':
        return (
          <>
            <form onSubmit={(e) => handleSectionSubmit(e, ['careersBlocks'], 'Careers Content')} className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Careers Content</h3>
                <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
              </div>
              
              <div className={styles.formGrid}>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  {(formData.careersBlocks || []).map((block, idx) => (
                    <div key={idx} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', position: 'relative', backgroundColor: '#fff' }}>
                      <div style={{ position: 'absolute', top: '-10px', left: '15px', backgroundColor: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {block.blockType}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemovePolicyBlock('careersBlocks', idx)}
                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}
                        title="Remove Block"
                      >
                        Ãƒâ€”
                      </button>
                      
                      {block.blockType === 'title' || block.blockType === 'subtitle' ? (
                        <input 
                          type="text" 
                          value={block.content} 
                          onChange={(e) => handleUpdatePolicyBlock('careersBlocks', idx, e.target.value)} 
                          className={styles.inputField} 
                          placeholder={`Enter ${block.blockType}...`}
                          style={{ marginTop: '10px' }}
                        />
                      ) : (
                        <textarea 
                          value={block.content} 
                          onChange={(e) => handleUpdatePolicyBlock('careersBlocks', idx, e.target.value)} 
                          className={styles.textareaField} 
                          rows={block.blockType === 'point' ? "2" : "4"}
                          placeholder={`Enter ${block.blockType} content...`}
                          style={{ marginTop: '10px' }}
                        />
                      )}
                    </div>
                  ))}
                  
                  {(!formData.careersBlocks || formData.careersBlocks.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                      No blocks added yet. Use the buttons above to start building your page.
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#334155' }}>Add New Block</h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => handleAddPolicyBlock('careersBlocks', 'title')} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Title</button>
                  <button type="button" onClick={() => handleAddPolicyBlock('careersBlocks', 'subtitle')} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Subtitle</button>
                  <button type="button" onClick={() => handleAddPolicyBlock('careersBlocks', 'point')} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Point</button>
                  <button type="button" onClick={() => handleAddPolicyBlock('careersBlocks', 'text')} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Text</button>
                </div>
              </div>
            </form>
          </>
        );
      
      case 'Contact Us Content':
        return (
          <>
            <form onSubmit={(e) => handleSectionSubmit(e, ['contactUsBlocks'], 'Contact Us Content')} className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Contact Us Content</h3>
                <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
              </div>
              
              <div className={styles.formGrid}>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  {(formData.contactUsBlocks || []).map((block, idx) => (
                    <div key={idx} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', position: 'relative', backgroundColor: '#fff' }}>
                      <div style={{ position: 'absolute', top: '-10px', left: '15px', backgroundColor: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {block.blockType}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemovePolicyBlock('contactUsBlocks', idx)}
                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}
                        title="Remove Block"
                      >
                        Ãƒâ€”
                      </button>
                      
                      {block.blockType === 'title' || block.blockType === 'subtitle' ? (
                        <input 
                          type="text" 
                          value={block.content} 
                          onChange={(e) => handleUpdatePolicyBlock('contactUsBlocks', idx, e.target.value)} 
                          className={styles.inputField} 
                          placeholder={`Enter ${block.blockType}...`}
                          style={{ marginTop: '10px' }}
                        />
                      ) : (
                        <textarea 
                          value={block.content} 
                          onChange={(e) => handleUpdatePolicyBlock('contactUsBlocks', idx, e.target.value)} 
                          className={styles.textareaField} 
                          rows={block.blockType === 'point' ? "2" : "4"}
                          placeholder={`Enter ${block.blockType} content...`}
                          style={{ marginTop: '10px' }}
                        />
                      )}
                    </div>
                  ))}
                  
                  {(!formData.contactUsBlocks || formData.contactUsBlocks.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                      No blocks added yet. Use the buttons above to start building your page.
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#334155' }}>Add New Block</h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => handleAddPolicyBlock('contactUsBlocks', 'title')} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Title</button>
                  <button type="button" onClick={() => handleAddPolicyBlock('contactUsBlocks', 'subtitle')} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Subtitle</button>
                  <button type="button" onClick={() => handleAddPolicyBlock('contactUsBlocks', 'point')} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Point</button>
                  <button type="button" onClick={() => handleAddPolicyBlock('contactUsBlocks', 'text')} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Text</button>
                </div>
              </div>
            </form>
          </>
        );
      
      case 'Terms & Conditions Content':
        return (
          <>
            <form onSubmit={(e) => handleSectionSubmit(e, ['termsBlocks'], 'Terms & Conditions Content')} className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Terms & Conditions Content</h3>
                <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
              </div>
              
              <div className={styles.formGrid}>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  {(formData.termsBlocks || []).map((block, idx) => (
                    <div key={idx} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', position: 'relative', backgroundColor: '#fff' }}>
                      <div style={{ position: 'absolute', top: '-10px', left: '15px', backgroundColor: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {block.blockType}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemovePolicyBlock('termsBlocks', idx)}
                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}
                        title="Remove Block"
                      >
                        Ãƒâ€”
                      </button>
                      
                      {block.blockType === 'title' || block.blockType === 'subtitle' ? (
                        <input 
                          type="text" 
                          value={block.content} 
                          onChange={(e) => handleUpdatePolicyBlock('termsBlocks', idx, e.target.value)} 
                          className={styles.inputField} 
                          placeholder={`Enter ${block.blockType}...`}
                          style={{ marginTop: '10px' }}
                        />
                      ) : (
                        <textarea 
                          value={block.content} 
                          onChange={(e) => handleUpdatePolicyBlock('termsBlocks', idx, e.target.value)} 
                          className={styles.textareaField} 
                          rows={block.blockType === 'point' ? "2" : "4"}
                          placeholder={`Enter ${block.blockType} content...`}
                          style={{ marginTop: '10px' }}
                        />
                      )}
                    </div>
                  ))}
                  
                  {(!formData.termsBlocks || formData.termsBlocks.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                      No blocks added yet. Use the buttons above to start building your page.
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#334155' }}>Add New Block</h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => handleAddPolicyBlock('termsBlocks', 'title')} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Title</button>
                  <button type="button" onClick={() => handleAddPolicyBlock('termsBlocks', 'subtitle')} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Subtitle</button>
                  <button type="button" onClick={() => handleAddPolicyBlock('termsBlocks', 'point')} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Point</button>
                  <button type="button" onClick={() => handleAddPolicyBlock('termsBlocks', 'text')} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Text</button>
                </div>
              </div>
            </form>
          </>
        );
      
      case 'Privacy Policy Content':
        return (
          <>
            <form onSubmit={(e) => handleSectionSubmit(e, ['privacyPolicyBlocks'], 'Privacy Policy Content')} className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Privacy Policy Content</h3>
                <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
              </div>
              
              <div className={styles.formGrid}>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  {(formData.privacyPolicyBlocks || []).map((block, idx) => (
                    <div key={idx} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', position: 'relative', backgroundColor: '#fff' }}>
                      <div style={{ position: 'absolute', top: '-10px', left: '15px', backgroundColor: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {block.blockType}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemovePolicyBlock('privacyPolicyBlocks', idx)}
                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}
                        title="Remove Block"
                      >
                        Ãƒâ€”
                      </button>
                      
                      {block.blockType === 'title' || block.blockType === 'subtitle' ? (
                        <input 
                          type="text" 
                          value={block.content} 
                          onChange={(e) => handleUpdatePolicyBlock('privacyPolicyBlocks', idx, e.target.value)} 
                          className={styles.inputField} 
                          placeholder={`Enter ${block.blockType}...`}
                          style={{ marginTop: '10px' }}
                        />
                      ) : (
                        <textarea 
                          value={block.content} 
                          onChange={(e) => handleUpdatePolicyBlock('privacyPolicyBlocks', idx, e.target.value)} 
                          className={styles.textareaField} 
                          rows={block.blockType === 'point' ? "2" : "4"}
                          placeholder={`Enter ${block.blockType} content...`}
                          style={{ marginTop: '10px' }}
                        />
                      )}
                    </div>
                  ))}
                  
                  {(!formData.privacyPolicyBlocks || formData.privacyPolicyBlocks.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                      No blocks added yet. Use the buttons above to start building your page.
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#334155' }}>Add New Block</h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => handleAddPolicyBlock('privacyPolicyBlocks', 'title')} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Title</button>
                  <button type="button" onClick={() => handleAddPolicyBlock('privacyPolicyBlocks', 'subtitle')} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Subtitle</button>
                  <button type="button" onClick={() => handleAddPolicyBlock('privacyPolicyBlocks', 'point')} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Point</button>
                  <button type="button" onClick={() => handleAddPolicyBlock('privacyPolicyBlocks', 'text')} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Text</button>
                </div>
              </div>
            </form>
          </>
        );

      case 'Cancellation Policy Content':
        return (
          <>
            <form onSubmit={(e) => handleSectionSubmit(e, ['cancellationSettings'], 'Cancellation Policy Content')} className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 15px 0' }}>
                <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Cancellation Policy Content</h3>
                <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
              </div>
              
              <div className={styles.formGrid}>
                {/* Top Section */}
                <h4 style={{gridColumn: '1 / -1', margin: '10px 0', borderBottom: '1px solid #eee', paddingBottom: '5px'}}>Top Table Section</h4>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Table Subtitle</label>
                  <input 
                    value={formData.cancellationSettings?.tableSubtitle || ''} 
                    onChange={(e) => setFormData({...formData, cancellationSettings: {...(formData.cancellationSettings || {}), tableSubtitle: e.target.value}})} 
                    className={styles.inputField} 
                  />
                </div>
                
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label className={styles.inputLabel} style={{ margin: 0 }}>Table Rows</label>
                    <button type="button" onClick={() => {
                      const newRows = [...(formData.cancellationSettings?.tableRows || []), { leftText: '', rightText: '' }];
                      setFormData({...formData, cancellationSettings: {...(formData.cancellationSettings || {}), tableRows: newRows}});
                    }} className={styles.btnSecondary} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>+ Add Row</button>
                  </div>
                  {(formData.cancellationSettings?.tableRows || []).map((row, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <input 
                        placeholder="Left Column Text" 
                        value={row.leftText || ''} 
                        onChange={(e) => {
                          const newRows = [...(formData.cancellationSettings?.tableRows || [])];
                          newRows[idx].leftText = e.target.value;
                          setFormData({...formData, cancellationSettings: {...(formData.cancellationSettings || {}), tableRows: newRows}});
                        }} 
                        className={styles.inputField} 
                      />
                      <input 
                        placeholder="Right Column Text" 
                        value={row.rightText || ''} 
                        onChange={(e) => {
                          const newRows = [...(formData.cancellationSettings?.tableRows || [])];
                          newRows[idx].rightText = e.target.value;
                          setFormData({...formData, cancellationSettings: {...(formData.cancellationSettings || {}), tableRows: newRows}});
                        }} 
                        className={styles.inputField} 
                      />
                      <button type="button" onClick={() => {
                        const newRows = (formData.cancellationSettings?.tableRows || []).filter((_, i) => i !== idx);
                        setFormData({...formData, cancellationSettings: {...(formData.cancellationSettings || {}), tableRows: newRows}});
                      }} className={styles.btnDanger} style={{ padding: '8px 12px' }}>Remove</button>
                    </div>
                  ))}
                </div>

                {/* Middle Section */}
                <h4 style={{gridColumn: '1 / -1', margin: '20px 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '5px'}}>Middle Section</h4>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Middle Subtitle</label>
                  <input 
                    value={formData.cancellationSettings?.middleSubtitle || ''} 
                    onChange={(e) => setFormData({...formData, cancellationSettings: {...(formData.cancellationSettings || {}), middleSubtitle: e.target.value}})} 
                    className={styles.inputField} 
                  />
                </div>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Middle Paragraph Text</label>
                  <textarea 
                    value={formData.cancellationSettings?.middleText || ''} 
                    onChange={(e) => setFormData({...formData, cancellationSettings: {...(formData.cancellationSettings || {}), middleText: e.target.value}})} 
                    className={styles.textareaField} 
                    rows="3"
                  />
                </div>

                {/* Bottom Section */}
                <h4 style={{gridColumn: '1 / -1', margin: '20px 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '5px'}}>Bottom Section</h4>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Bottom Subtitle</label>
                  <input 
                    value={formData.cancellationSettings?.bottomSubtitle || ''} 
                    onChange={(e) => setFormData({...formData, cancellationSettings: {...(formData.cancellationSettings || {}), bottomSubtitle: e.target.value}})} 
                    className={styles.inputField} 
                  />
                </div>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label className={styles.inputLabel} style={{ margin: 0 }}>Bottom Bullet Points</label>
                    <button type="button" onClick={() => {
                      const newBullets = [...(formData.cancellationSettings?.bottomBullets || []), ''];
                      setFormData({...formData, cancellationSettings: {...(formData.cancellationSettings || {}), bottomBullets: newBullets}});
                    }} className={styles.btnSecondary} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>+ Add Bullet</button>
                  </div>
                  {(formData.cancellationSettings?.bottomBullets || []).map((bullet, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <textarea 
                        value={bullet || ''} 
                        onChange={(e) => {
                          const newBullets = [...(formData.cancellationSettings?.bottomBullets || [])];
                          newBullets[idx] = e.target.value;
                          setFormData({...formData, cancellationSettings: {...(formData.cancellationSettings || {}), bottomBullets: newBullets}});
                        }} 
                        className={styles.textareaField} 
                        rows="2"
                      />
                      <button type="button" onClick={() => {
                        const newBullets = (formData.cancellationSettings?.bottomBullets || []).filter((_, i) => i !== idx);
                        setFormData({...formData, cancellationSettings: {...(formData.cancellationSettings || {}), bottomBullets: newBullets}});
                      }} className={styles.btnDanger} style={{ padding: '8px 12px' }}>Remove</button>
                    </div>
                  ))}
                </div>

                {/* Footer Red Text */}
                <h4 style={{gridColumn: '1 / -1', margin: '20px 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '5px'}}>Footer Red Warning</h4>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Red Bold Text</label>
                  <textarea 
                    value={formData.cancellationSettings?.redNote || ''} 
                    onChange={(e) => setFormData({...formData, cancellationSettings: {...(formData.cancellationSettings || {}), redNote: e.target.value}})} 
                    className={styles.textareaField} 
                    rows="2"
                  />
                </div>
              </div>
            </form>
          </>
        );

      case 'Payment Details Content':
        return (
          <>
            <form onSubmit={(e) => handleSectionSubmit(e, ['paymentDetailsBlocks'], 'Payment Details Content')} className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Payment Details Content</h3>
                <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
              </div>
              
              <div className={styles.formGrid}>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  {(formData.paymentDetailsBlocks || []).map((block, idx) => (
                    <div key={idx} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', position: 'relative', backgroundColor: '#fff' }}>
                      <div style={{ position: 'absolute', top: '-10px', left: '15px', backgroundColor: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {block.blockType}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemovePolicyBlock('paymentDetailsBlocks', idx)}
                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}
                        title="Remove Block"
                      >
                        Ãƒâ€”
                      </button>
                      
                      {block.blockType === 'title' || block.blockType === 'subtitle' ? (
                        <input 
                          type="text" 
                          value={block.content} 
                          onChange={(e) => handleUpdatePolicyBlock('paymentDetailsBlocks', idx, e.target.value)} 
                          className={styles.inputField} 
                          placeholder={`Enter ${block.blockType}...`}
                          style={{ marginTop: '10px' }}
                        />
                      ) : (
                        <textarea 
                          value={block.content} 
                          onChange={(e) => handleUpdatePolicyBlock('paymentDetailsBlocks', idx, e.target.value)} 
                          className={styles.textareaField} 
                          rows={block.blockType === 'point' ? "2" : "4"}
                          placeholder={`Enter ${block.blockType} content...`}
                          style={{ marginTop: '10px' }}
                        />
                      )}
                    </div>
                  ))}
                  
                  {(!formData.paymentDetailsBlocks || formData.paymentDetailsBlocks.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                      No blocks added yet. Use the buttons above to start building your page.
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#334155' }}>Add New Block</h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => handleAddPolicyBlock('paymentDetailsBlocks', 'title')} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Title</button>
                  <button type="button" onClick={() => handleAddPolicyBlock('paymentDetailsBlocks', 'subtitle')} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Subtitle</button>
                  <button type="button" onClick={() => handleAddPolicyBlock('paymentDetailsBlocks', 'point')} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Point</button>
                  <button type="button" onClick={() => handleAddPolicyBlock('paymentDetailsBlocks', 'text')} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Text</button>
                </div>
              </div>
            </form>
          </>
        );
      
      case 'Meet The Team Page':
        return (
          <>
            <form onSubmit={(e) => handleSectionSubmit(e, ['meetTheTeam'], 'Meet The Team Page')} className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Meet The Team Page</h3>
                <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save Section</button>
              </div>
              
              <h4 style={{marginTop: '20px', marginBottom: '10px', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px'}}>Hero Section</h4>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    Hero Background Image
                    <label className={styles.btnSecondary} style={{ cursor: 'pointer', padding: '4px 10px', fontSize: '0.75rem' }}>
                      Upload Image
                      <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleMeetTheTeamImageUpload(e, 'heroImage')} />
                    </label>
                  </label>
                  <input name="heroImage" value={formData.meetTheTeam?.heroImage || ''} onChange={handleMeetTheTeamNestedChange} className={styles.inputField} />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Hero Title</label>
                  <input name="heroTitle" value={formData.meetTheTeam?.heroTitle || ''} onChange={handleMeetTheTeamNestedChange} className={styles.inputField} />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Hero Subtitle</label>
                  <input name="heroSubtitle" value={formData.meetTheTeam?.heroSubtitle || ''} onChange={handleMeetTheTeamNestedChange} className={styles.inputField} />
                </div>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Hero Text</label>
                  <textarea name="heroText" value={formData.meetTheTeam?.heroText || ''} onChange={handleMeetTheTeamNestedChange} className={styles.textareaField} rows="6" />
                </div>
              </div>

              <h4 style={{marginTop: '20px', marginBottom: '10px', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px'}}>Inspiration Section</h4>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Quote Text (What inspired me...)</label>
                  <textarea name="quoteText" value={formData.meetTheTeam?.quoteText || ''} onChange={handleMeetTheTeamNestedChange} className={styles.textareaField} rows="3" />
                </div>
              </div>

              <h4 style={{marginTop: '20px', marginBottom: '10px', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px'}}>Team Members</h4>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label className={styles.inputLabel} style={{ margin: 0 }}>Manage Members</label>
                    <button type="button" onClick={addTeamMember} className={styles.btnSecondary} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>+ Add Member</button>
                  </div>
                  
                  {(formData.meetTheTeam?.teamMembers || []).map((member, index) => (
                    <div key={index} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#64748b' }}>Member #{index + 1}</span>
                        <button type="button" onClick={() => removeTeamMember(index)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Remove</button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        
                        <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                          <label className={styles.inputLabel} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Member Photo
                            <label className={styles.btnSecondary} style={{ cursor: 'pointer', padding: '2px 8px', fontSize: '0.7rem' }}>
                              Upload
                              <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleTeamMemberImageUpload(e, index)} />
                            </label>
                          </label>
                          <input value={member.image || ''} onChange={(e) => handleTeamMemberChange(index, 'image', e.target.value)} className={styles.inputField} placeholder="Image URL" />
                        </div>
                        
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Name</label>
                          <input value={member.name || ''} onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)} className={styles.inputField} />
                        </div>
                        
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Role</label>
                          <input value={member.role || ''} onChange={(e) => handleTeamMemberChange(index, 'role', e.target.value)} className={styles.inputField} placeholder="e.g. Founder, Operations" />
                        </div>

                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Team Type</label>
                          <select value={member.teamType || 'Ride Marshal'} onChange={(e) => handleTeamMemberChange(index, 'teamType', e.target.value)} className={styles.inputField}>
                            <option value="Ride Marshal">Ride Marshal (or Main Founder)</option>
                            <option value="Back Office">Back Office</option>
                          </select>
                        </div>
                        
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Whatsapp Number (optional)</label>
                          <input value={member.whatsapp || ''} onChange={(e) => handleTeamMemberChange(index, 'whatsapp', e.target.value)} className={styles.inputField} placeholder="e.g. 919876543210" />
                        </div>
                        
                        <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                          <label className={styles.inputLabel}>Order Number / Watermark</label>
                          <input value={member.orderNumber || ''} onChange={(e) => handleTeamMemberChange(index, 'orderNumber', e.target.value)} className={styles.inputField} placeholder="e.g. 01, 02" />
                        </div>

                        <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                          <label className={styles.inputLabel}>Description</label>
                          <textarea value={member.description || ''} onChange={(e) => handleTeamMemberChange(index, 'description', e.target.value)} className={styles.textareaField} rows="6" />
                        </div>
                        
                      </div>
                    </div>
                  ))}
                  
                  {(!formData.meetTheTeam?.teamMembers || formData.meetTheTeam.teamMembers.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                      No team members added yet.
                    </div>
                  )}
                </div>
              </div>

            </form>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <h2 className={styles.pageHeader}>Manage Site Settings</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', paddingBottom: '10px' }}>Pre-Booking Settings</h3>
          <button type="button" onClick={() => setActiveModal('Pre-Booking Settings')} className={styles.btnPrimary} style={{ alignSelf: 'flex-start', padding: '6px 16px' }}>
            Edit
          </button>
        </div>
        
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', paddingBottom: '10px' }}>Hero Section</h3>
          <button type="button" onClick={() => setActiveModal('Hero Section')} className={styles.btnPrimary} style={{ alignSelf: 'flex-start', padding: '6px 16px' }}>
            Edit
          </button>
        </div>
        
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', paddingBottom: '10px' }}>Promotional Banners</h3>
          <button type="button" onClick={() => setActiveModal('Promotional Banners')} className={styles.btnPrimary} style={{ alignSelf: 'flex-start', padding: '6px 16px' }}>
            Edit
          </button>
        </div>
        
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', paddingBottom: '10px' }}>Contact Info</h3>
          <button type="button" onClick={() => setActiveModal('Contact Info')} className={styles.btnPrimary} style={{ alignSelf: 'flex-start', padding: '6px 16px' }}>
            Edit
          </button>
        </div>
        
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', paddingBottom: '10px' }}>Social Media Links</h3>
          <button type="button" onClick={() => setActiveModal('Social Media Links')} className={styles.btnPrimary} style={{ alignSelf: 'flex-start', padding: '6px 16px' }}>
            Edit
          </button>
        </div>
        
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', paddingBottom: '10px' }}>Footer</h3>
          <button type="button" onClick={() => setActiveModal('Footer')} className={styles.btnPrimary} style={{ alignSelf: 'flex-start', padding: '6px 16px' }}>
            Edit
          </button>
        </div>
        
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', paddingBottom: '10px' }}>Razorpay Integration</h3>
          <button type="button" onClick={() => setActiveModal('Razorpay Integration')} className={styles.btnPrimary} style={{ alignSelf: 'flex-start', padding: '6px 16px' }}>
            Edit
          </button>
        </div>
        
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', paddingBottom: '10px' }}>About Us Page Settings</h3>
          <button type="button" onClick={() => setActiveModal('About Us Page')} className={styles.btnPrimary} style={{ alignSelf: 'flex-start', padding: '6px 16px' }}>
            Edit
          </button>
        </div>
        
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', paddingBottom: '10px' }}>About Us Snippet (Home Page)</h3>
          <button type="button" onClick={() => setActiveModal('About Snippet')} className={styles.btnPrimary} style={{ alignSelf: 'flex-start', padding: '6px 16px' }}>
            Edit
          </button>
        </div>
        
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', paddingBottom: '10px' }}>Careers Content</h3>
          <button type="button" onClick={() => setActiveModal('Careers Content')} className={styles.btnPrimary} style={{ alignSelf: 'flex-start', padding: '6px 16px' }}>
            Edit
          </button>
        </div>
        
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', paddingBottom: '10px' }}>Contact Us Content</h3>
          <button type="button" onClick={() => setActiveModal('Contact Us Content')} className={styles.btnPrimary} style={{ alignSelf: 'flex-start', padding: '6px 16px' }}>
            Edit
          </button>
        </div>
        
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', paddingBottom: '10px' }}>Terms & Conditions Content</h3>
          <button type="button" onClick={() => setActiveModal('Terms & Conditions Content')} className={styles.btnPrimary} style={{ alignSelf: 'flex-start', padding: '6px 16px' }}>
            Edit
          </button>
        </div>
        
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', paddingBottom: '10px' }}>Privacy Policy Content</h3>
          <button type="button" onClick={() => setActiveModal('Privacy Policy Content')} className={styles.btnPrimary} style={{ alignSelf: 'flex-start', padding: '6px 16px' }}>
            Edit
          </button>
        </div>
        
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', paddingBottom: '10px' }}>Cancellation Policy Content</h3>
          <button type="button" onClick={() => setActiveModal('Cancellation Policy Content')} className={styles.btnPrimary} style={{ alignSelf: 'flex-start', padding: '6px 16px' }}>
            Edit
          </button>
        </div>
        
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', paddingBottom: '10px' }}>Payment Details Content</h3>
          <button type="button" onClick={() => setActiveModal('Payment Details Content')} className={styles.btnPrimary} style={{ alignSelf: 'flex-start', padding: '6px 16px' }}>
            Edit
          </button>
        </div>
        
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0, border: 'none', paddingBottom: '10px' }}>Meet The Team Page</h3>
          <button type="button" onClick={() => setActiveModal('Meet The Team Page')} className={styles.btnPrimary} style={{ alignSelf: 'flex-start', padding: '6px 16px' }}>
            Edit
          </button>
        </div>
        


      {activeModal && (
        <div 
          onClick={() => setActiveModal(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, 
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: '20px'
          }}>
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white', padding: '25px', borderRadius: '12px', 
              width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto',
              position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
            <button 
              onClick={() => setActiveModal(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
            >
              &times;
            </button>
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );

};

export default ManageSiteSettings;
