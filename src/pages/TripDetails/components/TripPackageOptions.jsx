import React from 'react';
import { FiCheck } from 'react-icons/fi';
import styles from './TripStayCategory.module.css';

const TripPackageOptions = ({ trip, options = [], selectedOptionIndex, onSelectOption, selectedSubOptionIndex, onSelectSubOption }) => {
  if (!options || options.length === 0) return null;

  const currentOption = options[selectedOptionIndex] || options[0];

  return (
    <div className={styles.container}>
      <h3 className={styles.sectionTitle}>Package Options</h3>
      
      <div className={styles.categoriesGrid}>
        {options.map((opt, index) => {
          const isActive = selectedOptionIndex === index;
          const validSubOptions = opt.subOptions ? opt.subOptions.filter(sub => sub.name && sub.name.trim() !== '') : [];
          
          const displayPrice = (isActive && validSubOptions.length > 0 && validSubOptions[selectedSubOptionIndex])
            ? validSubOptions[selectedSubOptionIndex].price
            : opt.price;
          
          let displayOrigPrice = (isActive && validSubOptions.length > 0 && validSubOptions[selectedSubOptionIndex])
            ? (validSubOptions[selectedSubOptionIndex].originalPrice || opt.originalPrice || trip?.originalPrice)
            : (opt.originalPrice || trip?.originalPrice);

          return (
            <div 
              key={index} 
              className={`${styles.categoryCard} ${isActive ? styles.activeCard : ''}`}
              onClick={() => {
                onSelectOption(index);
                onSelectSubOption(0); // Reset sub-option when changing main option
              }}
            >
              <div className={styles.imageWrapper}>
                {opt.image && <img src={opt.image} alt={opt.title} className={styles.image} />}
                {trip?.duration && (
                  <span className={styles.daysBadge}>
                    {trip.duration.match(/(\d+\s*Days?)/i)?.[1] || trip.duration}
                  </span>
                )}
              </div>
              <div className={styles.details}>
                <h4 className={styles.catTitle}>{opt.title}</h4>
                <div className={styles.pricing}>
                  {displayOrigPrice && <span className={styles.origPrice}>₹ {displayOrigPrice}</span>}
                  <span className={styles.discPrice}>₹ {displayPrice}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(() => {
        const validCurrentSubOptions = currentOption?.subOptions ? currentOption.subOptions.filter(sub => sub.name && sub.name.trim() !== '') : [];
        if (validCurrentSubOptions.length === 0) return null;

        return (
          <>
            <div className={styles.divider}></div>
            <h3 className={styles.sectionSubtitle}>Select Variant</h3>
            <div className={styles.optionsFlex}>
              {validCurrentSubOptions.map((sub, j) => {
                const isActive = selectedSubOptionIndex === j;
                const subOrigPrice = sub.originalPrice || currentOption.originalPrice || trip?.originalPrice;
                
                return (
                  <button
                    key={j}
                    className={`${styles.optionPill} ${isActive ? styles.activePill : ''}`}
                    onClick={() => onSelectSubOption(j)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <span>{sub.name} - </span>
                      {subOrigPrice && <span className={styles.origPrice} style={{ fontSize: '0.85em' }}>₹{subOrigPrice}</span>}
                      <span>₹{sub.price}</span>
                    </div>
                    {isActive && (
                      <div className={styles.checkBadge}>
                        <FiCheck size={10} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        );
      })()}
    </div>
  );
};

export default TripPackageOptions;
