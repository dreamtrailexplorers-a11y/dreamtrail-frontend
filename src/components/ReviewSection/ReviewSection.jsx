import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { FiChevronRight, FiX } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/navigation';
import ReviewCard from './ReviewCard';
import { getReviews } from '../../services/api';
import styles from './ReviewSection.module.css';

const ReviewSection = () => {
  const [reviewsList, setReviewsList] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await getReviews();
        setReviewsList(data);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    if (selectedReview) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedReview]);

  if (reviewsList.length === 0) return null;

  return (
    <>
      <section className={styles.reviewSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Reviews</h2>
          <button className={styles.viewAllBtn}>
            View All <FiChevronRight size={18} />
          </button>
        </div>

        <div className={styles.sliderContainer}>
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            navigation
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              900: { slidesPerView: 3 },
              1200: { slidesPerView: 4.5 }
            }}
          >
            {reviewsList.map((review) => (
              <SwiperSlide key={review._id || review.id}>
                <ReviewCard review={review} onOpenModal={() => setSelectedReview(review)} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {selectedReview && (
        <div className={styles.modalOverlay} onClick={() => setSelectedReview(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalUserProfile}>
                <img
                  src={selectedReview.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"}
                  alt={selectedReview.author}
                  className={styles.userAvatar}
                />
                <div className={styles.userMeta}>
                  <span className={styles.userName}>{selectedReview.author}</span>
                  <span className={styles.userLocation}>{selectedReview.destination ? `Visited ${selectedReview.destination}` : 'Joined Group Trip'}</span>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedReview(null)}>
                <FiX size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.ratingStars} style={{ marginBottom: '15px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    style={{
                      color: star <= selectedReview.rating ? '#f5a623' : 'transparent',
                      stroke: star <= selectedReview.rating ? 'none' : '#333',
                      strokeWidth: star <= selectedReview.rating ? '0' : '30',
                    }}
                  />
                ))}
              </div>
              <p className={styles.modalReviewText} style={{ whiteSpace: 'pre-wrap' }}>
                {selectedReview.review}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewSection;
