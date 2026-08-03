import React from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import styles from './TripInclusions.module.css';

const TripInclusions = ({ inclusions, exclusions }) => {
  return (
    <div className={styles.incExcContainer}>
      {/* Inclusions Card */}
      <div className={styles.incBox}>
        <h3 className={styles.incHeading}>Inclusions</h3>
        <ul className={styles.incList}>
          {inclusions.map((inc, index) => (
            <li key={index}>
              <FiCheck className={styles.checkIcon} />
              <span>{inc}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Exclusions Card */}
      <div className={styles.excBox}>
        <h3 className={styles.excHeading}>Exclusions</h3>
        <ul className={styles.excList}>
          {exclusions.map((exc, index) => (
            <li key={index}>
              <FiX className={styles.crossIcon} />
              <span>{exc}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TripInclusions;
