import React, { useRef, useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { MdOutlineTerrain, MdOutlineLocationCity, MdOutlineTempleHindu, MdOutlineForest } from 'react-icons/md';
import { GiMountainRoad, GiPalmTree, GiIsland, GiAsianLantern } from 'react-icons/gi';
import { iconMap } from '../../utils/iconMap';
import styles from './CategoryMenu.module.css';

const categories = [
  { id: 'vietnam', label: 'Vietnam', icon: <GiAsianLantern /> },
  { id: 'bali', label: 'Bali', icon: <MdOutlineTempleHindu /> },
  { id: 'spiti', label: 'Spiti Valley', icon: <MdOutlineTerrain /> },
  { id: 'thailand', label: 'Thailand', icon: <MdOutlineLocationCity /> },
  { id: 'northeast', label: 'North East', icon: <MdOutlineForest /> },
  { id: 'kashmir', label: 'Kashmir', icon: <MdOutlineTerrain /> },
  { id: 'manali', label: 'Manali', icon: <GiMountainRoad /> },
  { id: 'goa', label: 'Goa', icon: <GiPalmTree /> },
  { id: 'maldives', label: 'Maldives', icon: <GiIsland /> },
  { id: 'malaysia', label: 'Malaysia', icon: <MdOutlineLocationCity /> },
  { id: 'georgia', label: 'Georgia', icon: <MdOutlineTerrain /> },
  { id: 'jaisalmer', label: 'Jaisalmer', icon: <MdOutlineTempleHindu /> },
];

const CategoryMenu = () => {
  const scrollRef = useRef(null);
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const { getDestinations } = await import('../../services/api');
        const { data } = await getDestinations();
        setDestinations(data);
      } catch (error) {
        console.error('Failed to fetch destinations for menu:', error);
      }
    };
    fetchDestinations();
  }, []);

  const scrollNav = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const getIcon = (cat) => {
    if (cat.icon && iconMap[cat.icon]) {
      return iconMap[cat.icon];
    }
    // Fallbacks if no icon was selected (shouldn't happen for new ones)
    const lowerName = cat.name.toLowerCase();
    const staticMatch = categories.find(c => lowerName.includes(c.id));
    if (staticMatch) return staticMatch.icon;

    if (lowerName.includes('beach') || lowerName.includes('maldives') || lowerName.includes('goa') || lowerName.includes('island')) return <GiIsland />;
    if (lowerName.includes('mountain') || lowerName.includes('kashmir') || lowerName.includes('spiti') || lowerName.includes('hill')) return <MdOutlineTerrain />;
    if (lowerName.includes('temple') || lowerName.includes('rajasthan')) return <MdOutlineTempleHindu />;
    
    return <MdOutlineLocationCity />;
  };

  return (
    <div className={styles.navContainer}>
      <div className={styles.navWrapper}>
        <button className={styles.scrollBtn} onClick={() => scrollNav('left')} aria-label="Scroll left">
          <FiChevronLeft />
        </button>
        
        <div className={styles.navScroll} ref={scrollRef}>
          {destinations.map((cat) => {
            const destSlug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
            return (
              <NavLink 
                key={cat._id} 
                to={`/destinations/${destSlug}`} 
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <div className={styles.navIcon}>{getIcon(cat)}</div>
                <div className={styles.navLabel}>{cat.name}</div>
              </NavLink>
            );
          })}
        </div>

        <button className={styles.scrollBtn} onClick={() => scrollNav('right')} aria-label="Scroll right">
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default CategoryMenu;
