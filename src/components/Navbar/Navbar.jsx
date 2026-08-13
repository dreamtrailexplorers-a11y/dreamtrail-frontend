import React, { useState, useEffect, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiUser, FiMenu, FiX, FiCompass } from 'react-icons/fi';

import { AuthContext } from '../../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = ({ sticky = true }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navLinks, setNavLinks] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNavLinks = async () => {
      try {
        const { getNavLinks } = await import('../../services/api');
        const { data } = await getNavLinks();
        const fetchedLinks = data || [];

        setNavLinks(fetchedLinks);
      } catch (error) {
        console.error('Failed to fetch nav links:', error);
      }
    };
    fetchNavLinks();

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`${styles.navbarContainer} ${isScrolled && sticky ? styles.scrolled : ''}`}
      style={{ position: sticky ? 'sticky' : 'relative' }}
    >
      <div className={styles.navbarInner}>
        {/* Brand Logo */}
        <Link 
          to="/" 
          className={styles.brandLogo}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img src="/logo.png" alt="DreamTrail Logo" style={{ height: '60px', width: 'auto' }} />
        </Link>

        {/* Desktop Nav Links */}
        <nav className={styles.navLinks}>
          {navLinks.map((link, idx) => (
            <NavLink 
              key={link._id || link.id || idx} 
              to={link.path} 
              className={({ isActive }) => 
                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
              }
            >
              {link.title}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions */}
        <div className={styles.rightActions}>
          <button 
            className={styles.userBtn}
            title={user ? "My Profile" : "Login"}
            aria-label="Account"
            onClick={() => navigate(user ? '/profile' : '/login')}
          >
            <FiUser size={18} />
          </button>

          <button 
            className={styles.mobileToggle} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Links Menu */}
      {isMobileMenuOpen && (
        <nav className={styles.navLinksMobile}>
          {navLinks.map((link, idx) => (
            <Link 
              key={link._id || link.id || idx} 
              to={link.path} 
              className={styles.navItem} 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.title}
            </Link>
          ))}
        </nav>
      )}

    </header>
  );
};

export default Navbar;
