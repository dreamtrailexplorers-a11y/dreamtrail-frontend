import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import styles from './UpcomingTripsSection.module.css';
import { FiCalendar, FiChevronDown } from 'react-icons/fi';
import { getTrips } from '../../services/api';

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const UpcomingTripsSection = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMonthClick = (month) => {
    navigate(`/upcoming-trips/${month.toLowerCase()}?year=${selectedYear}`);
  };

  return (
    <section className={styles.upcomingSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Upcoming Community Trips</h2>
        <div className={styles.yearDropdownContainer} ref={dropdownRef}>
          <div 
            className={styles.yearDropdownHeader} 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>{selectedYear}</span>
            <FiChevronDown className={`${styles.chevron} ${isDropdownOpen ? styles.open : ''}`} />
          </div>
          {isDropdownOpen && (
            <div className={styles.yearDropdownList}>
              {[currentYear, currentYear + 1, currentYear + 2, currentYear + 3].map(year => (
                <div 
                  key={year} 
                  className={`${styles.yearDropdownItem} ${selectedYear === year ? styles.selected : ''}`}
                  onClick={() => {
                    setSelectedYear(year);
                    setIsDropdownOpen(false);
                  }}
                >
                  {year}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.sliderContainer}>
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={2}
          navigation
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          initialSlide={0}
          breakpoints={{
            480: { slidesPerView: 3 },
            640: { slidesPerView: 4 },
            900: { slidesPerView: 5 },
            1200: { slidesPerView: 6 }
          }}
          className={styles.monthSwiper}
        >
          {MONTHS.map((month) => {
            const monthIndex = MONTHS.indexOf(month);
            const isCurrent = monthIndex === new Date().getMonth() && selectedYear === currentYear;
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
