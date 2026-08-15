import React from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import styles from './TripInclusions.module.css';

const renderIncExcList = (items, IconComponent, iconClass) => {
  return (
    <div className={styles.groupedList}>
      {items.map((item, index) => {
        if (typeof item === 'string') {
          return (
            <div key={index} className={styles.groupedItem} style={{ marginBottom: '0.85rem' }}>
              <div className={styles.pointRow} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
                <IconComponent className={iconClass} style={{ marginTop: '3px', flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            </div>
          );
        }
        
        // Structured format
        return (
          <div key={index} className={styles.structuredGroup} style={{ marginBottom: '1.2rem' }}>
            {item.title && <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.5rem' }}>{item.title}</div>}
            <div className={styles.pointsList} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {(item.points || []).map((point, pIdx) => (
                <div key={pIdx} className={styles.pointRow} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
                  <IconComponent className={iconClass} style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TripInclusions = ({ inclusions, exclusions, mapImage }) => {
  return (
    <div className={styles.incExcContainer} style={{ gridTemplateColumns: mapImage ? '1fr 1fr 1fr' : '1fr 1fr' }}>
      {/* Inclusions Card */}
      <div className={styles.incBox}>
        <h3 className={styles.incHeading}>Inclusions</h3>
        {renderIncExcList(inclusions, FiCheck, styles.checkIcon)}
      </div>

      {/* Map Card */}
      {mapImage && (
        <div className={styles.mapBox}>
          <h3 className={styles.incHeading} style={{ textAlign: 'center' }}>Tour Map</h3>
          <div className={styles.mapWrapper}>
            <img src={mapImage} alt="Tour Map" className={styles.mapImage} />
          </div>
        </div>
      )}

      {/* Exclusions Card */}
      <div className={styles.excBox}>
        <h3 className={styles.excHeading}>Exclusions</h3>
        {renderIncExcList(exclusions, FiX, styles.crossIcon)}
      </div>
    </div>
  );
};

export default TripInclusions;
