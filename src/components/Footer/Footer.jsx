import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube
} from 'react-icons/fa';
import { FiMapPin } from 'react-icons/fi';
import { getSiteSettings, getTrips } from '../../services/api';
import styles from './Footer.module.css';

const IndianFlag = () => (
  <svg 
    style={{ width: '19px', height: '13px', display: 'inline-block', verticalAlign: '-1px', borderRadius: '2px', marginLeft: '5px', boxShadow: '0 0 1px rgba(0,0,0,0.5)', flexShrink: 0 }} 
    viewBox="0 0 900 600"
    role="img"
    aria-label="India Flag"
  >
    <rect width="900" height="200" fill="#FF9933"/>
    <rect y="200" width="900" height="200" fill="#FFFFFF"/>
    <rect y="400" width="900" height="200" fill="#138808"/>
    <circle cx="450" cy="300" r="80" fill="none" stroke="#000080" strokeWidth="20"/>
    <circle cx="450" cy="300" r="20" fill="#000080"/>
    {Array.from({ length: 24 }).map((_, i) => (
      <line 
        key={i}
        x1="450" 
        y1="300" 
        x2={450 + 80 * Math.cos((i * 15 * Math.PI) / 180)} 
        y2={300 + 80 * Math.sin((i * 15 * Math.PI) / 180)} 
        stroke="#000080" 
        strokeWidth="4"
      />
    ))}
  </svg>
);

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

  const handleTourLinkClick = (e, link) => {
    e.preventDefault();
    if (link.url && link.url !== '#' && !link.url.startsWith('/tour/')) {
      navigate(link.url);
      return;
    }
    const label = link.label.trim();
    navigate(`/tour-packages?filter=${encodeURIComponent(label)}`);
  };

  const renderTourLink = (link, idx) => {
    const targetUrl = (link.url && link.url !== '#' && !link.url.startsWith('/tour/'))
      ? link.url
      : `/tour-packages?filter=${encodeURIComponent(link.label.trim())}`;
    return (
      <a
        key={idx}
        href={targetUrl}
        onClick={(e) => handleTourLinkClick(e, link)}
        className={styles.linkItem}
        style={{ cursor: 'pointer' }}
      >
        {link.label}
      </a>
    );
  };

  const getCleanWhatsappNumber = (rawNum) => {
    if (!rawNum) return '919099599331';
    let digits = String(rawNum).replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 11) {
      digits = `91${digits.slice(1)}`;
    } else if (digits.length === 10) {
      digits = `91${digits}`;
    }
    return digits || '919099599331';
  };

  const activeWhatsappNumber = getCleanWhatsappNumber(settings?.whatsappNumber || settings?.phone);

  return (
    <>
      <footer className={styles.footerWrapper}>
        {/* Pre-Footer Bar with Contact */}
        <div className={styles.preFooterBar}>
          <a
            href={`https://wa.me/${activeWhatsappNumber}`}
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
              <span className={styles.phoneNum}>{settings?.phone || settings?.whatsappNumber || '90 99 599 331'}</span>
            </div>
          </a>

          <div className={styles.socialGroup}>
            <span className={styles.socialLabel}>Be part of our Social Media Journey!</span>
            <div className={styles.socialIcons}>
              {settings?.instagram && settings.instagram !== '#' && (
                  <a href={settings.instagram} target="_blank" rel="noreferrer" className={`${styles.socialIconBtn} ${styles.instagram}`} aria-label="Instagram">
                    <FaInstagram />
                  </a>
                )}
                {settings?.facebook && settings.facebook !== '#' && (
                  <a href={settings.facebook} target="_blank" rel="noreferrer" className={`${styles.socialIconBtn} ${styles.facebook}`} aria-label="Facebook">
                    <FaFacebookF />
                  </a>
                )}
                {settings?.youtube && settings.youtube !== '#' && (
                  <a href={settings.youtube} target="_blank" rel="noreferrer" className={`${styles.socialIconBtn} ${styles.youtube}`} aria-label="YouTube">
                    <FaYoutube />
                  </a>
                )}
                {settings?.linkedin && settings.linkedin !== '#' && (
                  <a href={settings.linkedin} target="_blank" rel="noreferrer" className={`${styles.socialIconBtn} ${styles.linkedin}`} aria-label="LinkedIn">
                    <FaLinkedinIn />
                  </a>
                )}
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className={styles.mainFooter}>
          {/* Company Info */}
          <div className={styles.companyCol}>
            <div className={styles.brandLogo}>
              <img src="/footer-logo.png" alt="DreamTrail Logo" className={styles.responsiveLogo} />
            </div>

            <a
              href={settings?.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings?.address || 'DreamTrail Experiences Pvt. Ltd. 508, 3rd Eye Vision, IIM Road, Ahmedabad, Gujarat 380015')}`}
              target="_blank"
              rel="noreferrer"
              className={styles.addressBox}
              style={{ textDecoration: 'none', color: '#cbd5e1' }}
            >
              <FiMapPin size={22} color="#E67E22" style={{ flexShrink: 0, marginTop: '3px' }} />
              <span style={{ whiteSpace: 'pre-line' }}>
                {settings?.address || 'DreamTrail Experiences \\n508, 3rd Eye Vision, IIM Road, Ahmedabad, Gujarat 380015'}
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
          <span>{settings?.copyrightText || '© 2026 Dreamtrail Explorers. All rights reserved.'}</span>
          <span className={styles.indiaTag}>
            {(() => {
              const text = settings?.madeWithText || 'Made with ❤️ in India 🇮🇳';
              if (text.includes('🇮🇳')) {
                const parts = text.split('🇮🇳');
                return (
                  <>
                    <span>{parts[0]}</span>
                    <IndianFlag />
                    {parts[1] && <span>{parts[1]}</span>}
                  </>
                );
              }
              if (/\s+IN$/i.test(text)) {
                const cleanText = text.replace(/\s+IN$/i, '');
                return (
                  <>
                    <span>{cleanText}</span>
                    <IndianFlag />
                  </>
                );
              }
              return (
                <>
                  <span>{text}</span>
                  {text.toLowerCase().includes('india') && <IndianFlag />}
                </>
              );
            })()}
          </span>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${activeWhatsappNumber}`}
        target="_blank"
        rel="noreferrer"
        className={styles.floatingWhatsapp}
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <FaWhatsapp size={30} />
      </a>
    </>
  );
};

export default Footer;




