import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDestinations, createTrip } from '../../services/api';
import styles from './Admin.module.css';

const CreatePackage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedDest = queryParams.get('dest') || '';

  const [destinations, setDestinations] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Tour Package',
    destination: preselectedDest,
    duration: 'TBD',
    route: 'TBD',
    originalPrice: 0,
    discountedPrice: 0,
    image: 'https://via.placeholder.com/150',
  });

  useEffect(() => {
    const fetchDestinations = async () => {
      const { data } = await getDestinations();
      setDestinations(data);
    };
    fetchDestinations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTrip(formData);
      navigate('/admin/destinations');
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating package');
    }
  };

  return (
    <div className={styles.card} style={{ maxWidth: '600px', margin: 'auto' }}>
      <h3 className={styles.cardTitle}>Create New Package</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Package Title</label>
            <input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Bali Adventure" required className={styles.inputField} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Slug</label>
            <input name="slug" value={formData.slug} onChange={handleChange} placeholder="e.g. bali-adventure" required className={styles.inputField} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className={styles.inputField}>
              <option value="Motorcycle Tours">Motorcycle Tours</option>
              <option value="Group Tours">Group Tours</option>
              <option value="Winter Tours">Winter Tours</option>
              <option value="Corporate Tours">Corporate Tours</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Destination</label>
            <select name="destination" value={formData.destination} onChange={handleChange} className={styles.inputField} required>
              <option value="" disabled>Select Destination</option>
              {destinations.map((dest) => (
                <option key={dest._id} value={dest.name}>{dest.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.btnGroup} style={{ marginTop: '20px' }}>
          <button type="submit" className={styles.btnPrimary}>Create Package</button>
          <button type="button" className={styles.btnSecondary} onClick={() => navigate('/admin/destinations')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default CreatePackage;
