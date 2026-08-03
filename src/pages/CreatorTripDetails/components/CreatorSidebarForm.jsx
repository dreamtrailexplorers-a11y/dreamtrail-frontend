import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdVerified } from 'react-icons/md';
import { FiCalendar, FiUsers } from 'react-icons/fi';
import styles from './CreatorSidebarForm.module.css';
import { submitEnquiry } from '../../../services/api';
import BuyNowModal from '../../../components/BuyNowModal/BuyNowModal';
import { AuthContext } from '../../../context/AuthContext';

const CreatorSidebarForm = ({ trip }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    travelMonth: '',
    noOfPeople: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setStatus({ type: 'loading', msg: 'Submitting...' });
    try {
      const enquiryPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: formData.travelMonth,
        travellers: formData.noOfPeople,
        message: formData.message,
        tripTitle: trip?.title || 'Creator Trip Enquiry',
        tripRoute: 'Creator Trip',
        destination: trip?.destination?.name || trip?.destination || ''
      };
      await submitEnquiry(enquiryPayload);
      setStatus({ type: 'success', msg: 'Enquiry submitted successfully!' });
      setFormData({
        name: '',
        email: '',
        phone: '',
        travelMonth: '',
        noOfPeople: '',
        message: ''
      });
      setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', msg: 'Failed to submit enquiry. Please try again.' });
    }
  };

  return (
    <div className={styles.stickySidebar}>
      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <h3 className={styles.formTitle}>{trip?.title || "Creator Trip"}</h3>
          <p className={styles.formSubtitle}>
            Travel With {trip?.curatorName || "Creator"} <MdVerified className={styles.verifiedIcon} />
          </p>
        </div>

        <form className={styles.enquiryForm} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className={styles.input} />
          </div>
          
          <div className={styles.inputGroup}>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Id" required className={styles.input} />
          </div>
          
          <div className={styles.inputGroup}>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone No." required className={styles.input} />
          </div>

          <div className={styles.rowGrid}>
            <div className={styles.inputGroup}>
              <input type="month" name="travelMonth" value={formData.travelMonth} onChange={handleChange} placeholder="Travel Month" className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.inputWithIcon}>
                <input type="number" name="noOfPeople" value={formData.noOfPeople} onChange={handleChange} placeholder="No of People" className={styles.input} min="1" />
                <FiUsers className={styles.inputIcon} />
              </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Message" rows="3" className={styles.textarea}></textarea>
          </div>

          {status.msg && (
            <div className={status.type === 'success' ? styles.successMsg : status.type === 'error' ? styles.errorMsg : styles.loadingMsg}>
              {status.msg}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className={styles.submitBtn} disabled={status.type === 'loading'} style={{ flex: 1, fontSize: '0.95rem', width: 'auto' }}>
              {status.type === 'loading' ? 'Sending...' : 'Send Enquiry'}
            </button>
            <button 
              type="button"
              onClick={() => setIsBuyModalOpen(true)}
              style={{ 
                flex: 1, 
                backgroundColor: '#ffffff', 
                color: '#e60000', 
                border: '1px solid #e60000', 
                padding: '0.85rem', 
                borderRadius: '8px', 
                fontSize: '0.95rem', 
                fontWeight: '800', 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px rgba(230, 0, 0, 0.1)'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fff0f0'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Buy Now
            </button>
          </div>
        </form>
      </div>

      <BuyNowModal 
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        tripTitle={trip?.title || 'Creator Trip'}
        pricePerPerson={trip?.discountedPrice || 0}
        duration={trip?.duration || 'N/A'}
        destination={trip?.destination?.name || 'N/A'}
      />
    </div>
  );
};

export default CreatorSidebarForm;
