import React, { useState } from 'react';
import styles from './CreatorTripTabs.module.css';

const tabs = [
  { id: 'about', label: 'About' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'inclusions', label: 'Inclusions' },
  { id: 'exclusions', label: 'Exclusions' }
];

const CreatorTripTabs = () => {
  const [activeTab, setActiveTab] = useState('about');

  const scrollToSection = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.tabsContainer}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => scrollToSection(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default CreatorTripTabs;
