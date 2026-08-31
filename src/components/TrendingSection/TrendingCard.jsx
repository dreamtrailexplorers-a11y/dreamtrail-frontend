import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import styles from './TrendingSection.module.css';

const TrendingCard = ({ trip, basePath = '/tours' }) => {
  const navigate = useNavigate();

  const getImageUrl = (url) => {
    if (!url) return '';
    if (typeof url !== 'string') return '';
    
    if (url.includes('drive.google.com/uc?export=view&id=')) {
      const id = url.split('id=')[1]?.split('&')[0];
      if (id) return `https://lh3.googleusercontent.com/d/${id}=w1000`;
    }
    if (url.includes('drive.google.com/uc?id=')) {
      const id = url.split('id=')[1]?.split('&')[0];
      if (id) return `https://lh3.googleusercontent.com/d/${id}=w1000`;
    }
    if (url.includes('drive.google.com/file/d/')) {
      const id = url.split('/d/')[1]?.split('/')[0];
      if (id) return `https://lh3.googleusercontent.com/d/${id}=w1000`;
    }
    return url;
  };

  const handleCardClick = () => {
    navigate(`${basePath}/${trip.slug || trip.id || trip._id}`);
  };

  return (
    <div className={styles.cardContainer} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className={styles.imageWrapper}>
        {getImageUrl(trip.image) && (
          <img 
            src={getImageUrl(trip.image)} 
            alt={trip.title} 
            className={styles.cardImage} 
          />
        )}

        {/* Inner pagination dots */}
        <div className={styles.imageDots}>
          <span className={`${styles.dot} ${styles.activeDot}`}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
        </div>
      </div>

      <div className={styles.cardBody} style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            {trip.destination && (
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {trip.destination}
              </span>
            )}
            {trip.duration && (
              <span style={{ fontSize: '0.75rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '12px', fontWeight: '600' }}>
                {trip.duration}
              </span>
            )}
          </div>
          
          <h3 className={styles.cardTitle} style={{ textAlign: 'left', fontSize: '1.15rem', color: '#0f172a', fontWeight: '800', marginBottom: '0.5rem', lineHeight: '1.3' }}>
            {trip.title}
          </h3>
          
          {trip.route && (
            <p style={{ textAlign: 'left', fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              <span style={{ marginRight: '4px' }}>📍</span>{trip.route}
            </p>
          )}
        </div>

        <div className={styles.priceBlock}>
          {Number(trip.discountedPrice) > 0 && trip.saveAmount && (
            <div className={styles.saveBadge}>
              <FaCheckCircle size={14} className={styles.checkIcon} /> Save {Number(trip.saveAmount || 0).toLocaleString('en-IN')}
            </div>
          )}

          <div className={styles.priceRow}>
            {Number(trip.discountedPrice) > 0 ? (
              <>
                <span className={styles.discountedPrice}>
                  {'\u20B9'} {Number(trip.discountedPrice).toLocaleString('en-IN')}
                </span>
                {(trip.originalPrice !== undefined && trip.originalPrice !== null && trip.originalPrice !== '') && (
                  <span className={styles.originalPrice}>
                    {'\u20B9'} {Number(trip.originalPrice).toLocaleString('en-IN')}
                  </span>
                )}
              </>
            ) : (
              (trip.originalPrice !== undefined && trip.originalPrice !== null && trip.originalPrice !== '') ? (
                <span className={styles.discountedPrice}>
                  {'\u20B9'} {Number(trip.originalPrice).toLocaleString('en-IN')}
                </span>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingCard;
