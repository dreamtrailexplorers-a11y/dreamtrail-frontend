import React, { useState } from 'react';
import { FiShare2, FiCheck, FiX, FiLink, FiDownload } from 'react-icons/fi';
import { FaMotorcycle, FaWhatsapp } from 'react-icons/fa';
import { FiUsers } from 'react-icons/fi';
import styles from './TripHeader.module.css';

const TripHeader = ({ trip }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsappShare = () => {
    const text = `Check out this amazing trip: ${trip.title} - ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className={styles.tripHeader}>
      <div className={styles.tagRow}>
        <span className={styles.durationTag}>{trip.duration}</span>
      </div>

      <h1 className={styles.title}>{trip.title}</h1>
      <p className={styles.subtitle}>{trip.route}</p>

      <div className={styles.metaChipsRow}>
        <span className={styles.metaChip}>
          <FiUsers size={16} /> {trip.category || 'Group Trip'}
        </span>
        <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
          <a href={trip.pdfUrl || '#'} target={trip.pdfUrl ? "_blank" : "_self"} rel="noreferrer" className={styles.shareBtn} style={{ textDecoration: 'none', color: '#cc0000', borderColor: '#cc0000', backgroundColor: '#fff', marginLeft: 0 }} onClick={(e) => { if(!trip.pdfUrl) { e.preventDefault(); alert('No PDF uploaded for this package yet.'); } }}>
            <FiDownload size={16} /> Get PDF
          </a>
          <button className={styles.shareBtn} style={{ marginLeft: 0 }} onClick={() => setIsShareModalOpen(true)}>
            <FiShare2 size={16} /> Share
          </button>
        </div>
      </div>

      {isShareModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsShareModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setIsShareModalOpen(false)}>
              <FiX size={20} />
            </button>
            <h3 className={styles.modalTitle}>Share this Page</h3>
            
            <div className={styles.shareCard}>
              <img src={trip.image || 'https://placehold.co/100x100'} alt="Trip" className={styles.shareImg} />
              <div className={styles.shareInfo}>
                <h4>{trip.title}</h4>
                <p>{trip.route}</p>
              </div>
            </div>

            <div className={styles.shareActions}>
              <button className={styles.actionBtn} onClick={handleCopyLink}>
                {copiedLink ? <FiCheck size={18} /> : <FiLink size={18} />} 
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
              <button className={`${styles.actionBtn} ${styles.whatsapp}`} onClick={handleWhatsappShare}>
                <FaWhatsapp size={18} /> Whatsapp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripHeader;
