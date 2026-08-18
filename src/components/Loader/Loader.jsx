import React from 'react';
import styles from './Loader.module.css';

const Loader = ({ fullScreen = false }) => {
  return (
    <div className={`${styles.loaderContainer} ${fullScreen ? styles.fullScreen : ''}`}>
      <div className={styles.logoWrapper}>
        <img src="/logo.png" alt="Loading..." className={styles.logo} />
        <div className={styles.spinner}></div>
      </div>
    </div>
  );
};

export default Loader;
