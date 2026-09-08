import React, { useState, useContext, useEffect, useRef } from 'react';
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

const PackageItemDropdown = ({ pkg, idx, allPackages, activePackages, onSelectPackage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectableOptions = (allPackages || []).filter(
    (opt) => !activePackages.some((ap, apIdx) => apIdx !== idx && ap.title === opt.title)
  );

  if (!allPackages || allPackages.length <= 1) {
    return (
      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem', lineHeight: '1.3' }}>
        {pkg.title}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          borderRadius: isOpen ? '6px 6px 0 0' : '6px',
          border: isOpen ? '1.5px solid #0f172a' : '1px solid #cbd5e1',
          backgroundColor: '#ffffff',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.15s ease',
          boxShadow: isOpen ? '0 0 0 2px rgba(15, 23, 42, 0.08)' : 'none'
        }}
      >
        <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a', flex: 1, paddingRight: '8px', lineHeight: '1.3' }}>
          {pkg.title}
        </span>
        <span style={{ fontSize: '0.7rem', color: '#64748b', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
          ▼
        </span>
      </div>

      {isOpen && (
        <div style={{
          position: 'relative',
          width: '100%',
          border: '1.5px solid #0f172a',
          borderTop: 'none',
          borderRadius: '0 0 6px 6px',
          backgroundColor: '#ffffff',
          maxHeight: '160px',
          overflowY: 'auto',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)'
        }}>
          {selectableOptions.map((opt, i) => (
            <div
              key={i}
              onClick={() => {
                onSelectPackage(idx, opt);
                setIsOpen(false);
              }}
              style={{
                padding: '9px 12px',
                borderBottom: i < selectableOptions.length - 1 ? '1px solid #f1f5f9' : 'none',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: opt.title === pkg.title ? '#f1f5f9' : '#ffffff',
                transition: 'background-color 0.12s ease'
              }}
              onMouseEnter={(e) => { if (opt.title !== pkg.title) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
              onMouseLeave={(e) => { if (opt.title !== pkg.title) e.currentTarget.style.backgroundColor = '#ffffff'; }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: opt.title === pkg.title ? '700' : '600', color: opt.title === pkg.title ? '#0f172a' : '#334155', flex: 1, lineHeight: '1.3' }}>
                {opt.title}
              </span>
              <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#10b981', whiteSpace: 'nowrap' }}>
                ₹{(Number(opt.price) || 0).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomAddPackageDropdown = ({ allPackages, activePackages, onAddPackage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availablePackages = (allPackages || []).filter(
    (pkg) => !activePackages.some((ap) => ap.title === pkg.title)
  );

  if (availablePackages.length === 0) return null;

  return (
    <div ref={dropdownRef} style={{ marginTop: '2px' }}>
      <div style={{ position: 'relative', width: '100%' }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '9px 12px',
            borderRadius: isOpen ? '6px 6px 0 0' : '6px',
            border: isOpen ? '1.5px solid #0f172a' : '1.5px dashed #cbd5e1',
            backgroundColor: isOpen ? '#ffffff' : '#f8fafc',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'all 0.15s ease',
            boxShadow: isOpen ? '0 0 0 2px rgba(15, 23, 42, 0.08)' : 'none'
          }}
          onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.borderColor = '#94a3b8'; }}
          onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.borderColor = '#cbd5e1'; }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: '#e60000', fontSize: '1rem', lineHeight: 1 }}>+</span> Add Another Package Option
          </span>
          <span style={{ fontSize: '0.7rem', color: '#64748b', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
            ▼
          </span>
        </div>

        {isOpen && (
          <div style={{
            position: 'relative',
            width: '100%',
            border: '1.5px solid #0f172a',
            borderTop: 'none',
            borderRadius: '0 0 6px 6px',
            backgroundColor: '#ffffff',
            maxHeight: '160px',
            overflowY: 'auto',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)'
          }}>
            {availablePackages.map((pkg, i) => (
              <div
                key={i}
                onClick={() => {
                  onAddPackage(pkg);
                  setIsOpen(false);
                }}
                style={{
                  padding: '9px 12px',
                  borderBottom: i < availablePackages.length - 1 ? '1px solid #f1f5f9' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'background-color 0.12s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', flex: 1, lineHeight: '1.3' }}>
                  {pkg.title}
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#10b981', whiteSpace: 'nowrap' }}>
                  ₹{(Number(pkg.price) || 0).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
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
            <div className={styles.packagesScrollContainer}>
              {activePackages.map((pkg, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '10px', 
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Package Option {activePackages.length > 1 ? `#${idx + 1}` : ''}
                    </span>
                    {activePackages.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => {
                          const newPkgs = [...activePackages];
                          newPkgs.splice(idx, 1);
                          setActivePackages(newPkgs);
                          
                          const newQs = { ...quantities };
                          delete newQs[idx];
                          const reindexedQs = {};
                          newPkgs.forEach((_, i) => {
                            reindexedQs[i] = i >= idx ? newQs[i + 1] : newQs[i];
                          });
                          setQuantities(reindexedQs);
                        }}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#ef4444', 
                          fontSize: '0.78rem', 
                          fontWeight: '700', 
                          cursor: 'pointer', 
                          padding: '1px 6px',
                          borderRadius: '4px',
                          transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Remove package"
                      >&times; Remove</button>
                    )}
                  </div>

                  <PackageItemDropdown 
                    pkg={pkg}
                    idx={idx}
                    allPackages={allPackages}
                    activePackages={activePackages}
                    onSelectPackage={(targetIdx, selected) => {
                      const newPkgs = [...activePackages];
                      newPkgs[targetIdx] = { title: selected.title, price: selected.price };
                      setActivePackages(newPkgs);
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2px' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600', display: 'block' }}>Price / person</span>
                      <span style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                        ₹{(Number(pkg.price) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '3px 8px' }}>
                      <button 
                        type="button"
                        onClick={() => handleDecrement(idx)}
                        style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '4px', 
                          border: 'none', 
                          backgroundColor: '#f1f5f9', 
                          color: '#0f172a', 
                          fontSize: '1rem', 
                          fontWeight: '700', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          cursor: 'pointer' 
                        }}
                      >-</button>
                      <span style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', minWidth: '18px', textAlign: 'center' }}>
                        {quantities[idx] || 1}
                      </span>
                      <button 
                        type="button"
                        onClick={() => handleIncrement(idx)}
                        style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '4px', 
                          border: 'none', 
                          backgroundColor: '#f1f5f9', 
                          color: '#0f172a', 
                          fontSize: '1rem', 
                          fontWeight: '700', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          cursor: 'pointer' 
                        }}
                      >+</button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Custom Add Package Dropdown */}
              <CustomAddPackageDropdown 
                allPackages={allPackages}
                activePackages={activePackages}
                onAddPackage={(selectedPkg) => {
                  setActivePackages(prev => [...prev, { title: selectedPkg.title, price: selectedPkg.price }]);
                  setQuantities(prev => ({ ...prev, [activePackages.length]: 1 }));
                }}
              />
            </div>
          ) : (
            <div className={styles.packagesScrollContainer} style={{ maxHeight: 'none' }}>
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600', display: 'block' }}>Price / person</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
                    ₹{(Number(pricePerPerson) || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '3px 8px' }}>
                  <button 
                    type="button"
                    onClick={() => handleDecrement('default')}
                    style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', backgroundColor: '#f1f5f9', color: '#0f172a', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >-</button>
                  <span style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', minWidth: '18px', textAlign: 'center' }}>
                    {quantities.default || 1}
                  </span>
                  <button 
                    type="button"
                    onClick={() => handleIncrement('default')}
                    style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', backgroundColor: '#f1f5f9', color: '#0f172a', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >+</button>
                </div>
              </div>
            </div>
          )}

          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total Trip Cost</span>
            <span className={styles.totalValue}>₹ {totalAmount.toLocaleString('en-IN')}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
