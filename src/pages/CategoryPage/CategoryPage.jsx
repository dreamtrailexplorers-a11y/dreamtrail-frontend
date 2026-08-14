import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import TrendingCard from '../../components/TrendingSection/TrendingCard';
import { getTrips } from '../../services/api';
import styles from './CategoryPage.module.css';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const decodedCategory = decodeURIComponent(categoryName);

  const [activeCategory, setActiveCategory] = useState("All");
  const [allTrips, setAllTrips] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const { data } = await getTrips();
        // Filter to only show trips matching the decoded category from the URL
        const categoryTripsData = data.filter(t => t.category === decodedCategory);

        // Extract unique destinations for filter pills
        const uniqueDestinations = [...new Set(categoryTripsData.map(t => t.destination || 'Other'))];
        setCategories(["All", ...uniqueDestinations]);

        setAllTrips(categoryTripsData);
      } catch (error) {
        console.error(`Failed to fetch trips for ${decodedCategory}:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [decodedCategory]);

  const filteredTrips = activeCategory === "All" 
    ? allTrips 
    : allTrips.filter(trip => (trip.destination || 'Other') === activeCategory);

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContent}>
        {/* Title for the Category */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a' }}>{decodedCategory}</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Handcrafted experiences for {decodedCategory.toLowerCase()}</p>
        </div>

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
        {loading ? (
          <div className={styles.noResults}>
            <p>Loading {decodedCategory}...</p>
          </div>
        ) : (
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
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
