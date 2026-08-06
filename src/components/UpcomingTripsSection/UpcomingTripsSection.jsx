import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import styles from './UpcomingTripsSection.module.css';

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
        <h2 className={styles.sectionTitle}>Upcoming Community Trip</h2>
      </div>

      <div className={styles.sliderContainer}>
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={15}
          slidesPerView={3}
          navigation
          initialSlide={currentMonthIndex > 1 ? currentMonthIndex - 1 : 0} // try to center it
          breakpoints={{
            480: { slidesPerView: 3 },
            640: { slidesPerView: 4 },
            900: { slidesPerView: 6 },
            1200: { slidesPerView: 8 }
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
                  {month}
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
