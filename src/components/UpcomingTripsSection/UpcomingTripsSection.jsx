import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import styles from './UpcomingTripsSection.module.css';
import { FiCalendar } from 'react-icons/fi';

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const UpcomingTripsSection = () => {
  const navigate = useNavigate();
  const currentMonthIndex = new Date().getMonth();

  const handleMonthClick = (month) => {
    navigate(`/upcoming-trips/${month.toLowerCase()}`);
  };

  return (
    <section className={styles.upcomingSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionSubtitle}>PLAN YOUR JOURNEY</span>
        <h2 className={styles.sectionTitle}>Upcoming Community Trips</h2>
        <div className={styles.titleUnderline}></div>
      </div>

      <div className={styles.sliderContainer}>
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={2}
          navigation
          initialSlide={currentMonthIndex > 1 ? currentMonthIndex - 1 : 0} // try to center it
          breakpoints={{
            480: { slidesPerView: 3 },
            640: { slidesPerView: 4 },
            900: { slidesPerView: 5 },
            1200: { slidesPerView: 6 }
          }}
          className={styles.monthSwiper}
        >
          {MONTHS.map((month, index) => {
            const isCurrent = index === currentMonthIndex;
            return (
              <SwiperSlide key={month}>
                <div
                  className={`${styles.monthCard} ${isCurrent ? styles.active : ''}`}
                  onClick={() => handleMonthClick(month)}
                >
                  <div className={styles.iconWrapper}>
                    <FiCalendar className={styles.calendarIcon} />
                  </div>
                  <span className={styles.monthText}>{month}</span>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};

export default UpcomingTripsSection;
