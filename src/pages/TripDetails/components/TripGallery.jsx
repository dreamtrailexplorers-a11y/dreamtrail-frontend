import React from 'react';
import styles from './TripGallery.module.css';

const TripGallery = ({ images }) => {
  if (!images || images.length === 0) return null;

  return (
    <section className={styles.gallerySection}>
      <div className={styles.galleryGrid}>
        <div className={styles.mainImageWrapper}>
          <img src={images[0]} alt="Trip Main" className={styles.galleryImg} />
        </div>
        <div className={styles.sideGrid}>
          {images.slice(1, 5).map((img, idx) => (
            <div key={idx} className={styles.sideImgWrapper}>
              <img src={img} alt={`Trip view ${idx + 1}`} className={styles.galleryImg} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TripGallery;
