import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import TrendingCard from '../../components/TrendingSection/TrendingCard';
import CategoryMenu from '../../components/CategoryMenu/CategoryMenu';
import styles from './TourPackages.module.css';

import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { getTrips, getDestinations } from '../../services/api';
import { iconMap } from '../../utils/iconMap';

const filterTrips = (allTrips, category) => {
  if (!category || category === 'All') return allTrips;
  const q = category.toLowerCase().trim();

  return allTrips.filter(trip => {
    const dest = (trip.destination || '').toLowerCase();
    const title = (trip.title || '').toLowerCase();
    const route = (trip.route || '').toLowerCase();
    const overview = (trip.overview || '').toLowerCase();
    const subtitle = (trip.subtitle || '').toLowerCase();
    const itineraryStr = JSON.stringify(trip.itinerary || '').toLowerCase();
    const highlightsStr = JSON.stringify(trip.highlights || '').toLowerCase();

    // 1. Direct match on destination or title
    if (dest.includes(q) || title.includes(q)) return true;

    // 2. Special Spiti mapping (matches Middle Kingdom, Himachal, Spiti)
    if (q === 'spiti') {
      if (dest.includes('himachal') || route.includes('spiti') || overview.includes('spiti') || itineraryStr.includes('spiti') || title.includes('spiti')) {
        return true;
      }
    }

    // 3. Special Zanskar mapping (matches Discover Hidden Horizons, Whispers, Ride Beyond Limit, Conquer Himalayan Heights)
    if (q === 'zanskar') {
      if (route.includes('zanskar') || overview.includes('zanskar') || itineraryStr.includes('zanskar') || title.includes('zanskar') || highlightsStr.includes('zanskar')) {
        return true;
      }
    }

    // 4. Special Ladakh mapping
    if (q === 'ladakh') {
      if (dest.includes('ladakh') || route.includes('leh') || route.includes('ladakh')) {
        return true;
      }
    }

    // 5. Special Tawang mapping
    if (q === 'tawang') {
      if (dest.includes('tawang') || route.includes('tawang') || title.includes('tawang')) {
        return true;
      }
    }

    // 6. Special Bhutan mapping
    if (q === 'bhutan') {
      if (dest.includes('bhutan') || title.includes('bhutan')) {
        return true;
      }
    }

    return route.includes(q) || overview.includes(q) || subtitle.includes(q) || itineraryStr.includes(q);
  });
};

const TourPackages = () => {
  const [trips, setTrips] = useState([]);
  const [groupedTrips, setGroupedTrips] = useState({});
  const [destinations, setDestinations] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchParams, setSearchParams] = useSearchParams();
  const navScrollRef = useRef(null);

  const filterParam = searchParams.get('filter') || searchParams.get('search') || searchParams.get('destination');

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

        const currentFilter = searchParams.get('filter') || searchParams.get('search') || searchParams.get('destination');
        if (currentFilter) {
          setActiveCategory(currentFilter);
        } else {
          setActiveCategory('All');
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (filterParam) {
      setActiveCategory(filterParam);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [filterParam]);

  const handleCategoryClick = (id) => {
    setActiveCategory(id);
    if (id === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ filter: id });
    }
    // Scroll to the top of the page so the grid is perfectly visible below the sticky nav
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollNav = (direction) => {
    if (navScrollRef.current) {
      const scrollAmount = 300;
      navScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  // Build nav category list including popular tour destinations
  const popularTabs = ['Ladakh', 'Zanskar', 'Spiti', 'Tawang', 'Bhutan'];
  const otherDestinations = Object.keys(groupedTrips).filter(d => 
    !popularTabs.some(p => p.toLowerCase() === d.toLowerCase().trim()) &&
    !d.toLowerCase().includes('himachal')
  );
  const allNavCategories = ['All', ...popularTabs, ...otherDestinations];

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      {/* Sticky Category Navigation */}
      <div className={styles.navContainer}>
        <div className={styles.navWrapper}>
          <button className={styles.scrollBtn} onClick={() => scrollNav('left')}><FiChevronLeft /></button>
          
          <div className={styles.navScroll} ref={navScrollRef}>
            {allNavCategories.map(catName => {
              const destObj = destinations.find(d => d.name?.toLowerCase().trim() === catName.toLowerCase().trim());
              const icon = destObj && destObj.icon && iconMap[destObj.icon] 
                ? iconMap[destObj.icon] 
                : iconMap['TbBuildingSkyscraper'];
              const isSelected = activeCategory?.toLowerCase().trim() === catName.toLowerCase().trim();
              
              return (
                <button 
                  key={catName}
                  className={`${styles.navItem} ${isSelected ? styles.active : ''}`}
                  onClick={() => handleCategoryClick(catName)}
                >
                  <div className={styles.navIcon}>{icon}</div>
                  <span className={styles.navLabel}>{catName}</span>
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
              const activeTrips = filterTrips(trips, activeCategory);
              const tourPackages = activeTrips.filter(t => t.category === 'Motorcycle Tours');
              const groupTrips = activeTrips.filter(t => t.category === 'Group Tours');
              const otherTrips = activeTrips.filter(t => t.category !== 'Motorcycle Tours' && t.category !== 'Group Tours');

              return (
                <>
                  {activeCategory !== 'All' && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '2rem',
                      flexWrap: 'wrap',
                      gap: '12px',
                      background: '#f8fafc',
                      padding: '1rem 1.25rem',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <span style={{ fontSize: '1.05rem', color: '#334155', fontWeight: '600' }}>
                        Showing packages for <strong style={{ color: '#0f172a' }}>"{activeCategory}"</strong> ({activeTrips.length} tour{activeTrips.length === 1 ? '' : 's'} found)
                      </span>
                      <button 
                        onClick={() => handleCategoryClick('All')}
                        style={{
                          background: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 16px',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Show All Tours
                      </button>
                    </div>
                  )}

                  {tourPackages.length > 0 && (
                    <div style={{marginBottom: '3rem'}}>
                      <h3 className={styles.categorySubTitle}>
                        Motorcycle Tours {activeCategory !== 'All' ? `- ${activeCategory}` : ''}
                      </h3>
                      <div className={styles.tripsGrid}>
                        {tourPackages.map(trip => (
                          <TrendingCard key={trip._id} trip={trip} />
                        ))}
                      </div>
                    </div>
                  )}

                  {groupTrips.length > 0 && (
                    <div style={{marginBottom: '3rem'}}>
                      <h3 className={styles.categorySubTitle}>
                        Group Tours {activeCategory !== 'All' ? `- ${activeCategory}` : ''}
                      </h3>
                      <div className={styles.tripsGrid}>
                        {groupTrips.map(trip => (
                          <TrendingCard key={trip._id} trip={trip} />
                        ))}
                      </div>
                    </div>
                  )}

                  {otherTrips.length > 0 && (
                    <div style={{marginBottom: '3rem'}}>
                      <h3 className={styles.categorySubTitle}>
                        Other Experiences {activeCategory !== 'All' ? `- ${activeCategory}` : ''}
                      </h3>
                      <div className={styles.tripsGrid}>
                        {otherTrips.map(trip => (
                          <TrendingCard key={trip._id} trip={trip} />
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTrips.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                      <h3 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>No tours found for "{activeCategory}"</h3>
                      <p style={{ margin: '0 0 1.5rem 0' }}>Try choosing another destination or view all tour packages.</p>
                      <button 
                        onClick={() => handleCategoryClick('All')}
                        style={{ padding: '10px 22px', background: '#e60000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}
                      >
                        View All Tour Packages
                      </button>
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
