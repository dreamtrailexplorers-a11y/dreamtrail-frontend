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

  const getDaysLeft = () => {
    if (!selectedDepartureDate || selectedDepartureDate === 'N/A') return null;
    try {
      let startStr = null;
      if (typeof selectedDepartureDate === 'object' && selectedDepartureDate !== null) {
        startStr = selectedDepartureDate.start;
      } else if (typeof selectedDepartureDate === 'string') {
        const parts = selectedDepartureDate.split(' to ');
        startStr = parts[0]?.trim();
      }
      if (!startStr) return null;

      const start = new Date(startStr);
      if (isNaN(start.getTime())) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      return Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    } catch(e) { return null; }
  };
  const daysLeft = getDaysLeft();
  const isPreBookingAllowed = daysLeft !== null && daysLeft > 45;
  const actualMode = isPreBookingAllowed ? mode : 'full';

  
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
      } else if (allPackages && allPackages.length > 0) {
        initialPkgs = [allPackages[0]];
      } else {
        initialPkgs = [{ title: tripTitle, price: pricePerPerson }];
      }
      setActivePackages(initialPkgs);

      const initialQs = {};
      initialPkgs.forEach((_, i) => { initialQs[i] = 1; });
      setQuantities(initialQs);
    }
  }, [isOpen, selectedPackages, allPackages, tripTitle, pricePerPerson, location.pathname]);

  if (!isOpen) return null;

  const cleanTripTitle = tripTitle ? tripTitle.split(' (')[0].split(' - ')[0] : '';
  const isMultiPackage = activePackages.length > 0;

  let totalAmount = 0;
  let totalPersons = 0;
  let combinedTripTitle = cleanTripTitle || tripTitle;

  if (isMultiPackage) {
    activePackages.forEach((pkg, idx) => {
      const q = quantities[idx] || 1;
      totalAmount += (Number(pkg.price) || 0) * q;
      totalPersons += q;
    });
    
    if (activePackages.length > 1) {
       const packageDetails = activePackages.map((pkg, idx) => `${pkg.title} x${quantities[idx] || 1}`).join(', ');
       combinedTripTitle = `${cleanTripTitle || tripTitle} - Multiple Packages (${packageDetails})`;
    } else if (activePackages.length === 1) {
       combinedTripTitle = `${cleanTripTitle || tripTitle} - ${activePackages[0].title}`;
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
          <h2>{cleanTripTitle || tripTitle}</h2>
          <p>{duration} | {destination}</p>
          {selectedDepartureDate && (
            <p style={{ marginTop: '5px', fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>
              Departure: {typeof selectedDepartureDate === 'string' ? selectedDepartureDate : `${selectedDepartureDate.start} to ${selectedDepartureDate.end}`}
            </p>
          )}
        </div>

        <div className={styles.modalBody}>
          
          {isMultiPackage ? (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }}>
                {activePackages.map((pkg, idx) => (
                  <div key={idx} style={{ paddingBottom: '15px', borderBottom: idx < activePackages.length - 1 ? '1px dashed #cbd5e1' : 'none' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Package Option {activePackages.length > 1 ? `#${idx + 1}` : ''}
                        </label>
                        {activePackages.length > 1 && (
                          <button 
                            type="button"
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
                            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', padding: '0 4px', display: 'flex', alignItems: 'center', gap: '2px' }}
                            title="Remove package"
                          >&times; Remove</button>
                        )}
                      </div>

                      {allPackages && allPackages.length > 1 ? (
                        <select 
                          value={pkg.title}
                          onChange={(e) => {
                            const selected = allPackages.find(p => p.title === e.target.value);
                            if (selected) {
                              const newPkgs = [...activePackages];
                              newPkgs[idx] = { title: selected.title, price: selected.price };
                              setActivePackages(newPkgs);
                            }
                          }}
                          style={{ 
                            width: '100%', 
                            padding: '10px 12px', 
                            borderRadius: '8px', 
                            border: '1.5px solid #cbd5e1', 
                            backgroundColor: '#f8fafc', 
                            fontSize: '0.92rem', 
                            fontWeight: '600', 
                            color: '#0f172a', 
                            outline: 'none', 
                            cursor: 'pointer' 
                          }}
                        >
                          {!allPackages.some(opt => opt.title === pkg.title) && (
                            <option value={pkg.title}>{pkg.title}</option>
                          )}
                          {allPackages.map((opt, optIdx) => {
                            const isChosenElsewhere = activePackages.some((ap, apIdx) => apIdx !== idx && ap.title === opt.title);
                            if (isChosenElsewhere) return null;

                            return (
                              <option key={optIdx} value={opt.title}>
                                {opt.title} — ₹{(Number(opt.price) || 0).toLocaleString('en-IN')}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.98rem' }}>{pkg.title}</div>
                      )}
                    </div>
                    
                    <div className={styles.priceRow} style={{ marginBottom: '10px' }}>
                      <span className={styles.priceLabel}>Price per person</span>
                      <span className={styles.priceValue}>₹ {(Number(pkg.price) || 0).toLocaleString('en-IN')}</span>
                    </div>

                    <div className={styles.personSelector} style={{ marginBottom: '0' }}>
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
                {allPackages && allPackages.some(p => !activePackages.some(ap => ap.title === p.title)) && (
                  <div style={{ marginTop: '5px', paddingTop: '15px', borderTop: '2px dashed #e2e8f0', paddingBottom: '5px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: '700', marginBottom: '8px' }}>
                      + Add Another Package Option
                    </label>
                    <select 
                      value=""
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const selectedPkg = allPackages.find(p => p.title === e.target.value);
                        if (selectedPkg) {
                          setActivePackages(prev => [...prev, { title: selectedPkg.title, price: selectedPkg.price }]);
                          setQuantities(prev => ({ ...prev, [activePackages.length]: 1 }));
                        }
                      }}
                      style={{ 
                        width: '100%', 
                        padding: '10px 12px', 
                        borderRadius: '8px', 
                        border: '1.5px solid #cbd5e1', 
                        backgroundColor: '#f8fafc', 
                        fontSize: '0.92rem', 
                        fontWeight: '600',
                        color: '#0f172a', 
                        outline: 'none', 
                        cursor: 'pointer' 
                      }}
                    >
                      <option value="">Select a package to add...</option>
                      {allPackages.map((pkg, i) => {
                        const isAlreadyAdded = activePackages.some(ap => ap.title === pkg.title);
                        if (isAlreadyAdded) return null;
                        return (
                          <option key={i} value={pkg.title}>
                            {pkg.title} — ₹{(Number(pkg.price) || 0).toLocaleString('en-IN')}
                          </option>
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
            {actualMode !== 'pre-book' && (
              <button 
                className={styles.payBtn} 
                onClick={() => handlePay('full')} 
                disabled={loading !== null || totalAmount <= 0}
                style={{ backgroundColor: '#10b981' }}
              >
                {loading === 'full' ? 'Processing...' : `Pay Full ₹${totalAmount.toLocaleString('en-IN')}`}
              </button>
            )}
            
            {actualMode === 'both' && (
              <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>OR</div>
            )}

            {actualMode !== 'full' && (
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
