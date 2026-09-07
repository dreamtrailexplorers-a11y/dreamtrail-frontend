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

const BuyNowModal = ({ isOpen, onClose, tripTitle, pricePerPerson, duration, destination, selectedDepartureDate, mode = 'both', selectedPackages }) => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Replace single persons with quantities mapped by package index
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(null);
  const [preBookingSettings, setPreBookingSettings] = useState(null);

  useEffect(() => {
    if (isOpen) {
      getSiteSettings().then(res => setPreBookingSettings(res.data?.preBookingSettings)).catch(console.error);
      
      // Initialize quantities based on selectedPackages
      if (selectedPackages && selectedPackages.length > 0) {
        const initialQs = {};
        selectedPackages.forEach((_, i) => { initialQs[i] = 1; });
        setQuantities(initialQs);
      } else {
        setQuantities({ default: 1 });
      }
    }
  }, [isOpen, selectedPackages]);

  if (!isOpen) return null;

  const isMultiPackage = selectedPackages && selectedPackages.length > 0;

  let totalAmount = 0;
  let totalPersons = 0;
  let combinedTripTitle = tripTitle;

  if (isMultiPackage) {
    selectedPackages.forEach((pkg, idx) => {
      const q = quantities[idx] || 1;
      totalAmount += (Number(pkg.price) || 0) * q;
      totalPersons += q;
    });
    
    if (selectedPackages.length > 1) {
       const packageDetails = selectedPackages.map((pkg, idx) => `${pkg.title} x${quantities[idx] || 1}`).join(', ');
       combinedTripTitle = `${tripTitle} - Multiple Packages (${packageDetails})`;
    } else if (selectedPackages.length === 1) {
       combinedTripTitle = `${tripTitle} - ${selectedPackages[0].title}`;
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
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {selectedPackages.map((pkg, idx) => (
                <div key={idx} style={{ paddingBottom: '15px', borderBottom: idx < selectedPackages.length - 1 ? '1px dashed #cbd5e1' : 'none' }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>{pkg.title}</div>
                  
                  <div className={styles.priceRow} style={{ marginBottom: '10px' }}>
                    <span className={styles.priceLabel}>Price per person</span>
                    <span className={styles.priceValue}>₹ {pkg.price.toLocaleString('en-IN')}</span>
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
