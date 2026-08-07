import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DestinationSlider.module.css';

const DestinationCard = ({ destination }) => {
  const navigate = useNavigate();
  const nameUpper = destination.name.toUpperCase();

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
    navigate(`/destinations/${destination.slug || destination.name.toLowerCase().replace(/\\s+/g, '-')}`);
  };

  const getStyleClass = () => {
    if (nameUpper.includes('SIKKIM')) return styles.sikkimTitle;
    if (nameUpper.includes('UTTARAKHAND')) return styles.uttarakhandTitle;
    if (nameUpper.includes('HIMACHAL')) return styles.himachalTitle;
    if (nameUpper.includes('LADAKH')) return styles.ladakhTitle;
    if (nameUpper.includes('GOA')) return styles.goaTitle;
    if (nameUpper.includes('KASHMIR')) return styles.kashmirTitle;
    if (nameUpper.includes('MALDIVES')) return styles.maldivesTitle;
    if (nameUpper.includes('SINGAPORE')) return styles.singaporeTitle;
    if (nameUpper.includes('THAILAND')) return styles.thailandTitle;
    if (nameUpper.includes('MALAYSIA')) return styles.malaysiaTitle;
    if (nameUpper.includes('BALI')) return styles.baliTitle;
    if (nameUpper.includes('VIETNAM')) return styles.vietnamTitle;
    return styles.defaultTitle;
  };

  return (
    <div className={styles.cardContainer} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      {getImageUrl(destination.image) && (
        <img
          src={getImageUrl(destination.image)}
          alt={destination.name}
          className={styles.cardImage}
        />
      )}
      {/* Top Gradient for Title Readability */}
      <div className={styles.topGradientOverlay}>
        <div className={styles.titleWrapper}>
          {nameUpper.includes('GOA') && (
            <svg className={styles.waveIcon} viewBox="0 0 100 30" fill="currentColor">
              <path d="M0 15 Q25 0, 50 15 T100 15 L100 25 L0 25 Z" opacity="0.8" />
            </svg>
          )}

          {nameUpper.includes('SINGAPORE') && (
            <div className={styles.merlionIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2C8 2 6 5 6 8C6 11 8 13 10 14V21H14V14C16 13 18 11 18 8C18 5 16 2 12 2Z" />
              </svg>
            </div>
          )}

          {nameUpper.includes('THAILAND') && (
            <div className={styles.flightTrail}>
              <svg width="60" height="20" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3">
                <path d="M10 25 Q 50 0, 90 10" />
              </svg>
            </div>
          )}

          <h3 className={`${styles.destinationHeader} ${getStyleClass()}`}>
            {destination.name}
          </h3>

          {nameUpper.includes('LADAKH') && (
            <span className={styles.subText}>Road Trip</span>
          )}
        </div>
      </div>

    </div>
  );
};

export default DestinationCard;
