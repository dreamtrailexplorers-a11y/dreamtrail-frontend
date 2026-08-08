import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './AboutSnippet.module.css';

const AboutSnippet = ({ data }) => {
  const [localData, setLocalData] = useState(null);

  useEffect(() => {
    if (!data) {
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/settings`)
        .then(res => setLocalData(res.data?.aboutSnippet))
        .catch(err => console.error(err));
    }
  }, [data]);

  const snippetData = data || localData;

  if (!snippetData) return null;
  
  if (!snippetData.title?.trim() && !snippetData.text?.trim()) {
    return null;
  }

  return (
    <section className={styles.snippetSection}>
      <div className={styles.snippetContainer}>
        
        {/* Left Side: Content */}
        <div className={styles.snippetLeft}>
          {snippetData.title && <h2 className={styles.snippetTitle}>{snippetData.title}</h2>}
          <div className={styles.titleUnderline}></div>
          {snippetData.text && <p className={styles.snippetText}>{snippetData.text}</p>}
          <Link to="/about" className={styles.knowMoreBtn}>
            <em>Know More</em> &rarr;
          </Link>
        </div>

        {/* Right Side: Points (No Icons) */}
        {snippetData.points && snippetData.points.length > 0 && (
          <div className={styles.snippetRight}>
            <div className={styles.pointsList}>
              {snippetData.points.map((point, idx) => (
                <div key={idx} className={styles.pointItem}>
                  <div className={styles.pointMarker}></div>
                  <div className={styles.pointText}>{point.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default AboutSnippet;
