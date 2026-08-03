import React from 'react';
import styles from './CreatorHighlights.module.css';

const CreatorHighlights = ({ images }) => {
  return (
    <div className={styles.highlightsContainer}>
      <div className={styles.scrollWrapper}>
        {images.map((img, index) => (
          <div 
            key={index} 
            className={styles.imageCard}
            style={{ 
              zIndex: images.length - index,
              marginLeft: index !== 0 ? '-30px' : '0' 
            }}
          >
            <img src={img} alt={`Highlight ${index + 1}`} className={styles.img} />
          </div>
        ))}
      </div>
      <p className={styles.caption}>Trip Highlights</p>
    </div>
  );
};

export default CreatorHighlights;
