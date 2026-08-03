import React from 'react';
import { MdVerified } from 'react-icons/md';
import { FiUserPlus } from 'react-icons/fi';
import styles from './CuratorProfile.module.css';

const CuratorProfile = ({ trip }) => {
  return (
    <div className={styles.curatorCard}>
      <p className={styles.curatorLabel}>This trip is curated by</p>
      <div className={styles.profileRow}>
        <div className={styles.avatarWrapper}>
          <img 
            src={trip?.curatorAvatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"} 
            alt={trip?.curatorName || "Curator"} 
            className={styles.avatar} 
          />
        </div>
        
        <div className={styles.infoCol}>
          <h3 className={styles.name}>
            {trip?.curatorName || "Creator"} <MdVerified className={styles.verifiedIcon} />
          </h3>
          <p className={styles.bio}>@{trip?.curatorName?.toLowerCase().replace(/\s+/g, '') || "creator"}</p>
          <div className={styles.stats}>
            <span className={styles.statDot}></span> {trip?.curatorFollowers || "0 followers"}
          </div>
        </div>

        <button className={styles.followBtn}>
          <FiUserPlus /> Follow
        </button>
      </div>
    </div>
  );
};

export default CuratorProfile;
