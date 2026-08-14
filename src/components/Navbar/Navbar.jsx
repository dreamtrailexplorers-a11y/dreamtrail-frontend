import React, { useState, useEffect, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiUser, FiMenu, FiX, FiChevronRight } from 'react-icons/fi';

import { AuthContext } from '../../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = ({ sticky = true }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navLinks, setNavLinks] = useState([]);
  const [settings, setSettings] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNavLinks = async () => {
      try {
        const { getNavLinks, getSiteSettings } = await import('../../services/api');
        const { data } = await getNavLinks();
        const fetchedLinks = data || [];
        setNavLinks(fetchedLinks);
        
        const settingsRes = await getSiteSettings();
        setSettings(settingsRes.data);
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
    <>
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
      </header>

      {/* Mobile Nav Links Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className={styles.mobileSidebarOverlay} onClick={() => setIsMobileMenuOpen(false)}>
          <div className={styles.mobileSidebar} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mobileSidebarHeader}>
              <img src="/logo.png" alt="Logo" style={{ height: '40px' }} />
              <button onClick={() => setIsMobileMenuOpen(false)} className={styles.closeBtn}>
                <FiX size={24} />
              </button>
            </div>
            
            <div className={styles.sidebarContent}>
              {(settings?.footerToursIndia?.length > 0) && (
                <div className={styles.sidebarSection}>
                  <h3 className={styles.sidebarHeading}>Motorcycle Tours</h3>
                  {settings.footerToursIndia.map((link, idx) => (
                    <Link key={idx} to={link.url} className={styles.sidebarLink} onClick={() => setIsMobileMenuOpen(false)}>{link.label}</Link>
                  ))}
                </div>
              )}

              {(settings?.footerToursAsia?.length > 0) && (
                <div className={styles.sidebarSection}>
                  <h3 className={styles.sidebarHeading}>Asia</h3>
                  <div style={{ display: 'flex', gap: '5px', color: '#fff' }}>
                    {settings.footerToursAsia.map((link, idx) => (
                      <React.Fragment key={idx}>
                        <Link to={link.url} className={styles.sidebarLink} onClick={() => setIsMobileMenuOpen(false)}>{link.label}</Link>
                        {idx < settings.footerToursAsia.length - 1 && <span> | </span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {(settings?.footerOtherLinks?.length > 0) && (
                <div className={styles.sidebarSection}>
                  <h3 className={styles.sidebarHeading}>Other Links</h3>
                  {settings.footerOtherLinks.map((link, idx) => (
                    <Link key={idx} to={link.url} className={styles.sidebarLink} onClick={() => setIsMobileMenuOpen(false)}>{link.label}</Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
