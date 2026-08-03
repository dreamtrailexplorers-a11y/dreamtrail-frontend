import React from 'react';
import { FaStar } from 'react-icons/fa';
import styles from './TripReviews.module.css';

const avatarColors = ['#94a3b8', '#64748b', '#475569', '#334155'];

const TripReviews = ({ reviews }) => {
  return (
    <div className={styles.sectionBlock}>
      <h2 className={styles.blockTitle}>Reviews</h2>
      <div className={styles.reviewsGrid}>
        {reviews.map((rev, idx) => {
          const images = rev.tripImages?.length > 0 ? rev.tripImages : (rev.tripImage ? [rev.tripImage] : []);
          return (
            <div key={idx} className={styles.reviewCard}>
              <div className={styles.cardHeader}>
                <div 
                  className={styles.avatarCircle}
                  style={{ backgroundColor: avatarColors[idx % avatarColors.length] }}
                >
                  {rev.avatar ? (
                    <img src={rev.avatar} alt={rev.author} className={styles.avatarImg} />
                  ) : (
                    rev.author ? rev.author.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <div className={styles.headerInfo}>
                  <div className={styles.nameRow}>
                    <span className={styles.authorName}>{rev.author}</span>
                    <span className={styles.privateTag}>private</span>
                  </div>
                  <div className={styles.bookedRow}>
                    <span className={styles.bookedText}>Booked: </span>
                    <span className={styles.bookedPackage}>{rev.tripSlug || rev.destination} ↗</span>
                  </div>
                </div>
              </div>

              <div className={styles.ratingRow}>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      style={{
                        fontSize: '12px',
                        color: star <= rev.rating ? '#f5a623' : '#e2e8f0',
                      }}
                    />
                  ))}
                </div>
                <span className={styles.reviewDate}>{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : '1 year ago'}</span>
              </div>

              <p className={styles.reviewText}>
                {rev.review}
                {rev.review?.length > 100 && <span className={styles.readMore}>... Read More</span>}
              </p>

              {images.length > 0 && (
                <div className={`${styles.imageGrid} ${styles[`imagesCount${images.length > 4 ? 4 : images.length}`]}`}>
                  {images.slice(0, 4).map((img, i) => (
                    <img key={i} src={img} alt={`Review ${i+1}`} className={styles.gridImage} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TripReviews;
