import React, { useState, useEffect } from 'react';
import { getDestinations, createDestination, updateDestination, deleteDestination, getTrips, uploadFile, createTrip } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import styles from './Admin.module.css';
import FillDestinationDetail from './FillDestinationDetail'; // import the component
import { iconMap, iconNamesMap } from '../../utils/iconMap';

const ManageDestinations = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [trips, setTrips] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDestName, setNewDestName] = useState('');
  const [newDestType, setNewDestType] = useState('domestic');
  const [newDestIcon, setNewDestIcon] = useState('TbBuildingSkyscraper');
  const [newDestImage, setNewDestImage] = useState('');
  const [newDestWhyUs, setNewDestWhyUs] = useState([]);
  
  // State for Edit popup
  const [editingDestId, setEditingDestId] = useState(null);
  
  // State for Add Package popup
  const [addingPackageToDest, setAddingPackageToDest] = useState(null);
  const [packageForm, setPackageForm] = useState({ title: '', slug: '', category: 'Tour Package', image: '' });

  // State for Why Choose Us popup
  const [whyUsDest, setWhyUsDest] = useState(null);
  const [whyUsData, setWhyUsData] = useState([]);

  useEffect(() => {
    fetchDestinations();
  }, [editingDestId]); // Re-fetch destinations if the edit popup closes to reflect changes

  const handleOpenModal = () => {
    const iconKeys = Object.keys(iconMap);
    const randomIcon = iconKeys[Math.floor(Math.random() * iconKeys.length)];
    setNewDestIcon(randomIcon);
    setNewDestName('');
    setNewDestType('domestic');
    setNewDestImage('');
    setNewDestWhyUs([]);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadFile(file);
      const fullUrl = res.data.url.startsWith('http') ? res.data.url : `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      setNewDestImage(fullUrl);
    } catch (err) {
      console.error(err);
      alert('Image upload failed');
    }
  };

  const handlePackageImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadFile(file);
      const fullUrl = res.data.url.startsWith('http') ? res.data.url : `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      setPackageForm(prev => ({ ...prev, image: fullUrl }));
    } catch (err) {
      console.error(err);
      alert('Image upload failed');
    }
  };

  const fetchDestinations = async () => {
    try {
      const [{ data: destData }, { data: tripsData }] = await Promise.all([
        getDestinations(),
        getTrips()
      ]);
      setDestinations(destData);
      setTrips(tripsData);
    } catch (err) {
      console.error('Error fetching data', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      await deleteDestination(id);
      fetchDestinations();
    }
  };

  const handleSaveWhyUs = async () => {
    try {
      await updateDestination(whyUsDest._id, { whyChooseUs: whyUsData });
      setWhyUsDest(null);
      fetchDestinations();
    } catch (err) {
      console.error(err);
      alert('Failed to save Why Choose Us data');
    }
  };

  const handleCreateDestination = async (e) => {
    e.preventDefault();
    if (!newDestName.trim()) return;
    try {
      const destData = { 
        name: newDestName,
        image: newDestImage || '',
        type: newDestType,
        icon: newDestIcon,
        whyChooseUs: newDestWhyUs
      };
      await createDestination(destData);
      setIsModalOpen(false);
      setNewDestName('');
      setNewDestType('domestic');
      setNewDestImage('');
      setNewDestWhyUs([]);
      // Refresh the list instead of opening the edit popup
      fetchDestinations();
    } catch (err) {
      console.error(err);
      alert('Error creating destination: ' + (err.response?.data?.message || err.message));
    }
  };

  // === 03-Aug-2026: Commenting out the small Add Package modal logic as requested ===
  /*
  const handleAddPackage = async (e) => {
    e.preventDefault();
    if (!packageForm.title || !packageForm.slug) return;
    try {
      const newTrip = {
        title: packageForm.title,
        slug: packageForm.slug,
        category: packageForm.category,
        destination: addingPackageToDest.name,
        duration: 'TBD', route: 'TBD', originalPrice: 0, discountedPrice: 0,
        image: packageForm.image || addingPackageToDest.image || '',
        tag: 'Trending', type: 'tour', rating: '5', reviewsCount: '0'
      };
      await createTrip(newTrip);
      setPackageForm({ title: '', slug: '', category: 'Tour Package', image: '' });
      setAddingPackageToDest(null);
      fetchDestinations();
      alert('Package Created Successfully!');
    } catch(err) {
      alert('Error creating package: ' + (err.response?.data?.message || err.message));
    }
  };
  */

  // === 03-Aug-2026: New logic to open full details page directly ===
  const handleAddPackageClick = (dest) => {
    try {
      navigate('/admin/all-packages', { state: { createForDestination: dest.name, destImage: dest.image || '' } });
    } catch(err) {
      alert('Error creating package: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 className={styles.pageHeader} style={{ margin: 0, border: 'none', padding: 0 }}>Manage Destinations</h2>
        <button onClick={handleOpenModal} className={styles.btnPrimary}>
          + Add New Destination
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {destinations.map(dest => {
          const packageCount = trips.filter(t => t.destination === dest.name).length;
          
          return (
            <div key={dest._id} style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
            }}>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '50px', height: '50px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#3b82f6',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px'
                  }}>
                    {iconMap[dest.icon] || iconMap['TbBuildingSkyscraper']}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#1e293b' }}>{dest.name}</h3>
                    <span className={styles.badge} style={{ fontSize: '0.7rem' }}>{dest.type}</span>
                  </div>
                </div>
              </div>

              <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
                <div style={{ marginBottom: '8px' }}><strong>Packages:</strong> <span style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', color: '#334155', fontWeight: '600' }}>{packageCount}</span></div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button 
                    onClick={() => setEditingDestId(dest._id)} 
                    style={{ flex: 1, padding: '10px 4px', fontSize: '0.85rem', backgroundColor: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#bae6fd'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#e0f2fe'}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleAddPackageClick(dest)} 
                    style={{ flex: 1, padding: '10px 4px', fontSize: '0.85rem', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#a7f3d0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#ecfdf5'}
                  >
                    Add Package
                  </button>
                  <button 
                    onClick={() => {
                      setWhyUsDest(dest);
                      setWhyUsData(dest.whyChooseUs || []);
                    }} 
                    style={{ padding: '10px 8px', fontSize: '0.85rem', backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#fde68a'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#fef3c7'}
                    title="Why Choose Us Info"
                  >
                    ℹ️
                  </button>
                  <button 
                    onClick={() => handleDelete(dest._id)} 
                    style={{ padding: '10px 8px', fontSize: '0.85rem', backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#fecaca'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#fee2e2'}
                  >
                    Delete
                  </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* EDIT / CREATE FULL POPUP */}
      {editingDestId && (
        <div className={styles.modalOverlay} onClick={() => setEditingDestId(null)} style={{ padding: '20px', zIndex: 1050 }}>
          <div 
            className={styles.modalContent} 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '900px', width: '100%', maxHeight: '95vh', overflowY: 'auto', padding: '20px' }}
          >
            <FillDestinationDetail destId={editingDestId} onClose={() => setEditingDestId(null)} />
          </div>
        </div>
      )}

      {/* ADD DESTINATION MODAL */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className={styles.cardTitle} style={{ borderBottom: 'none', marginBottom: '10px', paddingBottom: 0 }}>Add New Destination</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '25px' }}>Enter the name and type of the new destination you want to add.</p>
            <form onSubmit={handleCreateDestination}>
              <div className={styles.inputGroup} style={{ marginBottom: '15px' }}>
                <label className={styles.inputLabel}>Destination Name</label>
                <input 
                  value={newDestName} 
                  onChange={(e) => setNewDestName(e.target.value)} 
                  placeholder="e.g. Bali, Manali, Dubai" 
                  required 
                  className={styles.inputField} 
                  autoFocus
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Destination Type</label>
                <select 
                  value={newDestType}
                  onChange={(e) => setNewDestType(e.target.value)}
                  className={styles.inputField}
                  required
                >
                  <option value="domestic">Domestic</option>
                  <option value="international">International</option>
                </select>
              </div>
              
              <div className={styles.inputGroup} style={{ marginTop: '15px' }}>
                  <label className={styles.inputLabel}>Cover Image (Required)</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label style={{ cursor: 'pointer', backgroundColor: '#3b82f6', color: 'white', padding: '10px 15px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                      Upload Photo
                      <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
                    </label>
                    <input 
                      value={newDestImage} 
                      onChange={(e) => setNewDestImage(e.target.value)} 
                      placeholder="Or enter image URL"
                      required
                      className={styles.inputField} 
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup} style={{ marginTop: '15px' }}>
                <label className={styles.inputLabel}>Select Icon</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '10px', maxHeight: '150px', overflowY: 'auto', padding: '5px' }}>
                  {Object.keys(iconMap).map(iconName => (
                      <div 
                        key={iconName}
                        onClick={() => setNewDestIcon(iconName)}
                        style={{
                          padding: '8px 4px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: '5px',
                          border: newDestIcon === iconName ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          backgroundColor: newDestIcon === iconName ? '#eff6ff' : '#fff',
                          color: newDestIcon === iconName ? '#3b82f6' : '#475569'
                        }}
                        title={iconNamesMap[iconName] || iconName}
                      >
                        <div style={{ fontSize: '1.5rem' }}>{iconMap[iconName]}</div>
                        <span style={{ fontSize: '0.65rem', textAlign: 'center', lineHeight: '1.1' }}>{iconNamesMap[iconName] || iconName}</span>
                      </div>
                  ))}
                </div>
              </div>

              <div className={styles.inputGroup} style={{ marginTop: '15px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                <label className={styles.inputLabel}>Why Choose Us (Optional)</label>
                {newDestWhyUs.map((item, index) => (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>Item {index + 1}</span>
                      <button type="button" onClick={() => setNewDestWhyUs(newDestWhyUs.filter((_, i) => i !== index))} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Remove</button>
                    </div>
                    <input 
                      type="text" 
                      value={item.title} 
                      onChange={(e) => {
                        const newData = [...newDestWhyUs];
                        newData[index].title = e.target.value;
                        setNewDestWhyUs(newData);
                      }}
                      placeholder="Title (e.g., Most Experienced Company)"
                      className={styles.inputField}
                      style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                    />
                    <textarea 
                      value={item.description} 
                      onChange={(e) => {
                        const newData = [...newDestWhyUs];
                        newData[index].description = e.target.value;
                        setNewDestWhyUs(newData);
                      }}
                      placeholder="Description..."
                      className={styles.inputField}
                      rows={2}
                      style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                    />
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={() => setNewDestWhyUs([...newDestWhyUs, { title: '', description: '' }])}
                  style={{ width: '100%', padding: '8px', backgroundColor: '#f1f5f9', color: '#3b82f6', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                >
                  + Add Item
                </button>
              </div>

              <div className={styles.btnGroup} style={{ marginTop: '25px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.btnSecondary}>Cancel</button>
                <button type="submit" className={styles.btnPrimary}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === 03-Aug-2026: Commenting out the small ADD PACKAGE MODAL UI ===
      {addingPackageToDest && (
        <div className={styles.modalOverlay} onClick={() => setAddingPackageToDest(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h3 className={styles.cardTitle} style={{ borderBottom: 'none', marginBottom: '10px', paddingBottom: 0 }}>
              Add Package to {addingPackageToDest.name}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '25px' }}>Fill basic details to instantly create a new package inside this destination.</p>
            <form onSubmit={handleAddPackage} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Package Title</label>
                <input 
                  value={packageForm.title} 
                  onChange={(e) => setPackageForm({...packageForm, title: e.target.value})} 
                  placeholder="e.g. Phu Quoc Tour" 
                  className={styles.inputField} 
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Package Slug</label>
                <input 
                  value={packageForm.slug} 
                  onChange={(e) => setPackageForm({...packageForm, slug: e.target.value})} 
                  placeholder="e.g. phu-quoc-tour" 
                  className={styles.inputField} 
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Category</label>
                <select 
                  value={packageForm.category} 
                  onChange={(e) => setPackageForm({...packageForm, category: e.target.value})} 
                  className={styles.inputField}
                >
                  <option value="Motorcycle Tours">Motorcycle Tours</option>
                  <option value="Group Tours">Group Tours</option>
                  <option value="Winter Tours">Winter Tours</option>
                  <option value="Corporate Tours">Corporate Tours</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Package Cover Image</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label style={{ cursor: 'pointer', backgroundColor: '#3b82f6', color: 'white', padding: '10px 15px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    Upload Photo
                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handlePackageImageUpload} />
                  </label>
                  <input 
                    value={packageForm.image} 
                    onChange={(e) => setPackageForm({...packageForm, image: e.target.value})} 
                    placeholder="Or enter image URL"
                    className={styles.inputField} 
                    style={{ flex: 1 }}
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Leave empty to use the destination's cover image.</p>
              </div>
              <div className={styles.btnGroup} style={{ marginTop: '25px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setAddingPackageToDest(null)} className={styles.btnSecondary}>Cancel</button>
                <button type="submit" className={styles.btnPrimary} style={{ backgroundColor: '#059669', borderColor: '#059669' }}>Create Package</button>
              </div>
            </form>
          </div>
        </div>
      )}
      */}
      {/* Why Choose Us Modal */}
      {whyUsDest && (
        <div className={styles.modalOverlay} style={{ zIndex: 9999 }}>
          <div className={styles.modalContent} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '20px' }}>Why Choose Us For {whyUsDest.name}</h3>
            
            {whyUsData.map((item, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Item {index + 1}</h4>
                  <button onClick={() => setWhyUsData(whyUsData.filter((_, i) => i !== index))} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Remove</button>
                </div>
                <input 
                  type="text" 
                  value={item.title} 
                  onChange={(e) => {
                    const newData = [...whyUsData];
                    newData[index].title = e.target.value;
                    setWhyUsData(newData);
                  }}
                  placeholder="Title (e.g., Most Experienced Company)"
                  className={styles.inputField}
                />
                <textarea 
                  value={item.description} 
                  onChange={(e) => {
                    const newData = [...whyUsData];
                    newData[index].description = e.target.value;
                    setWhyUsData(newData);
                  }}
                  placeholder="Description..."
                  className={styles.inputField}
                  rows={3}
                />
              </div>
            ))}

            <button 
              onClick={() => setWhyUsData([...whyUsData, { title: '', description: '' }])}
              style={{ width: '100%', padding: '12px', backgroundColor: '#f1f5f9', color: '#3b82f6', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginBottom: '20px' }}
            >
              + Add New Item
            </button>

            <div className={styles.btnGroup} style={{ justifyContent: 'flex-end' }}>
              <button onClick={() => setWhyUsDest(null)} className={styles.btnSecondary}>Cancel</button>
              <button onClick={handleSaveWhyUs} className={styles.btnPrimary}>Save Details</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageDestinations;
