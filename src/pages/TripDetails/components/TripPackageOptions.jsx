import React, { useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import styles from './TripStayCategory.module.css';

const TripPackageOptions = ({ trip, options = [], selectedOptionIndices = [], onSelectOption, selectedSubOptionIndex, onSelectSubOption }) => {
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  if (!options || options.length === 0) return null;

  const variants = trip?.variants || [];
  const validVariants = variants.filter(v => v.name && v.name.trim() !== '');

  let selectedVariantAddon = 0;
  if (validVariants.length > 0) {
    const selectedVariant = selectedSubOptionIndex !== null ? validVariants[selectedSubOptionIndex] : null;
    if (selectedVariant) {
      selectedVariantAddon = Number(selectedVariant.price) || 0;
    }
  }

  const handleToggle = (index) => {
    if (isMultiSelect) {
      if (selectedOptionIndices.includes(index)) {
        onSelectOption(selectedOptionIndices.filter(i => i !== index));
      } else {
        onSelectOption([...selectedOptionIndices, index]);
      }
    } else {
      // Single select mode
      if (selectedOptionIndices.includes(index)) {
        // If clicking the already selected one, do nothing (or maybe allow deselect?)
        // Usually radio buttons don't allow deselect, so we do nothing.
      } else {
        onSelectOption([index]);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Package Options</h3>
        <button 
          onClick={() => {
            if (isMultiSelect && selectedOptionIndices.length > 1) {
              // If turning off and multiple selected, just keep the first one
              onSelectOption([selectedOptionIndices[0]]);
            }
            setIsMultiSelect(!isMultiSelect);
          }}
          style={{
            background: isMultiSelect ? '#fff' : '#fff',
            border: '1px solid #e60000',
            color: '#e60000',
            fontWeight: '600',
            fontSize: '0.85rem',
            cursor: 'pointer',
            padding: '6px 14px',
            borderRadius: '6px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 5px rgba(230, 0, 0, 0.05)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; }}
        >
          {isMultiSelect ? 'Single Selection Mode' : '+ Choose Multiple Options'}
        </button>
      </div>
      
      <div className={styles.categoriesList}>
        {options.map((opt, index) => {
          const isActive = selectedOptionIndices.includes(index);
          
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
              onClick={() => handleToggle(index)}
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
                <div style={{ width: '22px', height: '22px', borderRadius: isMultiSelect ? '4px' : '50%', border: isActive ? '2px solid #e60000' : '2px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isActive ? '#e60000' : 'transparent', transition: 'all 0.2s' }}>
                  {isActive && (isMultiSelect ? <FiCheck color="#fff" size={14} strokeWidth={3} /> : <div style={{width: '8px', height: '8px', backgroundColor: '#fff', borderRadius: '50%'}}></div>)}
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
