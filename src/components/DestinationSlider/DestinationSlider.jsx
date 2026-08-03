import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import DestinationCard from './DestinationCard';
import styles from './DestinationSlider.module.css';

const DestinationSlider = ({ title, destinations }) => {
  return (
    <section className={styles.destinationSection}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.sliderWrapper}>
        <Swiper
          modules={[Navigation]}
          spaceBetween={18}
          slidesPerView={1.5}
          navigation
          breakpoints={{
            480: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 5 }
          }}
        >
          {destinations.map((item, idx) => (
            <SwiperSlide key={item._id || item.id || idx}>
              <DestinationCard destination={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default DestinationSlider;
