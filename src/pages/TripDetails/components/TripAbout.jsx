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

  // Fallback to hardcoded text if aboutTrip is empty
  return (
    <div className={styles.sectionBlock}>
      <h2 className={styles.blockTitle}>About this Trip</h2>
      <p className={styles.aboutText}>
        The <strong>{trip.title}</strong> is one of India's most iconic high-altitude motorcycle adventures.
        Riding through dramatic Himalayan terrain, ancient monasteries, remote villages, and moon-like landscapes,
        this journey is a dream for every biker.
        {!readMoreAbout && (
          <span className={styles.readMoreBtn} onClick={() => setReadMoreAbout(true)}> ...Read More</span>
        )}
      </p>
      {readMoreAbout && (
        <p className={styles.aboutTextExtra}>
          This <strong>{trip.duration} {trip.title}</strong> by DreamTrail is crafted for riders who want
          a perfect balance of adventure, safety, breathtaking views, and seamless execution. Equipped with backup vehicles,
          expert trip marshals, medical oxygen support, and comfortable mountain stays, you can focus purely on the joy of riding!
          <span className={styles.readMoreBtn} onClick={() => setReadMoreAbout(false)}> Show Less</span>
        </p>
      )}
    </div>
  );
};

export default TripAbout;
