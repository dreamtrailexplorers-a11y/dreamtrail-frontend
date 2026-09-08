import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import api from '../../services/api';
import { createPortal } from 'react-dom';
import styles from './Profile.module.css';

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

const parseBookingDetails = (tripTitle, totalPersons = 1) => {
  if (!tripTitle) return { mainTitle: 'Tour Booking', packages: [] };

  // 1. Check for "Multiple Packages (...)"
  const multiMatch = tripTitle.match(/Multiple Packages \((.*?)\)\s*$/i);
  if (multiMatch) {
    const rawList = multiMatch[1];
    
    let cleanName = tripTitle
      .replace(/ - Multiple Packages \(.*?\)\s*$/i, '')
      .replace(/\s*\(Multiple Packages Selected\)\s*/i, '')
      .replace(/\s*-\s*Multiple Packages\s*$/i, '')
      .trim();

    if (cleanName.includes(' (')) {
      cleanName = cleanName.split(' (')[0].trim();
    }

    const packages = [];
    const parts = rawList.split(/,\s*(?=[^,]+?\s+x\d+)/);
    parts.forEach(part => {
      const xMatch = part.match(/^(.*?)\s+x(\d+)$/);
      if (xMatch) {
        packages.push({
          title: xMatch[1].trim(),
          qty: parseInt(xMatch[2], 10) || 1
        });
      } else {
        packages.push({
          title: part.trim(),
          qty: 1
        });
      }
    });

    return {
      mainTitle: cleanName || 'Tour Booking',
      packages
    };
  }

  // 2. Check for "Trip Name - Variant" or "Trip Name (Variant)"
  let cleanName = tripTitle;
  let pkgTitle = null;

  if (tripTitle.includes(' - ')) {
    const splitDash = tripTitle.split(' - ');
    cleanName = splitDash[0].trim();
    pkgTitle = splitDash.slice(1).join(' - ').trim();
  }

  if (cleanName.includes('(')) {
    const parenMatch = cleanName.match(/^(.*?)\s*\((.*?)\)\s*$/);
    if (parenMatch) {
      cleanName = parenMatch[1].trim();
      if (!pkgTitle) {
        pkgTitle = parenMatch[2].trim();
      }
    }
  }

  cleanName = cleanName.replace(/\s*\(Multiple Packages Selected\)\s*/i, '').trim();

  const packages = [];
  if (pkgTitle && pkgTitle.toLowerCase() !== 'multiple packages' && !pkgTitle.toLowerCase().includes('multiple packages selected')) {
    packages.push({
      title: pkgTitle,
      qty: totalPersons || 1
    });
  }

  return {
    mainTitle: cleanName || tripTitle,
    packages
  };
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

  const formatTripDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      const parts = dateString.split(' to ');
      if (parts.length === 2) {
        const d1 = new Date(parts[0].trim());
        const d2 = new Date(parts[1].trim());
        if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
          const opt = { day: 'numeric', month: 'short', year: 'numeric' };
          return `${d1.toLocaleDateString('en-IN', opt)} - ${d2.toLocaleDateString('en-IN', opt)}`;
        }
      }
      const d = new Date(dateString);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    } catch (e) {}
    return dateString;
  };

  return (
    <>
      <Navbar />
      <div className={styles.profileContainer}>
        {/* Header */}
        <div className={styles.profileHeader}>
          <h1 className={styles.profileTitle}>My Profile</h1>
          <button 
            onClick={handleLogout}
            className={styles.logoutBtn}
          >
            Logout
          </button>
        </div>
        
        {/* Personal Details */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionHeading}>Personal Details</h2>
          
          <div className={styles.personalDetailsGrid}>
            <div className={styles.detailItem}>
              <p className={styles.detailLabel}>Full Name</p>
              <p className={styles.detailValue}>{user.name}</p>
            </div>
            <div className={styles.detailItem}>
              <p className={styles.detailLabel}>Email Address</p>
              <p className={styles.detailValue}>{user.email}</p>
            </div>
            {user.phone && (
              <div className={styles.detailItem}>
                <p className={styles.detailLabel}>Phone Number</p>
                <p className={styles.detailValue}>{user.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* My Bookings */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionHeading}>My Bookings</h2>
          
          {loading ? (
            <p style={{ color: '#64748b' }}>Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p style={{ color: '#64748b' }}>You have no bookings yet.</p>
          ) : (
            <div className={styles.bookingsList}>
              {bookings.map(booking => {
                const parsed = parseBookingDetails(booking.tripTitle, booking.numberOfPersons);
                const tripStatus = getTripStatus(booking.departureDate);
                
                return (
                  <div key={booking._id} className={styles.bookingCard}>
                    
                    {/* Status Badges */}
                    <div className={styles.badgesWrapper}>
                      <span 
                        className={styles.badge}
                        style={{ backgroundColor: tripStatus.bg, color: tripStatus.color }}
                      >
                        {tripStatus.status}
                      </span>
                      <span 
                        className={styles.badge}
                        style={{ 
                          backgroundColor: booking.paymentStatus === 'Fully Paid' ? '#dcfce7' : '#fee2e2', 
                          color: booking.paymentStatus === 'Fully Paid' ? '#166534' : '#991b1b' 
                        }}
                      >
                        {booking.paymentStatus === 'Fully Paid' ? 'Fully Paid' : 'Balance Due'}
                      </span>
                    </div>

                    {/* Trip Main Header */}
                    <div className={styles.tripHeader}>
                      <h3 className={styles.tripMainTitle}>
                        {parsed.mainTitle}
                      </h3>
                      
                      {parsed.packages.length > 0 && (
                        <div className={styles.packageSection}>
                          <div className={styles.packageLabel}>
                            Package Option{parsed.packages.length > 1 ? `s (${parsed.packages.length})` : ''}
                          </div>
                          <div className={styles.packageList}>
                            {parsed.packages.map((pkg, pIdx) => (
                              <div key={pIdx} className={styles.packageItem}>
                                <span className={styles.packageTitle}>
                                  {pkg.title}
                                </span>
                                <span className={styles.packageQty}>
                                  {pkg.qty} {pkg.qty > 1 ? 'Persons' : 'Person'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Details Info Grid */}
                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem}>
                        <p className={styles.infoLabel}>Trip Date</p>
                        <p className={styles.infoValue}>{formatTripDate(booking.departureDate)}</p>
                      </div>
                      
                      <div className={styles.infoItem}>
                        <p className={styles.infoLabel}>Booking Date</p>
                        <p className={styles.infoValue}>{new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>

                      <div className={styles.infoItem}>
                        <p className={styles.infoLabel}>Travelers</p>
                        <p className={styles.infoValue}>{booking.numberOfPersons} Person(s)</p>
                      </div>

                      <div className={styles.infoItem}>
                        <p className={styles.infoLabel}>Total Cost</p>
                        <p className={`${styles.infoValue} ${styles.costHighlight}`}>₹{booking.totalAmount?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    {/* Pre-book Paid breakdown */}
                    {booking.paymentDetails?.preBookPaid > 0 && (
                      <div className={styles.paidSummaryBox}>
                        <div className={styles.paidItem}>
                          <p className={styles.paidLabel}>Pre-Book Paid</p>
                          <p className={styles.paidValue}>
                            ₹{booking.paymentDetails.preBookPaid.toLocaleString('en-IN')} 
                            <span className={styles.paidSub}>
                              (₹{Math.round(booking.paymentDetails.preBookPaid / booking.numberOfPersons).toLocaleString('en-IN')} / person)
                            </span>
                          </p>
                        </div>
                        
                        {booking.paymentStatus === 'Fully Paid' && (
                          <div className={styles.paidItem}>
                            <p className={styles.paidLabel}>Balance Paid</p>
                            <p className={styles.paidValue}>
                              ₹{(booking.paymentDetails.balancePaid || (booking.totalAmount - booking.paymentDetails.preBookPaid)).toLocaleString('en-IN')}
                              {booking.paymentDetails?.balancePaidAt && (
                                <span className={styles.paidSub}>
                                  on {new Date(booking.paymentDetails.balancePaidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pay Balance Action */}
                    {booking.paymentStatus !== 'Fully Paid' && (
                      <div className={styles.cardActionArea}>
                        <button 
                          onClick={() => setSelectedBooking(booking)}
                          className={styles.payBalanceBtn}
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
      {selectedBooking && (() => {
        const modalParsed = parseBookingDetails(selectedBooking.tripTitle, selectedBooking.numberOfPersons);
        return createPortal(
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
          }} onClick={() => setSelectedBooking(null)}>
            <div style={{
              backgroundColor: '#fff', borderRadius: '14px', padding: '1.5rem', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxSizing: 'border-box'
            }} onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setSelectedBooking(null)}
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
              
              <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#0f172a', fontWeight: '800' }}>{modalParsed.mainTitle}</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Balance Payment Summary</p>

              {modalParsed.packages.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    Package Option{modalParsed.packages.length > 1 ? `s (${modalParsed.packages.length})` : ''}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {modalParsed.packages.map((pkg, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: '600', color: '#334155', flex: 1, paddingRight: '8px' }}>{pkg.title}</span>
                        <span style={{ backgroundColor: '#e2e8f0', color: '#334155', padding: '2px 8px', borderRadius: '10px', fontWeight: '700', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {pkg.qty} {pkg.qty > 1 ? 'Persons' : 'Person'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            
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
      , document.body);
      })()}
    </>
  );
};

export default Profile;
