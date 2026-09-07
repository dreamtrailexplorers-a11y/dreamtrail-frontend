import React, { useRef } from 'react';
import { FaStar } from 'react-icons/fa';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import styles from './TripReviews.module.css';

const avatarColors = ['#94a3b8', '#64748b', '#475569', '#334155'];

const TripReviews = ({ reviews }) => {
  return (
    <div className={styles.sectionBlock}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.blockTitle}>Reviews</h2>
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
            1200: { slidesPerView: 3 }
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
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default TripReviews;
