import React, { useState } from 'react';
import { FiShare2 } from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import ShareModal from '../../../components/ShareModal/ShareModal';
import styles from './CreatorTripHeader.module.css';

const CreatorTripHeader = ({ trip, images }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <>
      <div className={styles.headerContainer}>
        <div className={styles.topInfo}>
          <div className={styles.creatorBadge}>
            Travel like {trip?.curatorName || 'Creator'} <MdVerified className={styles.verifiedIcon} />
          </div>
          <div className={styles.titleRow}>
            <h1 className={styles.tripTitle}>{trip?.title || 'Creator Trip'}</h1>
            <button className={styles.shareBtn} onClick={() => setIsShareModalOpen(true)}>
              <FiShare2 /> Share
            </button>
          </div>
        </div>

      <div className={styles.galleryGrid}>
        <div className={styles.mainImageWrapper}>
          <img src={images[0] || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39'} alt="Main" className={styles.galleryImage} />
        </div>
        <div className={styles.smallImagesGrid}>
          <img src={images[1] || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da'} alt="Gallery 1" className={styles.galleryImage} />
          <img src={images[2] || images[1]} alt="Gallery 2" className={styles.galleryImage} />
          <img src={images[3] || images[0]} alt="Gallery 3" className={styles.galleryImage} />
          <div className={styles.lastImageWrapper}>
            <img src={images[4] || images[1]} alt="Gallery 4" className={styles.galleryImage} />
            <button className={styles.viewAllBtn}>+ View All Photos</button>
          </div>
        </div>
      </div>
    </div>
      
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        tripTitle={trip?.title || "Creator Trip"} 
        creatorName={`Travel like ${trip?.curatorName || 'Creator'}`} 
        image={images[0]} 
      />
    </>
  );
};

export default CreatorTripHeader;
