import React from 'react';
import { FiX, FiLink } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import styles from './ShareModal.module.css';

const ShareModal = ({ isOpen, onClose, tripTitle, creatorName, image }) => {
  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const handleWhatsapp = () => {
    const text = encodeURIComponent(`Check out this trip: ${tripTitle} by ${creatorName} - ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Share this Page</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.tripInfo}>
            <img src={image} alt={tripTitle} className={styles.tripImage} />
            <div className={styles.tripText}>
              <h4 className={styles.tripName}>{tripTitle}</h4>
              <p className={styles.creatorName}>
                {creatorName} <MdVerified className={styles.verifiedIcon} />
              </p>
            </div>
          </div>

          <div className={styles.actionsRow}>
            <button className={styles.actionBtn} onClick={handleCopyLink}>
              <FiLink className={styles.actionIcon} /> Copy Link
            </button>
            <button className={styles.actionBtn} onClick={handleWhatsapp}>
              <FaWhatsapp className={styles.actionIcon} /> Whatsapp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
