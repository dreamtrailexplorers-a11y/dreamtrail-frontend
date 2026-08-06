import React from 'react';
import styles from './TripGallery.module.css';

const TripGallery = ({ images }) => {
  if (!images || images.length === 0) return null;

  const getImageUrl = (url) => {
    if (!url) return '';
    if (typeof url !== 'string') return '';
    if (url.includes('drive.google.com/uc?export=view&id=')) {
      const id = url.split('id=')[1]?.split('&')[0];
      if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
    }
    if (url.includes('drive.google.com/uc?id=')) {
      const id = url.split('id=')[1]?.split('&')[0];
      if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
    }
    if (url.includes('drive.google.com/file/d/')) {
      const id = url.split('/d/')[1]?.split('/')[0];
      if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
    }
    return url;
  };

  return (
    <section className={styles.gallerySection}>
      <div className={styles.galleryGrid}>
        <div className={styles.mainImageWrapper}>
          {getImageUrl(images[0]) && (
            <img src={getImageUrl(images[0])} alt="Trip Main" className={styles.galleryImg} />
          )}
        </div>
        <div className={styles.sideGrid}>
          {images.slice(1, 5).map((img, idx) => (
            <div key={idx} className={styles.sideImgWrapper}>
              {getImageUrl(img) && (
                <img src={getImageUrl(img)} alt={`Trip view ${idx + 1}`} className={styles.galleryImg} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TripGallery;
