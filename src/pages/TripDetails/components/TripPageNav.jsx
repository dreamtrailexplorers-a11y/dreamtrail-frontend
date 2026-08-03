import React, { useState, useEffect } from 'react';
import styles from './TripPageNav.module.css';

const TripPageNav = () => {
  const [activeSection, setActiveSection] = useState('about');
  const [isVisible, setIsVisible] = useState(false);

  const navItems = [
    { id: 'about', label: 'About' },
    { id: 'packages', label: 'Packages' },
    { id: 'dates', label: 'Dates' },
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'inclusions', label: 'Inclusions' },
    { id: 'attractions', label: 'Attractions' },
    { id: 'faqs', label: 'FAQs' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Show navbar only after scrolling past photos (approx 450px)
      if (window.scrollY > 450) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Find the current active section based on scroll position
      const scrollPosition = window.scrollY + 100; // Offset for sticky headers
      
      let currentSection = navItems[0].id;
      
      for (const item of navItems) {
        const element = document.getElementById(item.id);
        if (element && element.offsetTop <= scrollPosition) {
          currentSection = item.id;
        }
      }
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navItems]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <div className={`${styles.stickyNavContainer} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.stickyNavInner}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeSection === item.id ? styles.active : ''}`}
            onClick={() => scrollToSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TripPageNav;
