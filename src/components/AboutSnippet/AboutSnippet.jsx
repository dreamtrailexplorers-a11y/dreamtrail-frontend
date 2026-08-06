import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './AboutSnippet.module.css';
import { FiTarget, FiMap, FiUsers, FiStar } from 'react-icons/fi';

const AboutSnippet = ({ data }) => {
  const [localData, setLocalData] = useState(null);

  useEffect(() => {
    if (!data) {
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/settings`)
        .then(res => setLocalData(res.data?.aboutPage))
        .catch(err => console.error(err));
    }
  }, [data]);

  const snippetData = data || localData;

  if (!snippetData) return null;
  // If title and text are totally empty, don't show the white box at all
  if (!snippetData.introTitle1?.trim() && !snippetData.introText1?.trim()) {
    return null;
  }

  // Fallback icon mapping if icon string matches
  const getIcon = (iconName, index) => {
    switch (iconName) {
      case 'FiTarget': return <FiTarget />;
      case 'FiMap': return <FiMap />;
      case 'FiUsers': return <FiUsers />;
      default: 
        // Fallbacks based on index
        if (index === 0) return <FiStar />;
        if (index === 1) return <FiMap />;
        if (index === 2) return <FiUsers />;
        if (index === 3) return <FiUsers />;
        return <FiStar />;
    }
  };

  return (
    <section className={styles.snippetSection}>
      <div className={styles.snippetContainer} style={{ justifyContent: 'center' }}>
        {/* Left Side: Content */}
        <div className={styles.snippetLeft} style={{ flex: 'none', maxWidth: '800px', textAlign: 'center', paddingLeft: 0 }}>
          {snippetData.introTitle1 && <h2 className={styles.snippetTitle}>{snippetData.introTitle1}</h2>}
          <div className={styles.titleUnderline} style={{ margin: '0 auto 20px auto' }}></div>
          {snippetData.introText1 && <p className={styles.snippetText} style={{ textAlign: 'center', whiteSpace: 'pre-line' }}>{snippetData.introText1}</p>}
          <Link to="/about" className={styles.knowMoreBtn}>
            Know More &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutSnippet;
