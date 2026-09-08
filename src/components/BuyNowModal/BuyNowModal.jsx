import React, { useState, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import styles from './BuyNowModal.module.css';
import { createPaymentOrder, verifyPayment, getSiteSettings } from '../../services/api';

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

const BuyNowModal = ({ isOpen, onClose, tripTitle, pricePerPerson, duration, destination, selectedDepartureDate, mode = 'both', selectedPackages, allPackages, initialPreBookingSettings }) => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Replace single persons with quantities mapped by package index
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(null);
  const [preBookingSettings, setPreBookingSettings] = useState(initialPreBookingSettings || null);
  const [activePackages, setActivePackages] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (!initialPreBookingSettings && !preBookingSettings) {
        getSiteSettings().then(res => setPreBookingSettings(res.data?.preBookingSettings)).catch(console.error);
      } else if (initialPreBookingSettings) {
        setPreBookingSettings(initialPreBookingSettings);
      }
      
      const pendingBuyStr = sessionStorage.getItem('pendingBuy');
      if (pendingBuyStr) {
        try {
          const pendingBuy = JSON.parse(pendingBuyStr);
          if (pendingBuy && pendingBuy.path === location.pathname) {
            setActivePackages(pendingBuy.activePackages || []);
            setQuantities(pendingBuy.quantities || {});
            sessionStorage.removeItem('pendingBuy');
            return;
          }
        } catch (e) {}
      }

      // Initialize active packages based on selectedPackages
      let initialPkgs = [];
      if (selectedPackages && selectedPackages.length > 0) {
        initialPkgs = [...selectedPackages];
      } else {
        initialPkgs = [{ title: tripTitle, price: pricePerPerson }];
      }
      setActivePackages(initialPkgs);

      const initialQs = {};
      initialPkgs.forEach((_, i) => { initialQs[i] = 1; });
      setQuantities(initialQs);
    }
  }, [isOpen, selectedPackages, tripTitle, pricePerPerson, location.pathname]);

  if (!isOpen) return null;

  const isMultiPackage = activePackages.length > 0;

  let totalAmount = 0;
  let totalPersons = 0;
  let combinedTripTitle = tripTitle;

  if (isMultiPackage) {
    activePackages.forEach((pkg, idx) => {
      const q = quantities[idx] || 1;
      totalAmount += (Number(pkg.price) || 0) * q;
      totalPersons += q;
    });
    
    if (activePackages.length > 1) {
       const packageDetails = activePackages.map((pkg, idx) => `${pkg.title} x${quantities[idx] || 1}`).join(', ');
       combinedTripTitle = `${tripTitle.split(' - ')[0]} - Multiple Packages (${packageDetails})`;
    } else if (activePackages.length === 1) {
       combinedTripTitle = `${tripTitle.split(' - ')[0]} - ${activePackages[0].title}`;
    }
  } else {
    totalAmount = (Number(pricePerPerson) || 0) * (quantities.default || 1);
    totalPersons = quantities.default || 1;
  }

  const handleIncrement = (idx) => {
    setQuantities(prev => ({ ...prev, [idx]: (prev[idx] || 1) + 1 }));
  };
  const handleDecrement = (idx) => {
    setQuantities(prev => {
      const current = prev[idx] || 1;
      return { ...prev, [idx]: current > 1 ? current - 1 : 1 };
    });
  };

  const handlePay = async (paymentType = 'full') => {
    if (!user) {
      sessionStorage.setItem('pendingBuy', JSON.stringify({
        path: location.pathname,
        activePackages,
        quantities
      }));
      navigate('/login', { state: { from: location } });
      return;
    }

    setLoading(paymentType);
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert('Failed to load Razorpay SDK. Please check your internet connection.');
        setLoading(null);
        return;
      }

      const preBookAmountPerPerson = preBookingSettings?.amount || 5000;
      const amountToPay = paymentType === 'pre-book' ? (preBookAmountPerPerson * totalPersons) : totalAmount;

      const res = await createPaymentOrder(
        { 
          amount: amountToPay,
          totalTripCost: totalAmount,
          paymentType,
          tripTitle: combinedTripTitle, // Backend sees exactly what was purchased
          pricePerPerson: isMultiPackage ? null : (Number(pricePerPerson) || 0), // Not applicable for multi
          numberOfPersons: totalPersons, 
          duration, 
          destination,
          departureDate: selectedDepartureDate ? `${selectedDepartureDate.start} to ${selectedDepartureDate.end}` : ''
        }
      );
      const { order, keyId, bookingId } = res.data;

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'DreamTrail',
        description: `Payment for ${totalPersons} Person(s)`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await verifyPayment(
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );
            
            if (verifyRes.data.success) {
              alert('Payment Successful!');
              onClose();
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            alert('Payment verification error.');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
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

    } catch (err) {
      console.error('Payment Error:', err);
      alert(err.response?.data?.message || 'Error initializing payment.');
    } finally {
      setLoading(null);
    }
  };

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        
        <div className={styles.modalHeader}>
          <h2>{tripTitle}</h2>
          <p>{duration} | {destination}</p>
          {selectedDepartureDate && (
            <p style={{ marginTop: '5px', fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>
              Departure: {selectedDepartureDate.start} to {selectedDepartureDate.end}
            </p>
          )}
        </div>

        <div className={styles.modalBody}>
          
          {isMultiPackage ? (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }}>
                {activePackages.map((pkg, idx) => (
                  <div key={idx} style={{ paddingBottom: '15px', borderBottom: idx < activePackages.length - 1 ? '1px dashed #cbd5e1' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{pkg.title}</div>
                      {activePackages.length > 1 && (
                        <button 
                          onClick={() => {
                            const newPkgs = [...activePackages];
                            newPkgs.splice(idx, 1);
                            setActivePackages(newPkgs);
                            
                            const newQs = { ...quantities };
                            delete newQs[idx];
                            // Re-index quantities
                            const reindexedQs = {};
                            newPkgs.forEach((_, i) => {
                              reindexedQs[i] = i >= idx ? newQs[i + 1] : newQs[i];
                            });
                            setQuantities(reindexedQs);
                          }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '1.2rem', cursor: 'pointer', padding: '0 5px', lineHeight: 1 }}
                          title="Remove package"
                        >&times;</button>
                      )}
                    </div>
                    
                    <div className={styles.priceRow} style={{ marginBottom: '10px' }}>
                      <span className={styles.priceLabel}>Price per person</span>
                      <span className={styles.priceValue}>₹ {(Number(pkg.price) || 0).toLocaleString('en-IN')}</span>
                    </div>

                    <div className={styles.personSelector}>
                      <span className={styles.selectorLabel}>Number of Persons</span>
                      <div className={styles.counter}>
                        <button className={styles.counterBtn} onClick={() => handleDecrement(idx)}>-</button>
                        <span className={styles.counterValue}>{quantities[idx] || 1}</span>
                        <button className={styles.counterBtn} onClick={() => handleIncrement(idx)}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add Package Dropdown */}
                {allPackages && allPackages.length > 0 && (
                  <div style={{ marginTop: '5px', paddingTop: '15px', borderTop: '2px dashed #e2e8f0', paddingBottom: '5px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: '600', marginBottom: '8px' }}>
                      + Add Another Package Option
                    </label>
                    <select 
                      value=""
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const pkgIdx = parseInt(e.target.value);
                        const selectedPkg = allPackages[pkgIdx];
                        if (selectedPkg) {
                          setActivePackages(prev => [...prev, { title: selectedPkg.title, price: selectedPkg.price }]);
                          setQuantities(prev => ({ ...prev, [activePackages.length]: 1 }));
                        }
                      }}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.9rem', outline: 'none' }}
                    >
                      <option value="">Select a package to add...</option>
                      {allPackages.map((pkg, i) => {
                        const isAlreadyAdded = activePackages.some(ap => ap.title === pkg.title);
                        if (isAlreadyAdded) return null;
                        return (
                          <option key={i} value={i}>{pkg.title} - ₹{Number(pkg.price).toLocaleString('en-IN')}</option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>Price per person</span>
                <span className={styles.priceValue}>₹ {(Number(pricePerPerson) || 0).toLocaleString('en-IN')}</span>
              </div>

              <div className={styles.personSelector}>
                <span className={styles.selectorLabel}>Number of Persons</span>
                <div className={styles.counter}>
                  <button className={styles.counterBtn} onClick={() => handleDecrement('default')}>-</button>
                  <span className={styles.counterValue}>{quantities.default || 1}</span>
                  <button className={styles.counterBtn} onClick={() => handleIncrement('default')}>+</button>
                </div>
              </div>
            </>
          )}

          <div className={styles.totalRow} style={{ borderTop: isMultiPackage ? '2px solid #e2e8f0' : 'none', paddingTop: isMultiPackage ? '15px' : '0' }}>
            <span className={styles.totalLabel}>Total Trip Cost</span>
            <span className={styles.totalValue}>₹ {totalAmount.toLocaleString('en-IN')}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {mode !== 'pre-book' && (
              <button 
                className={styles.payBtn} 
                onClick={() => handlePay('full')} 
                disabled={loading !== null || totalAmount <= 0}
                style={{ backgroundColor: '#10b981' }}
              >
                {loading === 'full' ? 'Processing...' : `Pay Full ₹${totalAmount.toLocaleString('en-IN')}`}
              </button>
            )}
            
            {mode === 'both' && (
              <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>OR</div>
            )}

            {mode !== 'full' && (
              <>
                <button 
                  className={styles.payBtn} 
                  onClick={() => handlePay('pre-book')} 
                  disabled={loading !== null || totalAmount <= 0}
                >
                  {loading === 'pre-book' ? 'Processing...' : `Pre-Book Now @ ₹${((preBookingSettings?.amount || 5000) * totalPersons).toLocaleString('en-IN')}`}
                </button>
                <small style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.8rem' }}>
                  {preBookingSettings?.refundPolicyText || 'Pre-booking amount is strictly non-refundable.'}
                </small>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BuyNowModal;
