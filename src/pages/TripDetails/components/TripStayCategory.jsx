import React, { useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import styles from './TripStayCategory.module.css';

const pricingData = {
  '6 Person': {
    standard: { orig: 53800, disc: 48800 },
    premium: { orig: 59300, disc: 53800 },
    luxury: { orig: 76800, disc: 70800 }
  },
  '4 Person': {
    standard: { orig: 58800, disc: 53800 },
    premium: { orig: 64300, disc: 58800 },
    luxury: { orig: 81800, disc: 75800 }
  },
  '2 Person': {
    standard: { orig: 63800, disc: 58800 },
    premium: { orig: 69300, disc: 63800 },
    luxury: { orig: 86800, disc: 80800 }
  }
};

const TripStayCategory = ({ selectedCategory, onSelectCategory }) => {
  const [selectedPerson, setSelectedPerson] = useState('6 Person');

  const categories = [
    { 
      id: 'standard', 
      title: 'Standard', 
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=300&q=80',
      days: '7 Days' 
    },
    { 
      id: 'premium', 
      title: 'Premium', 
      image: 'https://images.unsplash.com/photo-1577971132997-c10be9382bf0?auto=format&fit=crop&w=300&q=80',
      days: '7 Days' 
    },
    { 
      id: 'luxury', 
      title: 'Luxury', 
      image: 'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=300&q=80',
      days: '7 Days' 
    }
  ];

  const persons = ['6 Person', '4 Person', '2 Person'];

  return (
    <div className={styles.container}>
      <h3 className={styles.sectionTitle}>Stay Category</h3>
      
      <div className={styles.categoriesGrid}>
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          // If this category is selected, it uses the selectedPerson pricing
          // If it is NOT selected, it falls back to the default '6 Person' pricing
          const prices = isActive 
            ? pricingData[selectedPerson][cat.id]
            : pricingData['6 Person'][cat.id];

          return (
            <div 
              key={cat.id} 
              className={`${styles.categoryCard} ${isActive ? styles.activeCard : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <div className={styles.imageWrapper}>
                <img src={cat.image} alt={cat.title} className={styles.image} />
                <span className={styles.daysBadge}>{cat.days}</span>
              </div>
              <div className={styles.details}>
                <h4 className={styles.catTitle}>{cat.title}</h4>
                <div className={styles.pricing}>
                  <span className={styles.origPrice}>₹ {prices.orig}</span>
                  <span className={styles.discPrice}>₹ {prices.disc}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.divider}></div>

      <h3 className={styles.sectionSubtitle}>Package Options</h3>
      <div className={styles.optionsFlex}>
        {persons.map((opt) => {
          const isActive = selectedPerson === opt;
          return (
            <button
              key={opt}
              className={`${styles.optionPill} ${isActive ? styles.activePill : ''}`}
              onClick={() => setSelectedPerson(opt)}
            >
              {opt}
              {isActive && (
                <div className={styles.checkBadge}>
                  <FiCheck size={10} strokeWidth={4} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TripStayCategory;
