import React from 'react';
import { FaStar } from 'react-icons/fa';
import styles from './ReviewSection.module.css';

const ReviewCard = ({ review, onOpenModal }) => {
  return (
    <div className={styles.cardContainer}>
      <div 
        className={styles.reviewHero} 
        style={{ backgroundImage: `url(${(review.tripImages && review.tripImages.length > 0) ? review.tripImages[0] : (review.tripImage || "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80")})` }}
      >
      </div>

      <div className={styles.cardContent}>
        <div className={styles.reviewHeaderOverlay}>
          <div className={styles.avatarCircle}>
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
          <div className={styles.headerTextOverlay}>
            <span className={styles.userName}>{review.author}</span>
            <span className={styles.userLocation}>{review.destination ? `Visited ${review.destination}` : 'Joined Group Trip'}</span>
          </div>
        </div>

        <div className={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={styles.goldStar}
              style={{
                color: star <= review.rating ? '#f5a623' : '#cbd5e1',
              }}
            />
          ))}
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
