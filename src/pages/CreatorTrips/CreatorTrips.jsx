import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import TrendingCard from '../../components/TrendingSection/TrendingCard';
import { getCreatorTrips } from '../../services/api';
import styles from './CreatorTrips.module.css';

const CreatorTrips = () => {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTrips = async () => {
      try {
        const { data } = await getCreatorTrips();
        // Merge CreatorTrip data with LinkedTrip data for the card
        const mergedTrips = data.map(creatorTrip => {
          if (!creatorTrip.linkedTrip) return null;
          return {
            ...creatorTrip.linkedTrip, // Get base image, price, duration, etc.
            title: creatorTrip.title, // Override title
            slug: creatorTrip.slug || creatorTrip._id, // Override slug for correct routing
            _id: creatorTrip._id, // Keep original creator trip ID
          };
        }).filter(Boolean);

        setTrips(mergedTrips);
      } catch (error) {
        console.error('Failed to fetch creator trips:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrips();
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContent}>
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>Travel with your Favorite Creators</h1>
          <p className={styles.pageSubtitle}>Curated itineraries handpicked by top travel influencers and experts.</p>
        </div>

        {isLoading ? (
          <div className={styles.loaderContainer}>
            <div className={styles.loader}></div>
            <p>Loading Creator Trips...</p>
          </div>
        ) : (
          <div className={styles.tripsGrid}>
            {trips.map((trip, idx) => (
              <TrendingCard key={trip._id || idx} trip={trip} basePath="/creator-trip" />
            ))}
            {trips.length === 0 && (
              <div className={styles.noResults}>
                <p>No creator trips available at the moment. Check back later!</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CreatorTrips;
