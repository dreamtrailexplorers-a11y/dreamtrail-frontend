import React from 'react';
import { FaStar } from 'react-icons/fa';
import styles from './ReviewSection.module.css';

const ReviewCard = ({ review, onOpenModal }) => {
  const avatarColors = ['#94a3b8', '#64748b', '#475569', '#334155'];
  // We don't have an index here, but we can generate a pseudo-random one based on name length
  const charCode = review.author ? review.author.charCodeAt(0) : 0;
  const bgColor = avatarColors[charCode % avatarColors.length];

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardContent}>
        
        <div className={styles.cardHeader}>
          <div 
            className={styles.avatarCircle}
            style={{ backgroundColor: bgColor }}
          >
            {review.avatar ? (
              <img
                src={review.avatar}
                alt={review.author}
                onError={(e) => e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"}
                className={styles.avatarImg}
              />
            ) : (
              review.author ? review.author.charAt(0).toUpperCase() : 'U'
            )}
          </div>
          <div className={styles.headerInfo}>
            <div className={styles.nameRow}>
              <span className={styles.userName}>{review.author}</span>
              <span className={styles.privateTag}>private</span>
            </div>
            <div className={styles.bookedRow}>
              <span className={styles.bookedText}>Booked: </span>
              <span className={styles.userLocation}>{review.tripSlug || review.destination || 'Group Tour'} ↗</span>
            </div>
          </div>
        </div>

        <div className={styles.ratingRow}>
          <div className={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={styles.goldStar}
                style={{
                  color: star <= review.rating ? '#f5a623' : '#e2e8f0',
                }}
              />
            ))}
          </div>
          <span className={styles.reviewDate}>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '1 year ago'}</span>
        </div>

        <p className={styles.reviewText}>
          {review.review}
        </p>

        <span
          className={styles.readMoreLink}
          onClick={onOpenModal}
          style={{ display: review.review?.length > 150 ? 'inline-block' : 'none' }}
        >
          Read more...
        </span>
      </div>
    </div>
  );
};

export default ReviewCard;
