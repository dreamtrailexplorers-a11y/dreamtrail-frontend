import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import styles from './TrendingSection.module.css';

const TrendingCard = ({ trip, basePath = '/tours' }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`${basePath}/${trip.slug || trip.id || trip._id}`);
  };

  return (
    <div className={styles.cardContainer} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className={styles.imageWrapper}>
        <img 
          src={trip.image} 
          alt={trip.title} 
          className={styles.cardImage} 
        />

        {/* Inner pagination dots */}
        <div className={styles.imageDots}>
          <span className={`${styles.dot} ${styles.activeDot}`}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
        </div>
      </div>

      <div className={styles.cardBody}>
        <div>
          <span className={styles.durationText}>{trip.duration}</span>
          <h3 className={styles.cardTitle}>{trip.title}</h3>
          <p className={styles.cardRoute}>{trip.route}</p>
        </div>

        <div className={styles.priceBlock}>
          {trip.saveAmount && (
            <div className={styles.saveBadge}>
              <FaCheckCircle size={14} className={styles.checkIcon} /> Save {Number(trip.saveAmount || 0).toLocaleString('en-IN')}
            </div>
          )}

          <div className={styles.priceRow}>
            {(trip.discountedPrice !== undefined && trip.discountedPrice !== null && trip.discountedPrice !== '') && (
              <span className={styles.discountedPrice}>
                {'\u20B9'} {Number(trip.discountedPrice).toLocaleString('en-IN')}
              </span>
            )}
            {(trip.originalPrice !== undefined && trip.originalPrice !== null && trip.originalPrice !== '') && (
              <span className={styles.originalPrice}>
                {'\u20B9'} {Number(trip.originalPrice).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingCard;
