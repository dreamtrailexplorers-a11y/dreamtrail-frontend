import React, { useState } from 'react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './TripGallery.module.css';

const TripGallery = ({ images }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  if (!images || images.length === 0) return null;

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

  const openLightbox = (index) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  
  const showNext = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };
  
  const showPrev = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <>
      <section className={styles.gallerySection}>
        <div className={styles.galleryGrid}>
          <div className={styles.mainImageWrapper} onClick={() => openLightbox(0)} style={{ cursor: 'pointer' }}>
            {getImageUrl(images[0]) && (
              <img src={getImageUrl(images[0])} alt="Trip Main" className={styles.galleryImg} />
            )}
          </div>
          <div className={styles.sideGrid}>
            {images.slice(1, 5).map((img, idx) => (
              <div key={idx} className={styles.sideImgWrapper} onClick={() => openLightbox(idx + 1)} style={{ cursor: 'pointer' }}>
                {getImageUrl(img) && (
                  <img src={getImageUrl(img)} alt={`Trip view ${idx + 1}`} className={styles.galleryImg} />
                )}
                {idx === 3 && images.length > 5 && (
                  <div className={styles.moreOverlay}>
                    <span>+{images.length - 5}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedIndex !== null && (
        <div className={styles.lightboxOverlay} onClick={closeLightbox}>
          <button className={styles.lightboxClose} onClick={closeLightbox}>
            <FiX size={30} />
          </button>
          
          {images.length > 1 && (
            <button className={styles.lightboxPrev} onClick={showPrev}>
              <FiChevronLeft size={40} />
            </button>
          )}

          <img 
            src={getImageUrl(images[selectedIndex])} 
            alt="Expanded view" 
            className={styles.lightboxImage} 
            onClick={(e) => e.stopPropagation()} 
          />

          {images.length > 1 && (
            <button className={styles.lightboxNext} onClick={showNext}>
              <FiChevronRight size={40} />
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default TripGallery;
