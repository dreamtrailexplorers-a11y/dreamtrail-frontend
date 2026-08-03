import React from 'react';
import { FaMotorcycle, FaBed, FaUtensils, FaBinoculars, FaBus, FaUserTie, FaCheck } from 'react-icons/fa';
import styles from './TripAmenities.module.css';

const getIconForAmenity = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('bike') || lower.includes('motorcycle') || lower.includes('fuel')) return <FaMotorcycle className={styles.amenityIcon} />;
  if (lower.includes('stay') || lower.includes('hotel') || lower.includes('accommodation') || lower.includes('camp')) return <FaBed className={styles.amenityIcon} />;
  if (lower.includes('meal') || lower.includes('food') || lower.includes('breakfast') || lower.includes('dinner')) return <FaUtensils className={styles.amenityIcon} />;
  if (lower.includes('sightseeing') || lower.includes('tour')) return <FaBinoculars className={styles.amenityIcon} />;
  if (lower.includes('vehicle') || lower.includes('bus') || lower.includes('transport') || lower.includes('transfer')) return <FaBus className={styles.amenityIcon} />;
  if (lower.includes('leader') || lower.includes('guide') || lower.includes('marshal') || lower.includes('expert')) return <FaUserTie className={styles.amenityIcon} />;
  return <FaCheck className={styles.amenityIcon} />;
};

const TripAmenities = ({ trip }) => {
  if (!trip || !trip.amenities || trip.amenities.length === 0) return null;

  return (
    <div className={styles.amenitiesCard}>
      {trip.amenities.map((amenity, index) => (
        <div key={index} className={styles.amenityItem}>
          {getIconForAmenity(amenity)}
          <div>
            <span className={styles.amenityTitle}>{amenity}</span>
            <span className={styles.amenityStatus}>included</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TripAmenities;
