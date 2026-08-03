import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaWhatsapp, 
  FaInstagram, 
  FaYoutube, 
  FaFacebookF, 
  FaTwitter, 
  FaLinkedinIn 
} from 'react-icons/fa';
import { FiMapPin, FiCompass } from 'react-icons/fi';
import { getSiteSettings, addSubscriber } from '../../services/api';
import styles from './Footer.module.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await getSiteSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (email) {
      try {
        await addSubscriber(email);
        alert(`Thank you for subscribing, ${email}!`);
        setEmail('');
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
          alert(err.response.data.message);
        } else {
          alert('Subscription failed. Please try again later.');
        }
      }
    }
  };

  return (
    <footer className={styles.footerWrapper}>
      {/* Pre-Footer Bar */}
      <div className={styles.preFooterBar}>
        <a 
          href={`https://wa.me/${settings?.whatsappNumber || '9099599331'}`}
          target="_blank"
          rel="noreferrer"
          className={styles.contactGroup}
          style={{ textDecoration: 'none' }}
        >
          <div className={styles.whatsappIcon}>
            <FaWhatsapp />
          </div>
          <div className={styles.contactText}>
            <span className={styles.contactLabel}>Don't wait any longer, Contact us!</span>
            <span className={styles.phoneNum}>{settings?.whatsappNumber || '9099599331'}</span>
          </div>
        </a>

        <div className={styles.socialGroup}>
          <span className={styles.socialLabel}>Be part of our Social Media Journey!</span>
          <div className={styles.socialIcons}>
            <a href={settings?.instagram || '#'} className={`${styles.socialIconBtn} ${styles.instagram}`} aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href={settings?.youtube || '#'} className={`${styles.socialIconBtn} ${styles.youtube}`} aria-label="YouTube">
              <FaYoutube />
            </a>
            <a href={settings?.facebook || '#'} className={`${styles.socialIconBtn} ${styles.facebook}`} aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href={settings?.twitter || '#'} className={`${styles.socialIconBtn} ${styles.twitter}`} aria-label="X">
              <FaTwitter />
            </a>
            <a href={settings?.linkedin || '#'} className={`${styles.socialIconBtn} ${styles.linkedin}`} aria-label="LinkedIn">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className={styles.mainFooter}>
        {/* Company Info */}
        <div className={styles.companyCol}>
          <div className={styles.brandLogo}>
            <img src="/logo.png" alt="DreamTrail Logo" style={{ height: '70px', width: 'auto' }} />
          </div>

          <div className={styles.addressBox}>
            <FiMapPin size={22} color="#E67E22" style={{ flexShrink: 0, marginTop: '3px' }} />
            <span style={{ whiteSpace: 'pre-line' }}>
              {settings?.address || 'DreamTrail Experiences Pvt. Ltd.\n508, 3rd Eye Vision, IIM Road, Ahmedabad, Gujarat 380015'}
            </span>
          </div>
        </div>

        {/* Explore Links */}
        <div className={styles.exploreCol}>
          <h3 className={styles.colHeading}>Explore</h3>
          <div className={styles.linksList}>
            <Link to="/" className={styles.linkItem}>Home</Link>
            <Link to="/tour-packages" className={styles.linkItem}>Tour Packages</Link>
            <Link to="/group-trips" className={styles.linkItem}>Group Trips</Link>
            <Link to="/creator-trips" className={styles.linkItem}>Creator</Link>
            <Link to="/careers" className={styles.linkItem}>Careers</Link>
            <Link to="/about" className={styles.linkItem}>About Us</Link>
            <Link to="/contact" className={styles.linkItem}>Contact Us</Link>
            <Link to="/terms" className={styles.linkItem}>Terms & Conditions</Link>
            <Link to="/privacy" className={styles.linkItem}>Privacy Policy</Link>
            <Link to="/payment" className={styles.linkItem}>Payment Details</Link>
          </div>
        </div>

        {/* Newsletter Column */}
        <div className={styles.newsletterCol}>
          <h3 className={styles.colHeading}>Get Updates & More!</h3>
          <p className={styles.newsletterDesc}>
            Subscribe to the free newsletter and stay up to date with secret deals & upcoming group departures.
          </p>
          <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
            <input
              type="email"
              className={styles.emailInput}
              placeholder="Your Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className={styles.subscribeBtn}>
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className={styles.bottomBar}>
        <span>{settings?.copyrightText || '© 2026 DreamTrail Experiences Private Limited. All rights reserved.'}</span>
        <span className={styles.indiaTag}>
          Made with ❤️ in India 🇮🇳
        </span>
      </div>
    </footer>
  );
};

export default Footer;
