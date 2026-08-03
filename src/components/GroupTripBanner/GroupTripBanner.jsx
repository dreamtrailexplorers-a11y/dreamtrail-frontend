import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { getSiteSettings } from '../../services/api';
import styles from './GroupTripBanner.module.css';

const GroupTripBanner = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await getSiteSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load group trip banner settings', err);
      }
    };
    fetchSettings();
  }, []);

  const defaultBanners = [{
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80',
    title: 'Group Trips',
    subtitle: 'It\'s time for',
    pillText: 'Join solo or bring your buddy'
  }];

  const banners = (settings && settings.groupTripBanners && settings.groupTripBanners.length > 0) 
    ? settings.groupTripBanners 
    : defaultBanners;

  return (
    <section className={styles.bannerContainer}>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        className={styles.bannerSwiper}
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={index}>
            <Link to="/group-trips" className={styles.bannerLink}>
              <div className={styles.bannerCard}>
                <img
                  src={banner.image || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80'}
                  alt={banner.title || 'Group Trip'}
                  className={styles.bannerImg}
                />
                <div className={styles.overlay}>
                  { banner.subtitle && (
                    <span className={styles.subtitle}>{banner.subtitle}</span>
                  )}
                  { banner.title && (
                    <h2 className={styles.title}>{banner.title}</h2>
                  )}
                  { banner.pillText && (
                    <div className={styles.pillsRow}>
                      {banner.pillText}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default GroupTripBanner;
