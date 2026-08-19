import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, NavLink, useLocation } from 'react-router-dom';
import AdminHome from './AdminHome';
import ManageDestinations from './ManageDestinations';
import DestinationDetail from './DestinationDetail';
import FillDestinationDetail from './FillDestinationDetail';
import ManagePackages from './ManagePackages';
import ManageAllPackages from './ManageAllPackages';
import ManageCreatorTrips from './ManageCreatorTrips';
import ManageBlogs from './ManageBlogs';
import ManageBookings from './ManageBookings/ManageBookings';
import ManageEnquiries from './ManageEnquiries';
import ManageSubscribers from './ManageSubscribers/ManageSubscribers';
import ManageReviews from './ManageReviews';
import ManageNavLinks from './ManageNavLinks';
import ManageFooterLinks from './ManageFooterLinks';
import ManageSiteSettings from './ManageSiteSettings';
import ManageCustomPages from './ManageCustomPages/ManageCustomPages';
import styles from './Admin.module.css';
import ManageAttractions from './ManageAttractions/ManageAttractions';
import AddAttraction from './ManageAttractions/AddAttraction/AddAttraction';
import EditAttraction from './ManageAttractions/EditAttraction';

import { FiCompass, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('isAdminAuth') === 'true'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'dreamtrailexplorers@admin.com' && password === 'DTEadmin@123') {
      sessionStorage.setItem('isAdminAuth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid email or password');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminAuth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f5f9' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <FiCompass size={40} color="#3b82f6" />
            <h2 style={{ margin: '10px 0 5px 0', color: '#1e293b' }}>DreamTrail Admin</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Please sign in to continue</p>
          </div>
          {error && <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '15px', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px', fontSize: '0.9rem' }}>{error}</p>}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }}>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="admin@example.com"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }}>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>
            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'background 0.2s' }}>
              Login to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link to="/admin" className={styles.brandLogo} title="Go to Admin Dashboard" onClick={closeMobileMenu}>
            <img src="/logo.png" alt="DreamTrail Logo" className={styles.logoImg} />
          </Link>
          <button className={styles.hamburgerBtn} onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <FiX size={26} /> : <FiMenu size={26} />}
          </button>
        </div>
        
        <nav className={`${styles.navLinks} ${isMobileMenuOpen ? styles.navLinksOpen : ''}`}>
          <NavLink onClick={closeMobileMenu} to="/admin" end className={({isActive}) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>Dashboard</NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/destinations" className={({isActive}) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>Destinations</NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/all-packages" className={({isActive}) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>All Packages</NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/blogs" className={({isActive}) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>Blogs</NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/attractions" className={({isActive}) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>Attractions</NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/bookings" className={({isActive}) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>Bookings</NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/enquiries" className={({isActive}) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>Enquiries</NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/subscribers" className={({isActive}) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>Subscribers</NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/reviews" className={({isActive}) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>Reviews</NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/navlinks" className={({isActive}) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>Nav Links</NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/footerlinks" className={({isActive}) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>Footer Links</NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/custompages" className={({isActive}) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>Custom Pages</NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/settings" className={({isActive}) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>Site Settings</NavLink>
        </nav>
        <div className={`${styles.logoutWrapper} ${isMobileMenuOpen ? styles.logoutWrapperOpen : ''}`}>
          <button onClick={handleLogout} className={styles.navLink} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '12px 16px', fontWeight: 'bold' }}>
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </aside>
      <main id="admin-main-content" className={styles.mainContent}>
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/destinations" element={<ManageDestinations />} />
          <Route path="/add-destination" element={<Navigate to="/admin/destinations" replace />} />
          <Route path="/packages" element={<ManagePackages />} />
          <Route path="/all-packages" element={<ManageAllPackages />} />
          <Route path="/creator-trips" element={<ManageCreatorTrips />} />
          <Route path="/blogs" element={<ManageBlogs />} />
          <Route path="/attractions" element={<ManageAttractions />} />
          <Route path="/add-attraction" element={<AddAttraction />} />
          <Route path="/edit-attraction/:id" element={<EditAttraction />} />
          <Route path="/bookings" element={<ManageBookings />} />
          <Route path="/enquiries" element={<ManageEnquiries />} />
          <Route path="/subscribers" element={<ManageSubscribers />} />
          <Route path="/reviews" element={<ManageReviews />} />
          <Route path="/navlinks" element={<ManageNavLinks />} />
          <Route path="/footerlinks" element={<ManageFooterLinks />} />
          <Route path="/custompages" element={<ManageCustomPages />} />
          <Route path="/settings" element={<ManageSiteSettings />} />
          <Route path="/destination/:id" element={<DestinationDetail />} />
          <Route path="/fill-destination/:id" element={<FillDestinationDetail />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
