import React from 'react';
import styles from './TripPreBookBanner.module.css';

const TripPreBookBanner = ({ onOpenEnquiry }) => {
  return (
    <div className={styles.preBookBanner}>
      <div className={styles.bannerContent}>
        {/* We can use an emoji or image here to represent the graphic in the reference */}
        <span className={styles.graphic}>🏍️</span>
        <div>
          <span className={styles.preBookSub}>Reserve your seat now!</span>
          <h3 className={styles.preBookTitle}>Pre-Book @ {'\u20B9'}5000</h3>
        </div>
      </div>
      <button 
        className={styles.primaryRedBtn}
        onClick={onOpenEnquiry}
      >
        Book Now
      </button>
    </div>
  );
};

export default TripPreBookBanner;
