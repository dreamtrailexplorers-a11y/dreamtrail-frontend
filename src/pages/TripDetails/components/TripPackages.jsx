import React, { useEffect } from 'react';
import { FiCheck } from 'react-icons/fi';
import styles from './TripPackages.module.css';

const TripPackages = ({ departureDates, selectedDepartureDate, setSelectedDepartureDate }) => {
  useEffect(() => {
    if (departureDates && departureDates.length > 0 && !selectedDepartureDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const firstAvailable = departureDates.find(d => {
        const sd = new Date(d.start);
        return (isNaN(sd) || sd >= today) && d.status !== 'Sold Out';
      });
      setSelectedDepartureDate(firstAvailable || departureDates[0]);
    }
  }, [departureDates, selectedDepartureDate, setSelectedDepartureDate]);

  if (!departureDates || departureDates.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <>
      {/* Departure Dates */}
      <div className={styles.sectionBlock}>
        <h2 className={styles.blockTitle}>Departure Dates</h2>
        
        <div className={styles.datesList} style={{ marginTop: '20px' }}>
          {departureDates.map((dateItem, index) => {
            const startDate = new Date(dateItem.start);
            const endDate = new Date(dateItem.end);
            
            // Format dates e.g. "10 Aug"
            const startFormatted = isNaN(startDate) ? dateItem.start : startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            const endFormatted = isNaN(endDate) ? dateItem.end : endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            
            // Format days e.g. "Sat"
            const startDay = isNaN(startDate) ? '' : startDate.toLocaleDateString('en-GB', { weekday: 'short' });
            const endDay = isNaN(endDate) ? '' : endDate.toLocaleDateString('en-GB', { weekday: 'short' });

            const isPast = !isNaN(startDate) && startDate < today;
            const isSoldOut = dateItem.status === 'Sold Out';
            const isUnavailable = isPast || isSoldOut;
            const displayStatus = isPast ? 'Unavailable' : (dateItem.status || 'Available');

            const isSelected = selectedDepartureDate === dateItem;

            return (
              <div 
                key={index} 
                className={`${styles.dateRow} ${isSelected ? styles.activeDateRow : ''}`}
                onClick={() => {
                  if (!isUnavailable) setSelectedDepartureDate(dateItem);
                }}
                style={{ 
                  cursor: isUnavailable ? 'not-allowed' : 'pointer', 
                  opacity: isUnavailable ? 0.6 : 1,
                  backgroundColor: isUnavailable ? '#f8fafc' : undefined
                }}
              >
                <div className={styles.dateInfo}>
                  <div className={styles.dateColBlock}>
                    <strong className={isSelected ? styles.activeTextRed : ''}>{startFormatted}</strong>
                    <span className={styles.dayLabel}>{startDay}</span>
                  </div>
                  <span className={styles.dateArrow}>→</span>
                  <div className={styles.dateColBlock}>
                    <strong className={isSelected ? styles.activeTextRed : ''}>{endFormatted}</strong>
                    <span className={styles.dayLabel}>{endDay}</span>
                  </div>
                </div>

                <div className={styles.availabilityCol}>
                  <span className={styles.availPill} style={{
                    backgroundColor: isUnavailable ? '#fee2e2' : '#dcfce7',
                    color: isUnavailable ? '#ef4444' : '#16a34a'
                  }}>
                    <FiCheck size={12} /> {displayStatus}
                  </span>
                </div>

                <div className={styles.datePriceBlock}>
                  {dateItem.price && <span className={styles.datePrice}>₹{dateItem.price}</span>}
                  <span className={styles.taxSub}>+ taxes</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default TripPackages;
