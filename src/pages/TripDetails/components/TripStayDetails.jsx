import React, { useState } from 'react';
import { FiCheck, FiCamera } from 'react-icons/fi';
import { MdBed, MdRestaurantMenu } from 'react-icons/md';
import styles from './TripStayDetails.module.css';

const TripStayDetails = ({ stayDetails = [] }) => {
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(0);

  if (!stayDetails || stayDetails.length === 0) return null;

  const currentLoc = stayDetails[selectedLocationIndex] || stayDetails[0];

  return (
    <div className={styles.sectionBlock}>
      <h2 className={styles.blockTitle}>Stay Details</h2>
      
      {/* Location Tabs */}
      <div className={styles.tabsWrapper}>
        {stayDetails.map((loc, idx) => {
          const isActive = selectedLocationIndex === idx;
          return (
            <button
              key={idx}
              className={`${styles.tabBtn} ${isActive ? styles.activeTab : ''}`}
              onClick={() => setSelectedLocationIndex(idx)}
            >
              {loc.locationName} {loc.nights ? `(${loc.nights}N)` : ''}
              {isActive && (
                <div className={styles.checkBadge}>
                  <FiCheck size={10} strokeWidth={4} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Hotels List for Selected Location */}
      <div className={styles.hotelsList}>
        {(currentLoc.hotels || []).map((hotel, hIdx) => (
          <div key={hIdx} className={styles.hotelCard}>
            <div className={styles.imageWrapper}>
              <img src={hotel.image || 'https://placehold.co/600x400?text=Hotel+Image'} alt={hotel.name} className={styles.hotelImg} />
              <button className={styles.galleryBtn}>
                <FiCamera size={14} /> Gallery
              </button>
            </div>
            
            <div className={styles.hotelInfo}>
              <div>
                <h4 className={styles.hotelName}>{hotel.name}</h4>
                <span className={styles.hotelRating}>{hotel.rating}</span>
              </div>
              
              <div className={styles.featuresList}>
                {hotel.roomType && (
                  <div className={styles.featureItem}>
                    <MdBed className={styles.icon} size={18} />
                    <span>{hotel.roomType}</span>
                  </div>
                )}
                {hotel.mealPlan && (
                  <div className={styles.featureItem}>
                    <MdRestaurantMenu className={styles.icon} size={18} />
                    <span>{hotel.mealPlan}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {currentLoc.hotels.length === 0 && (
          <p style={{color: '#64748b'}}>No hotels added for this location.</p>
        )}
      </div>
    </div>
  );
};

export default TripStayDetails;
