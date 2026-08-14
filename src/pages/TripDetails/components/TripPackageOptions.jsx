import React from 'react';
import { FiCheck } from 'react-icons/fi';
import styles from './TripStayCategory.module.css';

const TripPackageOptions = ({ trip, options = [], selectedOptionIndex, onSelectOption, selectedSubOptionIndex, onSelectSubOption }) => {
  if (!options || options.length === 0) return null;

  const currentOption = options[selectedOptionIndex] || options[0];
  const variants = trip?.variants || [];
  const validVariants = variants.filter(v => v.name && v.name.trim() !== '');

  let selectedVariantAddon = 0;
  if (validVariants.length > 0) {
    const selectedVariant = selectedSubOptionIndex !== null ? validVariants[selectedSubOptionIndex] : null;
    if (selectedVariant) {
      selectedVariantAddon = Number(selectedVariant.price) || 0;
    }
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.sectionTitle}>Package Options</h3>
      
      <div className={styles.categoriesList}>
        {options.map((opt, index) => {
          const isActive = selectedOptionIndex === index;
          
          let displayPrice = Number(opt.price) || 0;
          let baseOrigPrice = Number(opt.originalPrice) || Number(trip?.originalPrice) || 0;
          
          let finalPrice = 0;
          let finalOrigPrice = null;
          
          if (displayPrice === 0 || displayPrice >= baseOrigPrice) {
            // No valid discount
            finalPrice = baseOrigPrice + selectedVariantAddon;
          } else {
            // Valid discount
            finalPrice = displayPrice + selectedVariantAddon;
            finalOrigPrice = baseOrigPrice + selectedVariantAddon;
          }

          return (
            <div 
              key={index} 
              className={`${styles.categoryRow} ${isActive ? styles.activeRow : ''}`}
              onClick={() => {
                onSelectOption(isActive ? null : index);
                onSelectSubOption(null); // Reset sub-option when changing main option
              }}
            >
              <div className={styles.rowLeft}>
                {opt.image && (
                  <div className={styles.rowImageWrapper}>
                    <img src={opt.image} alt={opt.title} className={styles.rowImage} />
                  </div>
                )}
                <div className={styles.rowDetails}>
                  <h4 className={styles.rowTitle}>{opt.title}</h4>
                  {trip?.duration && (
                    <span className={styles.rowBadge}>
                      {trip.duration.match(/(\d+\s*Days?)/i)?.[1] || trip.duration}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.rowRight}>
                <div className={styles.rowPricing}>
                  {finalOrigPrice && <span className={styles.rowOrigPrice}>₹ {finalOrigPrice}</span>}
                  <span className={styles.rowDiscPrice}>₹ {finalPrice}</span>
                </div>
                <div className={styles.rowRadio}>
                  {isActive && <div className={styles.radioInner} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(() => {
        if (validVariants.length === 0) return null;

        return (
          <>
            <div className={styles.divider}></div>
            <h3 className={styles.sectionSubtitle}>Select Variant</h3>
            <div className={styles.optionsFlex}>
              {validVariants.map((variant, j) => {
                const isActive = selectedSubOptionIndex === j;
                const extraPrice = Number(variant.price) || 0;
                
                return (
                  <button
                    key={j}
                    className={`${styles.optionPill} ${isActive ? styles.activePill : ''}`}
                    onClick={() => onSelectSubOption(isActive ? null : j)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <span>{variant.name}</span>
                      {extraPrice > 0 && <span style={{ fontWeight: '600' }}> (+₹{extraPrice})</span>}
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
