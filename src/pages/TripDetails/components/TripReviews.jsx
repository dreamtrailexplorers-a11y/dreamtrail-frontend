import React, { useRef } from 'react';
import { FaStar } from 'react-icons/fa';
import { FiChevronRight, FiChevronLeft, FiX } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import styles from './TripReviews.module.css';

const avatarColors = ['#94a3b8', '#64748b', '#475569', '#334155'];

const TripReviews = ({ reviews }) => {
  const [selectedReview, setSelectedReview] = React.useState(null);

  React.useEffect(() => {
    if (selectedReview) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedReview]);

  return (
    <>
      <div className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.blockTitle}>Reviews</h2>
        </div>
        
        <div className={styles.sliderContainer}>
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1.15}
            navigation
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            breakpoints={{
              540: { slidesPerView: 1.5, spaceBetween: 20 },
              768: { slidesPerView: 2.2, spaceBetween: 24 },
              1024: { slidesPerView: 2.5, spaceBetween: 24 },
              1280: { slidesPerView: 3, spaceBetween: 26 }
            }}
          >
            {reviews.map((rev, idx) => {
              return (
                <SwiperSlide key={idx}>
                  <div className={styles.reviewCard}>
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

                    <div className={styles.reviewTextContainer}>
                      <p className={styles.reviewText}>
                        {rev.review}
                      </p>
                      <span
                        className={styles.readMoreLink}
                        onClick={() => setSelectedReview(rev)}
                        style={{ display: rev.review?.length > 150 ? 'inline-block' : 'none' }}
                      >
                        Read more...
                      </span>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>

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
                <div className={styles.headerInfo}>
                  <div className={styles.nameRow}>
                    <span className={styles.authorName}>{selectedReview.author}</span>
                  </div>
                  <div className={styles.bookedRow}>
                    <span className={styles.bookedText}>Booked: </span>
                    <span className={styles.bookedPackage}>{selectedReview.tripSlug || selectedReview.destination} ↗</span>
                  </div>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedReview(null)}>
                <FiX size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.ratingRow} style={{ marginBottom: '15px' }}>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      style={{
                        fontSize: '14px',
                        color: star <= selectedReview.rating ? '#f5a623' : '#e2e8f0',
                      }}
                    />
                  ))}
                </div>
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

export default TripReviews;
