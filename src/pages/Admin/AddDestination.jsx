import React, { useState } from 'react';
import { createDestination, uploadFile } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import styles from './Admin.module.css';



const AddDestination = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;

    const formData = {
      name: name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      image: '',
      type: 'domestic',
      aboutText: '',
      handpickedHotels: [], curatedExperiences: [], placesToVisit: [], citiesList: [], faqs: [], popularCities: []
    };

    await createDestination(formData);
    navigate('/admin/destinations');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 className={styles.pageHeader} style={{ margin: 0, border: 'none', padding: 0 }}>Add New Destination</h2>
        <button onClick={() => navigate('/admin/destinations')} className={styles.btnSecondary}>Back to Destinations</button>
      </div>

      <form onSubmit={handleSubmit} className={styles.card} style={{ maxWidth: '500px' }}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Destination Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bali, Manali, Dubai" required className={styles.inputField} />
        </div>
        
        <div className={styles.btnGroup} style={{ marginTop: '25px' }}>
          <button type="submit" className={styles.btnPrimary} style={{ width: '100%' }}>
            Create Destination
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDestination;
