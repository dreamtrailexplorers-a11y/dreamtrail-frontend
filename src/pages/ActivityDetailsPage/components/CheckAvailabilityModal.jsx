import React, { useEffect } from 'react';
import styles from './CheckAvailabilityModal.module.css';

const CheckAvailabilityModal = ({ isOpen, onClose, activityTitle, activityLocation, image }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* Left Side: Image */}
        <div className={styles.imageSection}>
          <img src={image} alt={activityTitle} className={styles.modalImage} />
          <div className={styles.imageOverlay}>
            <p className={styles.imageLocation}>{activityLocation}</p>
            <h3 className={styles.imageTitle}>{activityTitle}</h3>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className={styles.formSection}>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
          
          <h2 className={styles.formTitle}>Plan Your Next Activity</h2>
          
          <form className={styles.bookingForm} onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Your Name" className={styles.inputField} />
            
            <div className={styles.phoneInputGroup}>
              <select className={styles.countryCode}>
                <option value="+91">+91</option>
              </select>
              <input type="tel" placeholder="Mobile No." className={styles.inputField} style={{ flex: 1 }} />
            </div>

            <input type="email" placeholder="Email (optional)" className={styles.inputField} />
            
            <div className={styles.rowInputs}>
              <input type="text" placeholder="Date of Travel" className={styles.inputField} onFocus={(e) => e.target.type = 'date'} onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }} />
              <input type="number" placeholder="Traveller Count" className={styles.inputField} min="1" />
            </div>

            <textarea placeholder="Message (optional)" className={styles.textareaField}></textarea>
            
            <button type="submit" className={styles.submitBtn}>Check Availability</button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default CheckAvailabilityModal;
