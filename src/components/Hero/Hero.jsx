import React, { useState, useRef, useEffect } from 'react';
import { FiMapPin, FiCalendar, FiUsers, FiSearch, FiPlay, FiPause, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { getSiteSettings } from '../../services/api';
import styles from './Hero.module.css';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await getSiteSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load hero settings', err);
      }
    };
    fetchSettings();
  }, []);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!settings?.heroImages || settings.heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % settings.heroImages.length);
    }, 2500); // 2.5 second interval
    return () => clearInterval(interval);
  }, [settings]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const images = settings?.heroImages?.length > 0 ? settings.heroImages : [
    'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1920&q=80'
  ];

  return (
    <section className={styles.heroContainer}>
      {images.map((img, index) => (
        <div 
          key={index} 
          className={styles.slideImage} 
          style={{ 
            backgroundImage: `url(${img})`,
            opacity: index === currentSlide ? 1 : 0
          }} 
        />
      ))}

      {/* Dark Overlay */}
      <div className={styles.heroOverlay}></div>

      {/* Hero Main Content */}
      <div className={styles.heroContent}>
        <h1 className={styles.heroHeading} style={{ whiteSpace: 'pre-line' }}>
          {settings ? settings.heroHeading : 'Experiences for\nTourist Explorers'}
        </h1>
      </div>
    </section>
  );
};

export default Hero;
