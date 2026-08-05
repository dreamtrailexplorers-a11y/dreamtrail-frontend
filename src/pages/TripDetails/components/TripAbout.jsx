import React, { useState } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
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
      <h2 className={styles.blockTitle} style={{ textTransform: 'uppercase', color: '#dc2626' }}>About The Tour</h2>
      
      {hasHighlights && (
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#dc2626', marginBottom: '15px' }}>Tour Highlights</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {trip.tourHighlights.map((highlight, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.95rem', color: '#334155', lineHeight: '1.6' }}>
                <FiCheckCircle style={{ color: '#dc2626', fontSize: '1.1rem', marginTop: '3px', flexShrink: 0 }} />
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
