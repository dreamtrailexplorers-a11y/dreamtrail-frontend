import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';
import { FiCompass, FiMap } from 'react-icons/fi';

const CreatorNotFound = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <Navbar />
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', backgroundColor: 'white', padding: '4rem', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#fef2f2', color: '#ef4444', marginBottom: '2rem' }}>
            <FiCompass size={50} strokeWidth={1.5} />
          </div>
          
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif' }}>
            Oops! Explorer Not Found
          </h1>
          
          <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            It looks like this creator trip has vanished into the wilderness, or perhaps the link you followed took a detour. But don't worry, the adventure doesn't stop here!
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" style={{ padding: '12px 24px', backgroundColor: '#ef4444', color: 'white', borderRadius: '12px', fontWeight: '600', textDecoration: 'none', transition: 'all 0.3s ease', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)' }}>
              Return Home
            </Link>
            <Link to="/tour-packages" style={{ padding: '12px 24px', backgroundColor: '#f1f5f9', color: '#334155', borderRadius: '12px', fontWeight: '600', textDecoration: 'none', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiMap /> Explore All Trips
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CreatorNotFound;
