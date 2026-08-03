import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import TrendingCard from './TrendingCard';
import { getTrips } from '../../services/api';
import styles from './TrendingSection.module.css';

const TrendingSection = () => {
  const [trendingTrips, setTrendingTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data } = await getTrips();
        // Assuming trips are all "trending" for now, or filter by tag
        setTrendingTrips(data);
      } catch (error) {
        console.error('Failed to fetch trending trips:', error);
      }
    };
    fetchTrips();
  }, []);

  if (trendingTrips.length === 0) return null;

  return (
    <section className={styles.trendingSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Trending</h2>
      </div>

      <div className={styles.sliderContainer}>
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2 },
            900: { slidesPerView: 3 },
            1200: { slidesPerView: 4 }
          }}
        >
          {trendingTrips.map((trip) => (
            <SwiperSlide key={trip._id || trip.id}>
              <TrendingCard trip={trip} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TrendingSection;
