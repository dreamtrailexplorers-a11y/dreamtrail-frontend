import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaWhatsapp, 
  FaInstagram, 
  FaFacebookF, 
  FaLinkedinIn,
  FaYoutube
} from 'react-icons/fa';
import { FiMapPin, FiChevronDown } from 'react-icons/fi';
import { getSiteSettings, getTrips } from '../../services/api';
import styles from './Footer.module.css';

const Footer = () => {
  const [settings, setSettings] = useState(null);
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettingsAndTrips = async () => {
      try {
        const [settingsRes, tripsRes] = await Promise.all([
          getSiteSettings(),
          getTrips()
        ]);
        setSettings(settingsRes.data);
        setTrips(tripsRes.data);
      } catch (err) {
        console.error('Failed to load settings or trips', err);
      }
    };
    fetchSettingsAndTrips();
  }, []);

  const renderTourLink = (link, idx) => {
    // Find a trip that explicitly selected this footer link name
    const linkedTrip = trips.find(t => t.footerLink && t.footerLink.toLowerCase() === link.label.toLowerCase());
    
    if (linkedTrip) {
      return (
        <Link key={idx} to={`/tours/${linkedTrip.slug || linkedTrip._id}`} className={styles.linkItem}>
          {link.label}
        </Link>
      );
    }
    
    return (
      <Link key={idx} to={link.url} className={styles.linkItem}>
        {link.label}
      </Link>
    );
  };

  return (
    <>
      <footer className={styles.footerWrapper}>
        {/* Pre-Footer Bar with Contact */}
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
              <span className={styles.phoneNum}>{settings?.phone || '90 99 599 331'}</span>
            </div>
          </a>

          <div className={styles.socialGroup}>
            <span className={styles.socialLabel}>Be part of our Social Media Journey!</span>
            <div className={styles.socialIcons}>
              <a href={settings?.instagram || '#'} className={`${styles.socialIconBtn} ${styles.instagram}`} aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href={settings?.facebook || '#'} className={`${styles.socialIconBtn} ${styles.facebook}`} aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href={settings?.youtube || '#'} className={`${styles.socialIconBtn} ${styles.youtube}`} aria-label="YouTube">
                <FaYoutube />
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
              <img src="/footer-logo.png" alt="DreamTrail Logo" style={{ height: '110px', width: 'auto' }} />
            </div>

            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings?.address || 'DreamTrail Experiences Pvt. Ltd. 508, 3rd Eye Vision, IIM Road, Ahmedabad, Gujarat 380015')}`}
              target="_blank"
              rel="noreferrer"
              className={styles.addressBox}
              style={{ textDecoration: 'none', color: '#cbd5e1' }}
            >
              <FiMapPin size={22} color="#E67E22" style={{ flexShrink: 0, marginTop: '3px' }} />
              <span style={{ whiteSpace: 'pre-line' }}>
                {settings?.address || 'DreamTrail Experiences Pvt. Ltd.\\n508, 3rd Eye Vision, IIM Road, Ahmedabad, Gujarat 380015'}
              </span>
            </a>
          </div>

          {/* Motorcycle Tours Col */}
          <div className={styles.exploreCol}>
            <h3 className={styles.colHeading}>MOTORCYCLE TOURS</h3>
            
            {(settings?.footerToursIndia?.length > 0) && (
              <>
                <div className={styles.subHeadingCol}>INDIA</div>
                <div className={styles.tourGrid}>
                  <div className={styles.tourCol}>
                    {settings.footerToursIndia.slice(0, Math.ceil(settings.footerToursIndia.length / 2)).map((link, idx) => renderTourLink(link, idx))}
                  </div>
                  <div className={styles.tourCol}>
                    {settings.footerToursIndia.slice(Math.ceil(settings.footerToursIndia.length / 2)).map((link, idx) => renderTourLink(link, idx + 100))}
                  </div>
                </div>
              </>
            )}

            {(settings?.footerToursAsia?.length > 0) && (
              <>
                <div className={styles.subHeadingCol}>ASIA</div>
                <div className={styles.tourGrid}>
                  <div className={styles.tourCol}>
                    {settings.footerToursAsia.slice(0, Math.ceil(settings.footerToursAsia.length / 2)).map((link, idx) => renderTourLink(link, idx + 200))}
                  </div>
                  <div className={styles.tourCol}>
                    {settings.footerToursAsia.slice(Math.ceil(settings.footerToursAsia.length / 2)).map((link, idx) => renderTourLink(link, idx + 300))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Other Links Col */}
          <div className={styles.exploreCol}>
            <h3 className={styles.colHeading}>Other Links</h3>
            <div className={styles.linksListFull}>
              {(settings?.footerOtherLinks || []).map((link, idx) => (
                <Link key={idx} to={link.url} className={styles.linkItem}>{link.label}</Link>
              ))}
            </div>
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

      {/* Floating WhatsApp Button */}
      <a 
        href={`https://wa.me/${settings?.whatsappNumber || '9099599331'}`}
        target="_blank"
        rel="noreferrer"
        className={styles.floatingWhatsapp}
      >
        <FaWhatsapp size={30} />
      </a>
    </>
  );
};

export default Footer;
