import React, { useState, useEffect, useRef } from 'react';
import { getTrips, createTrip, updateTrip, deleteTrip, uploadFile } from '../../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Admin.module.css';

const ArrayInput = ({ title, fields, data = [], onChange }) => {
  const handleAdd = () => onChange([...data, fields.reduce((acc, f) => ({ ...acc, [f.name || f]: '' }), {})]);
  const handleRemove = (i) => onChange(data.filter((_, idx) => idx !== i));
  const handleChange = (i, fieldName, value) => {
    const newData = [...data];
    newData[i][fieldName] = value;
    onChange(newData);
  };
  const handleUploadImage = async (e, i, field) => {
    const file = e.target.files[0];
    if(!file) return;
    try {
      const res = await uploadFile(file);
      const fullUrl = `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      handleChange(i, field, fullUrl);
    } catch(err) {
      alert('Upload failed');
    }
  };

  return (
    <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
      <h4>{title}</h4>
      {data.map((item, i) => (
        <div key={i} className={styles.responsiveFlexRow}>
          {fields.map(f => {
            const fieldName = f.name || f;
            const fieldType = f.type || 'text';
            const placeholder = f.placeholder || fieldName;
            
            if (fieldType === 'select') {
              return (
                <select key={fieldName} value={item[fieldName] || ''} onChange={(e) => handleChange(i, fieldName, e.target.value)} style={{padding:'5px', flex:1}}>
                  <option value="">Select {placeholder}</option>
                  {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              );
            }
            
            if (fieldName === 'image' || fieldName === 'icon') {
              return (
                <div key={fieldName} style={{ display: 'flex', flex: 1, gap: '5px' }}>
                  <label style={{ cursor: 'pointer', background: '#3498db', color: 'white', padding: '8px', borderRadius: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    Upload {fieldName}
                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleUploadImage(e, i, fieldName)} />
                  </label>
                  <input value={item[fieldName] || ''} onChange={(e) => handleChange(i, fieldName, e.target.value)} placeholder={placeholder} className={styles.inputField} style={{ flex: 1, padding: '8px', backgroundColor: '#f9f9f9' }} />
                </div>
              );
            }

            if (fieldType === 'textarea') {
              return (
                <textarea 
                  key={fieldName} 
                  value={item[fieldName] || ''} 
                  onChange={(e) => handleChange(i, fieldName, e.target.value)} 
                  placeholder={placeholder} 
                  className={styles.inputField} 
                  style={{ flex: 2, padding: '8px', minHeight: '60px' }} 
                />
              );
            }

            return (
              <input 
                key={fieldName} 
                type={fieldType}
                value={item[fieldName] || ''} 
                onChange={(e) => handleChange(i, fieldName, e.target.value)} 
                placeholder={placeholder} 
                className={styles.inputField}
                style={{ flex: 1, padding: '8px' }} 
              />
            );
          })}
          <button type="button" onClick={() => handleRemove(i)} className={styles.btnDanger}>X</button>
        </div>
      ))}
      <button type="button" onClick={handleAdd} className={styles.btnSecondary} style={{ marginTop: '10px' }}>+ Add {title}</button>
    </div>
  );
};

const AmenitiesCheckboxInput = ({ data = [], onChange }) => {
  const PREDEFINED_AMENITIES = [
    'Stay',
    'Meals',
    'Travelling',
    'Sightseeing',
    'Trip Leader',
    'Train Ticket',
    'Bike & Fuel',
    'Backup Vehicle'
  ];

  const handleCheckboxChange = (amenity) => {
    if (data.includes(amenity)) {
      onChange(data.filter(a => a !== amenity));
    } else {
      onChange([...data, amenity]);
    }
  };

  return (
    <div className={styles.card} style={{ marginTop: '20px', padding: '15px' }}>
      <h4 className={styles.cardTitle} style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#1e293b' }}>Amenities (Top Section)</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
        {PREDEFINED_AMENITIES.map(amenity => (
          <label key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
            <input 
              type="checkbox" 
              checked={data.includes(amenity)} 
              onChange={() => handleCheckboxChange(amenity)} 
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            {amenity}
          </label>
        ))}
      </div>
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
      const fullUrl = `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      handleChange(i, fullUrl);
    } catch(err) {
      alert('Upload failed');
    }
  };

  return (
    <div className={styles.card} style={{ marginTop: '20px', padding: '15px' }}>
      <h4 className={styles.cardTitle} style={{ fontSize: '1rem' }}>{title}</h4>
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
      {(!maxItems || data.length < maxItems) && (
        <button type="button" onClick={handleAdd} className={styles.btnSecondary} style={{ marginTop: '10px' }}>
          {isImage ? '+ Add Image' : '+ Add Point'}
        </button>
      )}
    </div>
  );
};

