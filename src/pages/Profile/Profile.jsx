import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '4rem 2rem', textAlign: 'center', minHeight: '60vh' }}>
          <h2>Please log in to view your profile</h2>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '2rem' }}>My Profile</h1>
        
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>Personal Details</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Full Name</p>
              <p style={{ fontSize: '1.05rem', fontWeight: '600', color: '#334155' }}>{user.name}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Email Address</p>
              <p style={{ fontSize: '1.05rem', fontWeight: '600', color: '#334155' }}>{user.email}</p>
            </div>
            {user.phone && (
              <div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Phone Number</p>
                <p style={{ fontSize: '1.05rem', fontWeight: '600', color: '#334155' }}>{user.phone}</p>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handleLogout}
          style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
