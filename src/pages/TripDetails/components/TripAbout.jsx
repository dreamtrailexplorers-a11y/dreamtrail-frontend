import React, { useState } from 'react';
import styles from './TripAbout.module.css';

const TripAbout = ({ trip }) => {
  const [readMoreAbout, setReadMoreAbout] = useState(false);

  if (trip.aboutTrip) {
    const paragraphs = trip.aboutTrip.split('\n').filter(p => p.trim() !== '');
    
    if (paragraphs.length <= 1) {
      return (
        <div className={styles.sectionBlock}>
          <h2 className={styles.blockTitle}>About this Trip</h2>
          {paragraphs.map((p, i) => <p key={i} className={styles.aboutText}>{p}</p>)}
        </div>
      );
    }
    
    const firstPara = paragraphs[0];
    const restParas = paragraphs.slice(1);

    return (
      <div className={styles.sectionBlock}>
        <h2 className={styles.blockTitle}>About this Trip</h2>
        <p className={styles.aboutText}>
          {firstPara}
          {!readMoreAbout && (
            <span className={styles.readMoreBtn} onClick={() => setReadMoreAbout(true)}> ...Read More</span>
          )}
        </p>
        {readMoreAbout && (
          <div className={styles.aboutTextExtra}>
            {restParas.map((p, i) => <p key={i} style={{ marginBottom: '10px' }}>{p}</p>)}
            <span className={styles.readMoreBtn} onClick={() => setReadMoreAbout(false)}> Show Less</span>
          </div>
        )}
      </div>
    );
  }

  // Render nothing if aboutTrip is empty
  return null;
};

export default TripAbout;
