import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import TrendingCard from '../../components/TrendingSection/TrendingCard';
import CategoryMenu from '../../components/CategoryMenu/CategoryMenu';
import styles from './TourPackages.module.css';

import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { getTrips, getDestinations } from '../../services/api';
import { iconMap } from '../../utils/iconMap';

const TourPackages = () => {
  const [trips, setTrips] = useState([]);
  const [groupedTrips, setGroupedTrips] = useState({});
  const [destinations, setDestinations] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const navScrollRef = React.useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const [{ data: tripsData }, { data: destData }] = await Promise.all([
          getTrips(),
          getDestinations()
        ]);
        setTrips(tripsData);
        setDestinations(destData);
        // Group by destination
        const groups = tripsData.reduce((acc, trip) => {
          const dest = trip.destination || 'Other';
          if (!acc[dest]) acc[dest] = [];
          acc[dest].push(trip);
          return acc;
        }, {});
        setGroupedTrips(groups);
        setActiveCategory('All');
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const handleCategoryClick = (id) => {
    setActiveCategory(id);
    // Optionally scroll to the top of the main container so the grid is visible
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const scrollNav = (direction) => {
    if (navScrollRef.current) {
      const scrollAmount = 300;
      navScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRow = (id, direction) => {
    const row = document.getElementById(`row-${id}`);
    if (row) {
      const scrollAmount = window.innerWidth > 768 ? 800 : 300;
      row.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      {/* Sticky Category Navigation */}
      <div className={styles.navContainer}>
        <div className={styles.navWrapper}>
          <button className={styles.scrollBtn} onClick={() => scrollNav('left')}><FiChevronLeft /></button>
          
          <div className={styles.navScroll} ref={navScrollRef}>
            <button 
              className={`${styles.navItem} ${activeCategory === 'All' ? styles.active : ''}`}
              onClick={() => handleCategoryClick('All')}
            >
              <div className={styles.navIcon}>{iconMap['TbBuildingSkyscraper']}</div>
              <span className={styles.navLabel}>All</span>
            </button>
            {Object.keys(groupedTrips).map(destName => {
              const destObj = destinations.find(d => d.name === destName);
              const icon = destObj && destObj.icon && iconMap[destObj.icon] 
                ? iconMap[destObj.icon] 
                : iconMap['TbBuildingSkyscraper'];
              
              return (
                <button 
                  key={destName}
                  className={`${styles.navItem} ${activeCategory === destName ? styles.active : ''}`}
                  onClick={() => handleCategoryClick(destName)}
                >
                  <div className={styles.navIcon}>{icon}</div>
                  <span className={styles.navLabel}>{destName}</span>
                </button>
              );
            })}
          </div>

          <button className={styles.scrollBtn} onClick={() => scrollNav('right')}><FiChevronRight /></button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContainer}>
        
        {activeCategory && (
          <section id={activeCategory} className={styles.categorySection}>
            {(() => {
              const activeTrips = activeCategory === 'All' ? trips : groupedTrips[activeCategory] || [];
              const tourPackages = activeTrips.filter(t => t.category === 'Motorcycle Tours');
              const groupTrips = activeTrips.filter(t => t.category === 'Group Tours');
              const otherTrips = activeTrips.filter(t => t.category !== 'Motorcycle Tours' && t.category !== 'Group Tours');

              return (
                <>
                  {tourPackages.length > 0 && (
                    <div style={{marginBottom: '3rem'}}>
                      <h3 className={styles.categorySubTitle}>Motorcycle Tours</h3>
                      <div className={styles.tripsGrid}>
                        {tourPackages.map(trip => (
                          <TrendingCard key={trip._id} trip={trip} />
                        ))}
                      </div>
                    </div>
                  )}

                  {groupTrips.length > 0 && (
                    <div style={{marginBottom: '3rem'}}>
                      <h3 className={styles.categorySubTitle}>Group Tours</h3>
                      <div className={styles.tripsGrid}>
                        {groupTrips.map(trip => (
                          <TrendingCard key={trip._id} trip={trip} />
                        ))}
                      </div>
                    </div>
                  )}

                  {otherTrips.length > 0 && (
                    <div style={{marginBottom: '3rem'}}>
                      <h3 className={styles.categorySubTitle}>Other Experiences</h3>
                      <div className={styles.tripsGrid}>
                        {otherTrips.map(trip => (
                          <TrendingCard key={trip._id} trip={trip} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </section>
        )}

      </div>

      <Footer />
    </div>
  );
};

export default TourPackages;
