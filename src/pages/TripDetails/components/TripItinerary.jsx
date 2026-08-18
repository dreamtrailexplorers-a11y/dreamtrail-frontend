import React, { useState } from 'react';
import { FiDownload, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import styles from './TripItinerary.module.css';

const TripItinerary = ({ itineraryDays, onOpenEnquiry }) => {
  const [expandedItinerary, setExpandedItinerary] = useState({ 0: true, 1: true });
  const isAllExpanded = itineraryDays.length > 0 && itineraryDays.every((_, idx) => expandedItinerary[idx]);

  const toggleItineraryDay = (dayIndex) => {
    setExpandedItinerary((prev) => ({
      ...prev,
      [dayIndex]: !prev[dayIndex]
    }));
  };

  const handleToggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedItinerary({});
    } else {
      const allDays = {};
      itineraryDays.forEach((_, idx) => {
        allDays[idx] = true;
      });
      setExpandedItinerary(allDays);
    }
  };

  return (
    <div className={styles.sectionBlock}>
      <div className={styles.itineraryHeaderRow}>
        <h2 className={styles.blockTitle}>Itinerary</h2>
        <div className={styles.itineraryActions}>
          <button className={styles.outlineBtn} onClick={handleToggleExpandAll}>
            {isAllExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      </div>

      <div className={styles.itineraryList}>
        {itineraryDays.map((item, idx) => {
          const isExpanded = !!expandedItinerary[idx];
          return (
            <div key={idx} className={`${styles.itineraryCard} ${isExpanded ? styles.activeItinerary : ''}`}>
              <div 
                className={styles.itineraryCardHeader}
                onClick={() => toggleItineraryDay(idx)}
              >
                <div className={styles.dayTitleGroup}>
                  <span className={styles.dayBadge}>{item.day}</span>
                  <span className={styles.dayTitle}>{item.title}</span>
                </div>
                {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
              </div>
              {isExpanded && (
                <div className={styles.itineraryBody}>
                  {item.paragraphs && item.paragraphs.length > 0 && (
                    <div className={styles.itineraryParagraphs}>
                      {item.paragraphs.map((para, pIdx) => (
                        <p key={pIdx} style={{ marginBottom: '10px', lineHeight: '1.6', color: '#475569' }}>
                          {para}
                        </p>
                      ))}
                    </div>
                  )}
                  {item.points && item.points.length > 0 && (
                    <ul className={styles.itineraryDescList}>
                      {item.points.map((point, ptIdx) => (
                        <li key={ptIdx}>{point}</li>
                      ))}
                    </ul>
                  )}
                  
                  {/* Fallback for old data without paragraphs/points */}
                  {!(item.paragraphs?.length) && !(item.points?.length) && item.desc && (
                    <ul className={styles.itineraryDescList}>
                      {item.desc.split('\n').map((line, lIdx) => {
                        if(!line.trim()) return null;
                        return <li key={lIdx}>{line}</li>;
                      })}
                    </ul>
                  )}
                  {item.image && (
                    <div style={{ marginTop: '15px' }}>
                      <img src={item.image} alt={item.title} style={{ width: '160px', height: '160px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TripItinerary;
