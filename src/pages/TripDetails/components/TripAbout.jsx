import React, { useState } from 'react';
import styles from './TripAbout.module.css';

const TripAbout = ({ trip }) => {
  const [readMoreAbout, setReadMoreAbout] = useState(false);

  const hasHighlights = trip.tourHighlights && trip.tourHighlights.length > 0;
  const hasAbout = trip.aboutTrip && trip.aboutTrip.trim() !== '';

  if (!hasHighlights && !hasAbout) {
    return null;
  }

  let paragraphs = [];
  if (hasAbout) {
    paragraphs = trip.aboutTrip.split('\n').filter(p => p.trim() !== '');
  }

  return (
    <div className={styles.sectionBlock}>
      <h2 className={styles.blockTitle}>About The Tour</h2>
      
      {hasHighlights && (
        <div style={{ marginBottom: '25px' }}>
          <h3 className={styles.highlightsTitle}>Tour Highlights</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {trip.tourHighlights.map((highlight, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '1rem', color: '#334155', lineHeight: '1.6' }}>
                <svg width="18" height="18" viewBox="0 0 16 16" style={{ flexShrink: 0, marginTop: '4px' }}>
                  <circle cx="8" cy="8" r="6" fill="#fff" stroke="#cc0000" strokeWidth="3.5" />
                </svg>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasAbout && paragraphs.length > 0 && (
        <div>
          {paragraphs.length <= 1 ? (
            <p className={styles.aboutText}>{paragraphs[0]}</p>
          ) : (
            <>
              <p className={styles.aboutText}>
                {paragraphs[0]}
                {!readMoreAbout && (
                  <span className={styles.readMoreBtn} onClick={() => setReadMoreAbout(true)}> ...Read More</span>
                )}
              </p>
              {readMoreAbout && (
                <div className={styles.aboutTextExtra}>
                  {paragraphs.slice(1).map((p, i) => <p key={i} style={{ marginBottom: '10px' }}>{p}</p>)}
                  <span className={styles.readMoreBtn} onClick={() => setReadMoreAbout(false)}> Show Less</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TripAbout;
