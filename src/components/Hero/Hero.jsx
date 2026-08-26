import React, { useState, useRef, useEffect } from 'react';
import { FiMapPin, FiCalendar, FiUsers, FiSearch, FiPlay, FiPause, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { getSiteSettings } from '../../services/api';
import styles from './Hero.module.css';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await getSiteSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load hero settings', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const slides = settings?.heroSliders?.length > 0 ? settings.heroSliders : (isLoading ? [] : [
    {
      image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1920&q=80',
      heading: 'Experiences for\nTourist Explorers'
    }
  ]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 2500); // 2.5 second interval
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className={styles.heroContainer}>
      {slides.map((slide, index) => (
        <div key={index} style={{ opacity: index === currentSlide ? 1 : 0, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, transition: 'opacity 0.5s ease-in-out' }}>
          <div 
            className={styles.slideImage} 
            style={{ 
              backgroundImage: `url(${slide.image})`,
              width: '100%',
              height: '100%',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} 
          />
          {/* Dark Overlay */}
          <div className={styles.heroOverlay}></div>

          {/* Hero Main Content */}
          <div className={styles.heroContent} style={{ position: 'absolute', top: '50%', left: '0', transform: 'translateY(-50%)', zIndex: 10, width: '100%', display: 'flex', justifyContent: 'flex-start', paddingLeft: '4rem' }}>
            <h1 className={styles.heroHeading} style={{ whiteSpace: 'pre-line', fontSize: '3.5rem' }}>
              {slide.heading}
            </h1>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Hero;
