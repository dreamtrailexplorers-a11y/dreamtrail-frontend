import React from 'react';
import { FiClock, FiMapPin, FiHome, FiCoffee } from 'react-icons/fi';
import styles from './CreatorQuickInfo.module.css';

const CreatorQuickInfo = ({ trip }) => {
  return (
    <div className={styles.grid}>
      <div className={styles.infoBox}>
        <FiClock className={styles.icon} />
        <div className={styles.infoContent}>
          <span className={styles.label}>Duration</span>
          <span className={styles.value}>{trip?.duration || '10 Days 9 Nights'}</span>
        </div>
      </div>
      
      <div className={styles.infoBox}>
        <FiMapPin className={styles.icon} />
        <div className={styles.infoContent}>
          <span className={styles.label}>Location</span>
          <span className={styles.value}>{trip?.destination || 'Himachal Pradesh, India'}</span>
        </div>
      </div>
      
      <div className={styles.infoBox}>
        <FiHome className={styles.icon} />
        <div className={styles.infoContent}>
          <span className={styles.label}>Hotel Category</span>
          <span className={styles.value}>{trip?.hotelCategory || 'Standard/Premium'}</span>
        </div>
      </div>
      
      <div className={styles.infoBox}>
        <FiCoffee className={styles.icon} />
        <div className={styles.infoContent}>
          <span className={styles.label}>Meals</span>
          <span className={styles.value}>{trip?.meals || 'Breakfast + Dinner'}</span>
        </div>
      </div>
    </div>
  );
};

export default CreatorQuickInfo;
