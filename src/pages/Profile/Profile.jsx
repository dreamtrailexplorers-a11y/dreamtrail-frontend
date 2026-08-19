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
              {bookings.map(booking => (
                <div key={booking._id} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>{booking.tripTitle}</h3>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: '#475569' }}>
                        <strong>Trip Date:</strong> {booking.departureDate || 'N/A'}
                      </p>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: '#475569' }}>
                        <strong>Booking Date:</strong> {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: '#475569' }}>
                        <strong>Persons:</strong> {booking.numberOfPersons}
                      </p>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: '#475569' }}>
                        <strong>Total Trip Cost:</strong> ₹{booking.totalAmount?.toLocaleString('en-IN')}
                      </p>
                      {booking.paymentDetails?.preBookPaid > 0 && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px' }}>
                          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#166534' }}>
                            <strong>Pre-Book Paid:</strong> ₹{booking.paymentDetails.preBookPaid.toLocaleString('en-IN')} (₹{Math.round(booking.paymentDetails.preBookPaid / booking.numberOfPersons).toLocaleString('en-IN')} / person)
                          </p>
                          {booking.paymentStatus === 'Fully Paid' && (
                             <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#166534' }}>
                               <strong>Balance Paid:</strong> ₹{(booking.paymentDetails.balancePaid || (booking.totalAmount - booking.paymentDetails.preBookPaid)).toLocaleString('en-IN')}
                             </p>
                          )}
                          {booking.paymentStatus === 'Fully Paid' && booking.paymentDetails?.balancePaidAt && (
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#166534' }}>
                              <strong>Balance Paid On:</strong> {new Date(booking.paymentDetails.balancePaidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '99px', 
                        fontSize: '0.8rem', 
                        fontWeight: '600',
                        backgroundColor: booking.paymentStatus === 'Fully Paid' ? '#dcfce7' : booking.paymentStatus === 'Pre-Booked' ? '#fef08a' : '#f1f5f9',
                        color: booking.paymentStatus === 'Fully Paid' ? '#166534' : booking.paymentStatus === 'Pre-Booked' ? '#854d0e' : '#475569',
                        marginBottom: '1rem'
                      }}>
                        {booking.paymentStatus}
                      </span>
                      
                      {booking.paymentStatus === 'Pre-Booked' && booking.paymentDetails?.balanceDue > 0 && (
                        <div>
                          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#ef4444', fontWeight: '600' }}>
                            Balance Due: ₹{booking.paymentDetails.balanceDue.toLocaleString('en-IN')}
                          </p>
                          <button 
                            onClick={() => setSelectedBooking(booking)}
                            style={{ 
                              backgroundColor: '#10b981', 
                              color: '#fff', 
                              border: 'none', 
                              padding: '0.5rem 1rem', 
                              borderRadius: '6px', 
                              fontSize: '0.9rem', 
                              fontWeight: '600', 
                              cursor: 'pointer' 
                            }}
                          >
                            Pay Balance Now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
