import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import api from '../../services/api';
import { createPortal } from 'react-dom';

const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payLoadingId, setPayLoadingId] = useState(null);
  
  // State for the Balance Payment Popup
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my-bookings');
      setBookings(res.data);
    } catch (error) {
      console.error('Error fetching bookings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePayBalance = async (booking) => {
    setPayLoadingId(booking._id);
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert('Failed to load Razorpay SDK.');
        setPayLoadingId(null);
        return;
      }

      const res = await api.post('/payment/create-balance-order', { bookingId: booking._id });
      const { order, keyId } = res.data;

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'DreamTrail',
        description: `Balance Payment for ${booking.tripTitle}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/payment/verify-balance', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id
            });
            
            if (verifyRes.data.success) {
              alert('Balance Payment Successful!');
              setSelectedBooking(null); // Close popup
              fetchBookings();
            } else {
              alert('Payment verification failed.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            alert('Payment verification error.');
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone || ''
        },
        theme: {
          color: '#e60000'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error initializing payment');
    } finally {
      setPayLoadingId(null);
    }
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

  const getTripStatus = (dateString) => {
    if (!dateString || dateString === 'N/A') return { status: 'Unspecified', color: '#64748b', bg: '#f1f5f9' };
    
    try {
      const dates = dateString.split(' to ');
      const endDate = dates.length > 1 ? new Date(dates[1]) : new Date(dates[0]);
      const today = new Date();
      today.setHours(0,0,0,0);
      
      if (endDate < today) {
        return { status: 'Completed', color: '#475569', bg: '#f1f5f9' };
      } else if (new Date(dates[0]) <= today && endDate >= today) {
        return { status: 'Ongoing', color: '#0369a1', bg: '#e0f2fe' };
      } else {
        return { status: 'Upcoming', color: '#047857', bg: '#d1fae5' };
      }
    } catch (e) {
      return { status: 'Upcoming', color: '#047857', bg: '#d1fae5' };
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem', minHeight: '60vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>My Profile</h1>
          <button 
            onClick={handleLogout}
            style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
        
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

        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>My Bookings</h2>
          
          {loading ? (
            <p>Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p style={{ color: '#64748b' }}>You have no bookings yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bookings.map(booking => {
                const titleParts = booking.tripTitle.split(' - ');
                const mainTitle = titleParts[0];
                const variantDetails = titleParts.slice(1).join(' - ');
                const tripStatus = getTripStatus(booking.departureDate);
                
                return (
                  <div key={booking._id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                    
                    <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '200px' }}>
                      <span style={{ backgroundColor: tripStatus.bg, color: tripStatus.color, padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {tripStatus.status}
                      </span>
                      <span style={{ backgroundColor: booking.paymentStatus === 'Fully Paid' ? '#dcfce7' : '#fee2e2', color: booking.paymentStatus === 'Fully Paid' ? '#166534' : '#991b1b', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                        {booking.paymentStatus === 'Fully Paid' ? 'Fully Paid' : 'Balance Due'}
                      </span>
                    </div>

                    <div style={{ paddingRight: '220px' }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700' }}>{mainTitle}</h3>
                      
                      {variantDetails && (
                        <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
                          {variantDetails}
                        </p>
                      )}
                      {!variantDetails && <div style={{ marginBottom: '1rem' }}></div>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Trip Date</p>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', fontWeight: '500' }}>{booking.departureDate || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Booking Date</p>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', fontWeight: '500' }}>{new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>

                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Travelers</p>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', fontWeight: '500' }}>{booking.numberOfPersons} Person(s)</p>
                      </div>

                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Total Cost</p>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', fontWeight: '700' }}>₹{booking.totalAmount?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    {booking.paymentDetails?.preBookPaid > 0 && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                        <div>
                          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#166534', textTransform: 'uppercase', fontWeight: '700' }}>Pre-Book Paid</p>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: '#15803d', fontWeight: '600' }}>
                            ₹{booking.paymentDetails.preBookPaid.toLocaleString('en-IN')} 
                            <span style={{ fontWeight: 'normal', fontSize: '0.8rem', marginLeft: '4px' }}>(₹{Math.round(booking.paymentDetails.preBookPaid / booking.numberOfPersons).toLocaleString('en-IN')} / person)</span>
                          </p>
                        </div>
                        
                        {booking.paymentStatus === 'Fully Paid' && (
                          <div>
                             <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#166534', textTransform: 'uppercase', fontWeight: '700' }}>Balance Paid</p>
                             <p style={{ margin: 0, fontSize: '0.9rem', color: '#15803d', fontWeight: '600' }}>
                               ₹{(booking.paymentDetails.balancePaid || (booking.totalAmount - booking.paymentDetails.preBookPaid)).toLocaleString('en-IN')}
                               {booking.paymentDetails?.balancePaidAt && (
                                 <span style={{ fontWeight: 'normal', fontSize: '0.8rem', marginLeft: '4px' }}>on {new Date(booking.paymentDetails.balancePaidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                               )}
                             </p>
                          </div>
                        )}
                      </div>
                    )}

                    {booking.paymentStatus !== 'Fully Paid' && (
                      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => setSelectedBooking(booking)}
                          style={{ padding: '0.6rem 1.2rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                        >
                          Pay Balance ₹{booking.paymentDetails?.balanceDue?.toLocaleString('en-IN')}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* BALANCE PAYMENT MODAL */}
      {selectedBooking && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }} onClick={() => setSelectedBooking(null)}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '450px', position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedBooking(null)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
            >
              &times;
            </button>
            
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#0f172a' }}>{selectedBooking.tripTitle}</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Balance Payment Summary</p>
            
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#f8fafc' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                <span style={{ color: '#475569' }}>Total Trip Cost</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>₹{selectedBooking.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                <span style={{ color: '#475569' }}>Total Persons</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>{selectedBooking.numberOfPersons}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                <span style={{ color: '#475569' }}>Price Per Person</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>₹{selectedBooking.pricePerPerson?.toLocaleString('en-IN')}</span>
              </div>
              
              <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '0.75rem 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                <span style={{ color: '#10b981' }}>Amount Already Paid</span>
                <span style={{ fontWeight: '600', color: '#10b981' }}>₹{selectedBooking.paymentDetails?.preBookPaid?.toLocaleString('en-IN')}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', marginTop: '1rem' }}>
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Balance Due</span>
                <span style={{ fontWeight: 'bold', color: '#ef4444' }}>₹{selectedBooking.paymentDetails?.balanceDue?.toLocaleString('en-IN')}</span>
              </div>

            </div>

            <button 
              onClick={() => handlePayBalance(selectedBooking)}
              disabled={payLoadingId === selectedBooking._id}
              style={{ 
                width: '100%',
                backgroundColor: '#e60000', 
                color: '#fff', 
                border: 'none', 
                padding: '0.85rem', 
                borderRadius: '8px', 
                fontSize: '1rem', 
                fontWeight: '600', 
                cursor: payLoadingId === selectedBooking._id ? 'not-allowed' : 'pointer' 
              }}
            >
              {payLoadingId === selectedBooking._id ? 'Initializing...' : `Pay ₹${selectedBooking.paymentDetails?.balanceDue?.toLocaleString('en-IN')}`}
            </button>
          </div>
        </div>
      , document.body)}
    </>
  );
};

export default Profile;
