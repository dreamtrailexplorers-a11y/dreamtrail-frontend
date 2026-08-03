import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import TrendingCard from '../../components/TrendingSection/TrendingCard';
import { getTrips } from '../../services/api';
import styles from './GroupTrips.module.css';

const GroupTrips = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [allTrips, setAllTrips] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTrips = async () => {
      try {
        const { data } = await getTrips();
        // Filter to only show trips with category 'Group Trip'
        const groupTripsData = data.filter(t => t.category === 'Group Trip');

        // Extract unique destinations for category pills
        const uniqueDestinations = [...new Set(groupTripsData.map(t => t.destination || 'Other'))];
        setCategories(["All", ...uniqueDestinations]);

        setAllTrips(groupTripsData);
      } catch (error) {
        console.error('Failed to fetch group trips:', error);
      }
    };
    fetchTrips();
  }, []);

  const filteredTrips = activeCategory === "All" 
    ? allTrips 
    : allTrips.filter(trip => (trip.destination || 'Other') === activeCategory);

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContent}>
        {/* Filter Pills */}
        <div className={styles.filterContainer}>
          <div className={styles.filterScroll}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`${styles.filterPill} ${activeCategory === cat ? styles.active : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Trips Grid */}
        <div className={styles.tripsGrid}>
          {filteredTrips.map((trip, idx) => (
            <TrendingCard key={trip._id || idx} trip={trip} />
          ))}
          {filteredTrips.length === 0 && (
            <div className={styles.noResults}>
              <p>No trips found for {activeCategory}.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GroupTrips;