const PackageOptionsInput = ({ data = [], onChange }) => {
  const handleAddOption = () => {
    onChange([...data, { title: '', price: '', originalPrice: '', days: '', image: '', subOptions: [] }]);
  };
  
  const handleRemoveOption = (i) => {
    onChange(data.filter((_, idx) => idx !== i));
  };
  
  const handleChangeOption = (i, field, value) => {
    const newData = [...data];
    newData[i] = { ...newData[i], [field]: value };
    onChange(newData);
  };

  const handleUploadImage = async (e, i) => {
    const file = e.target.files[0];
    if(!file) return;
    try {
      const res = await uploadFile(file);
      const fullUrl = `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      handleChangeOption(i, 'image', fullUrl);
    } catch(err) {
      alert('Upload failed');
    }
  };

  const handleAddSubOption = (optIndex) => {
    const newData = [...data];
    const newSubOptions = newData[optIndex].subOptions ? [...newData[optIndex].subOptions] : [];
    newSubOptions.push({ name: '', price: '', originalPrice: '' });
    newData[optIndex] = { ...newData[optIndex], subOptions: newSubOptions };
    onChange(newData);
  };

  const handleRemoveSubOption = (optIndex, subIndex) => {
    const newData = [...data];
    const newSubOptions = [...newData[optIndex].subOptions];
    newSubOptions.splice(subIndex, 1);
    newData[optIndex] = { ...newData[optIndex], subOptions: newSubOptions };
    onChange(newData);
  };

  const handleChangeSubOption = (optIndex, subIndex, field, value) => {
    const newData = [...data];
    const newSubOptions = [...newData[optIndex].subOptions];
    newSubOptions[subIndex] = { ...newSubOptions[subIndex], [field]: value };
    newData[optIndex] = { ...newData[optIndex], subOptions: newSubOptions };
    onChange(newData);
  };

  return (
    <div className={styles.card} style={{ marginTop: '20px', padding: '15px' }}>
      <h4 className={styles.cardTitle} style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#1e293b' }}>Package Options (e.g. Own Bike, Rented Bike)</h4>
      {data.map((opt, i) => (
        <div key={i} style={{ border: '1px solid #e2e8f0', background: '#f8fafc', padding: '15px', marginBottom: '20px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#475569' }}>Main Option {i + 1}</h5>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Option Title</label>
              <input placeholder="e.g. Own Bike" value={opt.title} onChange={e => handleChangeOption(i, 'title', e.target.value)} className={styles.inputField} style={{ width: '100%' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Original Price (₹)</label>
              <input type="number" placeholder="0" value={opt.originalPrice} onChange={e => handleChangeOption(i, 'originalPrice', e.target.value)} className={styles.inputField} style={{ width: '100%' }} />
            </div>
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Discounted Price (₹)</label>
                <input type="number" placeholder="0" value={opt.price} onChange={e => handleChangeOption(i, 'price', e.target.value)} required className={styles.inputField} style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <label style={{ cursor: 'pointer', background: '#3b82f6', color: 'white', padding: '9px', borderRadius: '6px', fontSize: '0.85rem', textAlign: 'center', transition: 'all 0.2s', fontWeight: 500, height: '42px', boxSizing: 'border-box' }}>
                Upload Image
                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleUploadImage(e, i)} />
              </label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
               <button type="button" onClick={() => handleRemoveOption(i)} className={styles.btnDanger} style={{ height: '42px', padding: '0 10px' }}>Remove Option</button>
            </div>
          </div>
          
          {opt.image && (
             <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Uploaded Image URL</label>
                <input value={opt.image} readOnly className={styles.inputField} style={{ width: '100%', backgroundColor: '#e2e8f0', color: '#475569' }} />
             </div>
          )}
          
          <div style={{ padding: '15px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            <h5 style={{ fontSize: '0.9rem', color: '#334155', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Variants / Sub-options (e.g. Solo Rider, 2 Sharing)
            </h5>
            
            {(opt.subOptions || []).map((sub, j) => (
              <div key={j} className={styles.responsiveGrid} style={{ gridTemplateColumns: '2fr 1fr 1fr auto', background: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px dashed #cbd5e1' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>Variant Name</label>
                  <input placeholder="e.g. 2 person" value={sub.name} onChange={e => handleChangeSubOption(i, j, 'name', e.target.value)} className={styles.inputField} style={{ width: '100%', margin: 0 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>Orig Price (₹)</label>
                  <input type="number" placeholder="0" value={sub.originalPrice} onChange={e => handleChangeSubOption(i, j, 'originalPrice', e.target.value)} className={styles.inputField} style={{ width: '100%', margin: 0 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>Disc Price (₹)</label>
                  <input type="number" placeholder="0" value={sub.price} onChange={e => handleChangeSubOption(i, j, 'price', e.target.value)} className={styles.inputField} style={{ width: '100%', margin: 0 }} />
                </div>
                <div style={{ marginTop: '16px' }}>
                  <button type="button" onClick={() => handleRemoveSubOption(i, j)} className={styles.btnDanger} style={{ padding: '8px 12px' }}>X</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => handleAddSubOption(i)} className={styles.btnSecondary} style={{ fontSize: '0.85rem', padding: '6px 12px', marginTop: '5px' }}>+ Add Variant</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={handleAddOption} className={styles.btnPrimary} style={{ marginTop: '10px' }}>+ Add New Package Option</button>
    </div>
  );
};

const PricingTableInput = ({ data = [], packageOptions = [], onChange }) => {
  const handleAddRow = () => {
    const newOptions = packageOptions.map(p => ({ optionName: p.title, price: '' }));
    onChange([...data, { category: '', options: newOptions }]);
  };

  const handleRemoveRow = (i) => {
    onChange(data.filter((_, idx) => idx !== i));
  };

  const handleChangeRow = (i, field, value) => {
    const newData = [...data];
    newData[i][field] = value;
    onChange(newData);
  };

  const handleChangeOptionPrice = (rowIndex, optIndex, value) => {
    const newData = [...data];
    if(!newData[rowIndex].options) newData[rowIndex].options = [];
    newData[rowIndex].options[optIndex].price = value;
    onChange(newData);
  };

  // Ensure options stay synced if new packageOptions are added (basic sync for new rows)
  return (
    <div className={styles.card} style={{ marginTop: '20px', padding: '15px' }}>
      <h4 className={styles.cardTitle} style={{ fontSize: '1rem' }}>Package Price Compare (Table)</h4>
      {data.map((row, i) => (
        <div key={i} className={styles.responsiveFlexRow}>
          <input placeholder="Row Category (e.g. 2 Sharing)" value={row.category} onChange={e => handleChangeRow(i, 'category', e.target.value)} className={styles.inputField} style={{ width: '200px' }} />
          
          {(row.options || []).map((opt, j) => (
            <div key={j} style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem' }}>{opt.optionName}</span>
              <input type="number" placeholder="Price" value={opt.price} onChange={e => handleChangeOptionPrice(i, j, e.target.value)} className={styles.inputField} style={{ width: '100px' }} />
            </div>
          ))}
          <button type="button" onClick={() => handleRemoveRow(i)} className={styles.btnDanger}>Remove Row</button>
        </div>
      ))}
      <button type="button" onClick={handleAddRow} className={styles.btnSecondary} style={{ marginTop: '10px' }}>+ Add Pricing Row</button>
    </div>
  );
};

const StayDetailsInput = ({ data = [], onChange }) => {
  const handleAddLocation = () => onChange([...data, { locationName: '', nights: '', hotels: [] }]);
  const handleRemoveLocation = (i) => onChange(data.filter((_, idx) => idx !== i));
  const handleChangeLocation = (i, field, val) => {
    const newData = [...data];
    newData[i][field] = val;
    onChange(newData);
  };

  const handleAddHotel = (locIndex) => {
    const newData = [...data];
    if(!newData[locIndex].hotels) newData[locIndex].hotels = [];
    newData[locIndex].hotels.push({ name: '', rating: '', roomType: '', mealPlan: '', image: '' });
    onChange(newData);
  };
  const handleRemoveHotel = (locIndex, hotelIndex) => {
    const newData = [...data];
    newData[locIndex].hotels.splice(hotelIndex, 1);
    onChange(newData);
  };
  const handleChangeHotel = (locIndex, hotelIndex, field, value) => {
    const newData = [...data];
    newData[locIndex].hotels[hotelIndex][field] = value;
    onChange(newData);
  };

  const handleUploadImage = async (e, locIndex, hotelIndex) => {
    const file = e.target.files[0];
    if(!file) return;
    try {
      const res = await uploadFile(file);
      const fullUrl = `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      handleChangeHotel(locIndex, hotelIndex, 'image', fullUrl);
    } catch(err) {
      alert('Upload failed');
    }
  };

  return (
    <div className={styles.card} style={{ marginTop: '20px', padding: '15px' }}>
      <h4 className={styles.cardTitle} style={{ fontSize: '1rem' }}>Stay Details</h4>
      {data.map((loc, i) => (
        <div key={i} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '15px', borderRadius: '5px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input placeholder="Location (e.g. Kuta)" value={loc.locationName} onChange={e => handleChangeLocation(i, 'locationName', e.target.value)} className={styles.inputField} style={{ flex: 1 }} />
            <input type="number" placeholder="Nights" value={loc.nights} onChange={e => handleChangeLocation(i, 'nights', e.target.value)} className={styles.inputField} style={{ width: '100px' }} />
            <button type="button" onClick={() => handleRemoveLocation(i)} className={styles.btnDanger}>Remove Location</button>
          </div>
          
          <div style={{ marginLeft: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '5px' }}>
            <h5>Hotels for {loc.locationName || 'this location'}</h5>
            {(loc.hotels || []).map((hotel, j) => (
              <div key={j} style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap', borderBottom: '1px dashed #ccc', paddingBottom: '10px' }}>
                <input placeholder="Hotel Name" value={hotel.name} onChange={e => handleChangeHotel(i, j, 'name', e.target.value)} className={styles.inputField} style={{ flex: 1 }} />
                <input placeholder="Rating (e.g. 4 * Hotel)" value={hotel.rating} onChange={e => handleChangeHotel(i, j, 'rating', e.target.value)} className={styles.inputField} style={{ width: '120px' }} />
                <input placeholder="Room Type (e.g. Deluxe)" value={hotel.roomType} onChange={e => handleChangeHotel(i, j, 'roomType', e.target.value)} className={styles.inputField} style={{ width: '150px' }} />
                <input placeholder="Meal Plan (e.g. Breakfast)" value={hotel.mealPlan} onChange={e => handleChangeHotel(i, j, 'mealPlan', e.target.value)} className={styles.inputField} style={{ width: '150px' }} />
                
                <div style={{ display: 'flex', gap: '5px', width: '100%' }}>
                  <label style={{ cursor: 'pointer', background: '#3498db', color: 'white', padding: '8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    Upload Image
                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleUploadImage(e, i, j)} />
                  </label>
                  <input placeholder="Image URL" value={hotel.image || ''} readOnly className={styles.inputField} style={{ flex: 1, backgroundColor: '#f9f9f9' }} />
                </div>
                
                <button type="button" onClick={() => handleRemoveHotel(i, j)} className={styles.btnDanger} style={{marginTop: '5px'}}>Remove Hotel</button>
              </div>
            ))}
            <button type="button" onClick={() => handleAddHotel(i)} className={styles.btnSecondary} style={{ fontSize: '0.8rem' }}>+ Add Hotel</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={handleAddLocation} className={styles.btnPrimary}>+ Add Location</button>
    </div>
  );
};

const ManagePackages = ({ destNameProp, hideBasicForm, refreshKey }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const destName = destNameProp || queryParams.get('dest');
  const [trips, setTrips] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showFullForm, setShowFullForm] = useState(false);
  
  const initialForm = {
    title: '', slug: '', duration: '', route: '', destination: destName || '', category: 'Tour Package',
    originalPrice: '', discountedPrice: '', saveAmount: '',
    rating: '5', reviewsCount: '0', image: '', tag: 'Trending', type: 'tour',
    galleryImages: ['', '', '', '', ''], itinerary: [], attractions: [], inclusions: [], exclusions: [], amenities: [], aboutTrip: '',
    departureDates: [], faqs: [], packageOptions: [], pricingTable: [], stayDetails: [],
    quickInfo: { packingList: [], bookFlight: [], knowBeforeYouGo: [], paymentPolicy: [], termsAndConditions: [], cancellationAndRefundPolicy: [] }
  };
  
  const [formData, setFormData] = useState(initialForm);

  // Basic form for initial creation
  const [basicForm, setBasicForm] = useState({ title: '', slug: '', category: 'Tour Package' });

  useEffect(() => {
    fetchTrips();
  }, [destName, refreshKey]);

  useEffect(() => {
    if (location.state?.editTripId && trips.length > 0) {
      const trip = trips.find(t => t._id === location.state.editTripId);
      if (trip && editingId !== trip._id) {
        handleEdit(trip);
        // Clean up React Router state to prevent re-triggering when Close is clicked
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [trips, location.state, editingId, navigate]);

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

  const fetchTrips = async () => {
    const { data } = await getTrips();
    if (destName) {
      setTrips(data.filter(t => t.destination === destName));
    } else {
      setTrips(data);
    }
  };

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    
    if (name === 'title') {
      newFormData.slug = generateSlug(value);
    }

    if (name === 'originalPrice' || name === 'discountedPrice') {
      const orig = Number(newFormData.originalPrice) || 0;
      const disc = Number(newFormData.discountedPrice) || 0;
      newFormData.saveAmount = orig > disc ? orig - disc : 0;
    }
    
    setFormData(newFormData);
  };
  
  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setBasicForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'title' ? { slug: generateSlug(value) } : {})
    }));
  };

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

  const handleBasicSubmit = async (e) => {
    e.preventDefault();
    if(!destName) {
      alert('Please select a destination first from Manage Destinations.');
      return;
    }
    const newTrip = {
      ...initialForm,
      title: basicForm.title,
      slug: basicForm.slug,
      category: basicForm.category,
      destination: destName,
      duration: 'TBD',
      route: 'TBD',
      originalPrice: 0,
      discountedPrice: 0,
      image: 'https://placehold.co/600x400?text=Upload+Image'
    };
    try {
      await createTrip(newTrip);
      setBasicForm({ title: '', slug: '', category: 'Tour Package' });
      fetchTrips();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating package. Make sure the Slug is unique!');
      console.error(error);
    }
  };

  const handleFullSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      const payload = { ...formData };
      if (payload.galleryImages) {
        payload.galleryImages = payload.galleryImages.filter(img => img && img.trim() !== '');
      }
      await updateTrip(editingId, payload);
      setEditingId(null);
      setShowFullForm(false);
    }
    fetchTrips();
    window.scrollTo(0, 0);
  };

  const renderTripCard = (trip) => (
    <div key={trip._id} style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      border: '1px solid #cbd5e1',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'; }}
    >
      <div>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#1e293b', lineHeight: '1.4' }}>{trip.title}</h4>
        <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '15px' }}>
          <div style={{ marginBottom: '6px' }}><strong>Category:</strong> <span style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{trip.category}</span></div>
          <div style={{ marginBottom: '6px' }}><strong>Duration:</strong> {trip.duration || '0 Days'}</div>
          <div style={{ marginBottom: '6px' }}><strong>Price:</strong> <span style={{ color: '#10b981', fontWeight: 'bold' }}>₹{trip.discountedPrice?.toLocaleString('en-IN') || 0}</span> <span style={{textDecoration:'line-through', fontSize:'0.75rem'}}>₹{trip.originalPrice?.toLocaleString('en-IN') || 0}</span></div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => { handleEdit(trip); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ flex: 1, padding: '8px', backgroundColor: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: 'background-color 0.2s' }} onMouseEnter={e => e.target.style.backgroundColor='#dbeafe'} onMouseLeave={e => e.target.style.backgroundColor='#eff6ff'}>Edit / Details</button>
        <button onClick={() => handleDelete(trip._id)} style={{ padding: '8px 12px', backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: 'background-color 0.2s' }} onMouseEnter={e => e.target.style.backgroundColor='#fecaca'} onMouseLeave={e => e.target.style.backgroundColor='#fee2e2'}>Delete</button>
      </div>
    </div>
  );

  const handleEdit = (trip) => {
    setEditingId(trip._id);
    
    let gallery = trip.galleryImages && trip.galleryImages.length > 0 
      ? [...trip.galleryImages] 
      : [''];
    
    setFormData({ ...initialForm, ...trip, galleryImages: gallery });
    setShowFullForm(true);
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure?")) {
      await deleteTrip(id);
      fetchTrips();
    }
  };

  const filteredTrips = trips.filter(trip => {
    const term = searchTerm.toLowerCase();
    return (
      (trip.title && trip.title.toLowerCase().includes(term)) ||
      (trip.destination && trip.destination.toLowerCase().includes(term)) ||
      (trip.category && trip.category.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      {!destNameProp && (
        <h2 className={styles.pageHeader}>
          {destName ? `Packages for: ${destName}` : 'All Packages (Select a Destination to add new)'}
        </h2>
      )}

      {/* BASIC CREATION FORM */}
      {!showFullForm && destName && !hideBasicForm && (
        <form onSubmit={handleBasicSubmit} className={styles.card} style={{ marginBottom: '20px' }}>
          <h3 className={styles.cardTitle}>Create New Package</h3>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Package Title</label>
              <input name="title" value={basicForm.title} onChange={handleBasicChange} placeholder="e.g. Phu Quoc Tour" required className={styles.inputField} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Slug</label>
              <input name="slug" value={basicForm.slug} onChange={handleBasicChange} placeholder="e.g. phu-quoc-tour" required className={styles.inputField} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Category</label>
              <select name="category" value={basicForm.category} onChange={handleBasicChange} required className={styles.inputField}>
                <option value="Flight Package">Flight Package</option>
                <option value="Tour Package">Tour Package</option>
                <option value="Group Trip">Group Trip</option>
                <option value="Honeymoon">Honeymoon</option>
                <option value="Unique Experience">Unique Experience</option>
              </select>
            </div>
            <div className={styles.inputGroup} style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className={styles.btnPrimary} style={{ height: '40px' }}>Create Package</button>
            </div>
          </div>
        </form>
      )}

      {/* FULL DETAILS FORM (MODAL POPUP) */}
      {showFullForm && (
        <div className={styles.modalOverlay} onClick={() => { setShowFullForm(false); setEditingId(null); navigate(location.pathname, { replace: true, state: {} }); }} style={{ padding: '20px', zIndex: 1100 }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1200px', width: '100%', maxHeight: '95vh', overflowY: 'auto', padding: 0 }}>
            <form onSubmit={handleFullSubmit} style={{ margin: 0 }}>
              <div style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10, padding: '20px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className={styles.cardTitle} style={{ margin: 0, fontSize: '1.5rem', borderBottom: 'none', paddingBottom: 0 }}>
                  Filling Details for: <span style={{ color: '#3b82f6', textTransform: 'capitalize' }}>{formData.destination}</span> 
                </h3>
                <button type="button" onClick={() => { setShowFullForm(false); setEditingId(null); navigate(location.pathname, { replace: true, state: {} }); }} className={styles.btnDanger} style={{ borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold' }}>Close</button>
              </div>
              <div style={{ padding: '30px', backgroundColor: '#f8fafc' }}>
                <div className={styles.card} style={{ marginBottom: '20px' }}>
                  <div className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Title</label>
            <input name="title" value={formData.title} onChange={handleChange} placeholder="Trip Title" required className={styles.inputField} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Slug</label>
            <input name="slug" value={formData.slug || ''} onChange={handleChange} placeholder="slug (e.g. bali-tour)" required className={styles.inputField} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Destination</label>
            <input name="destination" value={formData.destination || ''} readOnly className={styles.inputField} style={{ backgroundColor: '#f1f5f9', color: '#64748b' }} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Duration</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input 
                  type="number" 
                  placeholder="Days" 
                  value={formData.duration ? formData.duration.match(/(\d+)\s*Days?/)?.[1] || '' : ''} 
                  onChange={(e) => {
                    const days = e.target.value;
                    const nights = formData.duration?.match(/(\d+)\s*Nights?/)?.[1] || '';
                    handleChange({ target: { name: 'duration', value: `${days} Days ${nights} Nights` } });
                  }} 
                  required 
                  className={styles.inputField} 
                  style={{ width: '80px' }}
                />
                <span>Days</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input 
                  type="number" 
                  placeholder="Nights" 
                  value={formData.duration ? formData.duration.match(/(\d+)\s*Nights?/)?.[1] || '' : ''} 
                  onChange={(e) => {
                    const nights = e.target.value;
                    const days = formData.duration?.match(/(\d+)\s*Days?/)?.[1] || '';
                    handleChange({ target: { name: 'duration', value: `${days} Days ${nights} Nights` } });
                  }} 
                  required 
                  className={styles.inputField} 
                  style={{ width: '80px' }}
                />
                <span>Nights</span>
              </div>
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Route</label>
            <input name="route" value={formData.route} onChange={handleChange} placeholder="Route (e.g. Delhi - Manali - Delhi)" required className={styles.inputField} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Original Price</label>
            <input name="originalPrice" type="number" value={formData.originalPrice} onChange={handleChange} placeholder="Original Price" required className={styles.inputField} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Discounted Price</label>
            <input name="discountedPrice" type="number" value={formData.discountedPrice} onChange={handleChange} placeholder="Discounted Price" required className={styles.inputField} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Save Amount (Auto Calculated)</label>
            <input name="saveAmount" type="number" value={formData.saveAmount} readOnly placeholder="Auto Calculated" className={styles.inputField} style={{ backgroundColor: '#f0f0f0', color: '#666' }} />
          </div>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.inputLabel}>Cover Image</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <label style={{ cursor: 'pointer', background: '#3498db', color: 'white', padding: '8px', borderRadius: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                Upload Image
                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleUploadMainImage} />
              </label>
              <input name="image" value={formData.image} onChange={handleChange} placeholder="Cover Image URL" required className={styles.inputField} style={{ flex: 1, backgroundColor: '#f9f9f9' }} />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Tag</label>
            <input name="tag" value={formData.tag} onChange={handleChange} placeholder="Tag (e.g. Bestseller)" className={styles.inputField} />
          </div>
        </div>

        <StringArrayInput title="Gallery Images (Max 5 Images)" isImage={true} maxItems={5} data={formData.galleryImages} onChange={(d) => setFormData({...formData, galleryImages: d})} />
        
        <PackageOptionsInput data={formData.packageOptions} onChange={(d) => setFormData({...formData, packageOptions: d})} />
        
        <ArrayInput 
          title="Departure Dates" 
          fields={[
            { name: 'start', type: 'date', placeholder: 'Start Date' },
            { name: 'end', type: 'date', placeholder: 'End Date' },
            { name: 'status', type: 'select', options: ['Available', 'Filling Fast', 'Sold Out'] },
            { name: 'price', type: 'number', placeholder: 'Price' }
          ]} 
          data={formData.departureDates || []} 
          onChange={(d) => setFormData({...formData, departureDates: d})} 
        />

        <PricingTableInput data={formData.pricingTable} packageOptions={formData.packageOptions} onChange={(d) => setFormData({...formData, pricingTable: d})} />

        <StayDetailsInput data={formData.stayDetails} onChange={(d) => setFormData({...formData, stayDetails: d})} />
        
        <ArrayInput 
          title="Itinerary" 
          fields={[
            {name: 'day', placeholder: 'Day'}, 
            {name: 'title', placeholder: 'Title'}, 
            {name: 'desc', type: 'textarea', placeholder: 'Description (Enter for bullets)'},
            {name: 'image', placeholder: 'Image URL'}
          ]} 
          data={formData.itinerary} 
          onChange={(d) => setFormData({...formData, itinerary: d})} 
        />
        <StringArrayInput title="Inclusions" data={formData.inclusions} onChange={(d) => setFormData({...formData, inclusions: d})} />
        <StringArrayInput title="Exclusions" data={formData.exclusions} onChange={(d) => setFormData({...formData, exclusions: d})} />
        <AmenitiesCheckboxInput data={formData.amenities} onChange={(d) => setFormData({...formData, amenities: d})} />
          
        <div className={styles.formGroup}>
          <label className={styles.label}>About Trip (Description)</label>
          <textarea 
            name="aboutTrip"
            value={formData.aboutTrip || ''}
            onChange={handleChange}
            className={styles.inputField}
            rows={4}
            style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
            placeholder="Enter trip description for the 'About this Trip' section..."
          />
        </div>

        <ArrayInput title="FAQs" fields={['q', 'a']} data={formData.faqs} onChange={(d) => setFormData({...formData, faqs: d})} />

        <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <h4>Quick Info Section</h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '15px' }}>Fields left empty will not be displayed on the frontend.</p>
          <div className={styles.formGrid}>
            {[
              { key: 'packingList', label: 'Packing List' },
              { key: 'bookFlight', label: 'Book a Flight' },
              { key: 'knowBeforeYouGo', label: 'Know Before You Go' },
              { key: 'paymentPolicy', label: 'Payment Policy' },
              { key: 'termsAndConditions', label: 'Terms and Conditions' },
              { key: 'cancellationAndRefundPolicy', label: 'Cancellation and Refund Policy' }
            ].map(info => (
              <div key={info.key} style={{ gridColumn: '1 / -1', marginBottom: '20px' }}>
                <StringArrayInput 
                  title={info.label} 
                  data={formData.quickInfo?.[info.key] || []} 
                  onChange={(d) => setFormData({
                    ...formData,
                    quickInfo: { ...formData.quickInfo, [info.key]: d }
                  })} 
                />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.btnGroup} style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => { setShowFullForm(false); setEditingId(null); navigate(location.pathname, { replace: true, state: {} }); }} className={styles.btnSecondary} style={{ marginRight: '15px' }}>Cancel</button>
          <button type="submit" className={styles.btnPrimary} style={{ padding: '12px 30px', fontSize: '1.1rem' }}>
            Save Full Details
          </button>
        </div>
              </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {!hideBasicForm && <hr className={styles.sectionDivider} />}
       <div style={{ marginBottom: '30px' }}>
        <input 
          type="text" 
          placeholder="Search by package name, destination, or category..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className={styles.inputField}
          style={{ width: '100%', maxWidth: '400px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
        />
      </div>

      {destNameProp ? (
        // Render as simple grid for single destination popup
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredTrips.map(renderTripCard)}
        </div>
      ) : (
        // Group by destination for "All Packages" view
        <div>
          {Object.entries(
            filteredTrips.reduce((acc, trip) => {
              const dest = trip.destination || 'Unassigned';
              if (!acc[dest]) acc[dest] = [];
              acc[dest].push(trip);
              return acc;
            }, {})
          ).sort(([a], [b]) => a.localeCompare(b)).map(([dest, trips]) => (
            <div key={dest} style={{ marginBottom: '40px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.3rem', color: '#0f172a', margin: 0 }}>
                  Destination: <span style={{ color: '#3b82f6' }}>{dest}</span>
                </h3>
                <span style={{ marginLeft: '12px', backgroundColor: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {trips.length} Packages
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {trips.map(renderTripCard)}
              </div>
            </div>
          ))}
          {filteredTrips.length === 0 && (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>No packages found matching your criteria.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManagePackages;
