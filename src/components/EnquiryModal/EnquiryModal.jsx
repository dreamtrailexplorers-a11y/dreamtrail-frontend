import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiX, FiCalendar, FiUsers, FiCheckCircle } from 'react-icons/fi';
import styles from './EnquiryModal.module.css';

import { submitEnquiry } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const EnquiryModal = ({ isOpen, onClose, trip, selectedOptionTitle, selectedDepartureDate }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    travellers: '',
    message: ''
  });

  if (!isOpen) return null;

  const defaultTrip = {
    title: "Spiti Valley Bike Trip",
    duration: "8 Days 7 Nights",
    route: "Delhi - Chitkul - Kaza - Chandratal - Manali - Delhi",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80"
  };

  const activeTrip = trip || defaultTrip;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const finalTitle = selectedOptionTitle && selectedOptionTitle !== activeTrip.title 
        ? `${activeTrip.title} (${selectedOptionTitle})` 
        : activeTrip.title;

      await submitEnquiry({
        ...formData,
        tripTitle: finalTitle,
        tripRoute: activeTrip.route,
        destination: activeTrip.destination?.name || activeTrip.destination || '',
        departureDate: selectedDepartureDate ? `${selectedDepartureDate.start} to ${selectedDepartureDate.end}` : ''
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit enquiry', error);
      alert('Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div 
        className={styles.modalContent} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className={styles.closeBtn} onClick={handleResetAndClose} aria-label="Close Modal">
          <FiX size={20} />
        </button>

        <div className={styles.modalGrid}>
          {/* Left Column: Trip Image & Info Overlay */}
          <div className={styles.imageColumn}>
            <img 
              src={activeTrip.image} 
              alt={activeTrip.title} 
              className={styles.tripImage} 
            />
            <div className={styles.imageOverlay}>
              <span className={styles.durationBadge}>{activeTrip.duration}</span>
              <h3 className={styles.tripTitle}>{activeTrip.title}</h3>
              <p className={styles.tripRoute}>{activeTrip.route}</p>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className={styles.formColumn}>
            {!submitted ? (
              <>
                <h2 className={styles.formHeading}>Plan Your Next Trip</h2>
                <form onSubmit={handleSubmit} className={styles.enquiryForm}>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={styles.inputField}
                    />
                  </div>

                  <div className={styles.phoneGroup}>
                    <span className={styles.countryCode}>+91</span>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Mobile No."
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className={styles.phoneInput}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email (optional)"
                      value={formData.email}
                      onChange={handleChange}
                      className={styles.inputField}
                    />
                  </div>

                  <div className={styles.doubleRow}>
                    <div className={styles.inputWithIcon}>
                      <input
                        type="text"
                        name="date"
                        placeholder="Date of Travel"
                        onFocus={(e) => (e.target.type = 'date')}
                        onBlur={(e) => {
                          if (!e.target.value) e.target.type = 'text';
                        }}
                        value={formData.date}
                        onChange={handleChange}
                        className={styles.inputField}
                      />
                      <FiCalendar className={styles.fieldIcon} />
                    </div>

                    <div className={styles.inputWithIcon}>
                      <input
                        type="number"
                        name="travellers"
                        min="1"
                        placeholder="Traveller Count"
                        value={formData.travellers}
                        onChange={handleChange}
                        className={styles.inputField}
                      />
                      <FiUsers className={styles.fieldIcon} />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <textarea
                      name="message"
                      rows="3"
                      placeholder="Message (optional)"
                      value={formData.message}
                      onChange={handleChange}
                      className={styles.textareaField}
                    ></textarea>
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? 'Submitting...' : 'Connect with Expert'}
                  </button>
                </form>
              </>
            ) : (
              <div className={styles.successWrapper}>
                <FiCheckCircle className={styles.successIcon} />
                <h3 className={styles.successTitle}>Enquiry Submitted!</h3>
                <p className={styles.successDesc}>
                  Thank you, <strong>{formData.name || 'Traveller'}</strong>! Our travel expert will connect with you within 30 minutes to plan your trip.
                </p>
                <button className={styles.submitBtn} onClick={handleResetAndClose}>
                  Back to Trip
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnquiryModal;
