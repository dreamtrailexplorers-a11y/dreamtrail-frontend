import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { getSiteSettings, submitEnquiry } from '../../services/api';
import styles from './ContactUs.module.css';

const ContactUs = () => {
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchSettings = async () => {
      try {
        const res = await getSiteSettings();
        setSettings(res.data);
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'message' && value.length > 200) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        tripTitle: 'General Contact'
      };
      await submitEnquiry(payload);
      setSuccess(true);
      setFormData({ name: '', phone: '', email: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to submit form', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.subtitle}>
            We're here to assist you with your travel plans. Please fill out the form below and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className={styles.contentWrapper}>
          {/* Info Section */}
          <div className={styles.infoSection}>
            <h2 className={styles.companyName}>Avian Experiences Pvt. Ltd.</h2>
            
            <div className={styles.infoBlock}>
              <div className={styles.infoLabel}>Email:</div>
              <div className={styles.infoText}>
                {settings?.email || 'info@avianexperiences.com'}
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.infoLabel}>Mobile:</div>
              <div className={styles.infoText}>
                +91 {settings?.whatsappNumber || '9099599331'}
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.infoLabel}>Address:</div>
              <div className={styles.infoText} style={{ whiteSpace: 'pre-line' }}>
                {settings?.address || '508, 3rd Eye Vision,\nIIM Road, Ahmedabad\nGujarat 380015'}
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className={styles.formSection}>
            {success && (
              <div className={styles.successMessage}>
                Thank you! Your message has been sent successfully.
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  className={styles.inputField}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Mobile No."
                  className={styles.inputField}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className={styles.inputField}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <textarea
                  name="message"
                  placeholder="Your Message"
                  className={styles.textareaField}
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
                <div className={styles.charCount}>
                  {formData.message.length} / 200
                </div>
              </div>

              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUs;
