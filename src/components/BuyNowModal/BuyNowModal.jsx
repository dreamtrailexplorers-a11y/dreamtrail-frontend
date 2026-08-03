import React, { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import styles from './BuyNowModal.module.css';
import { createPaymentOrder, verifyPayment } from '../../services/api';

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

const BuyNowModal = ({ isOpen, onClose, tripTitle, pricePerPerson, duration, destination, selectedDepartureDate }) => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [persons, setPersons] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validPrice = Number(pricePerPerson) || 0;
  const totalAmount = validPrice * persons;

  const handleIncrement = () => setPersons(prev => prev + 1);
  const handleDecrement = () => setPersons(prev => (prev > 1 ? prev - 1 : 1));

  const handlePay = async () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    setLoading(true);
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert('Failed to load Razorpay SDK. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // 1. Create order on backend
      const res = await createPaymentOrder(
        { 
          amount: totalAmount, 
          tripTitle, 
          pricePerPerson: validPrice, 
          numberOfPersons: persons, 
          duration, 
          destination,
          departureDate: selectedDepartureDate ? `${selectedDepartureDate.start} to ${selectedDepartureDate.end}` : ''
        }
      );
      const { order, keyId, bookingId } = res.data;

      // 2. Initialize Razorpay options
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'DreamTrail',
        description: `Payment for ${tripTitle} - ${persons} Person(s)`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // 3. Verify Payment
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
      setLoading(false);
    }
  };

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        
        <div className={styles.modalHeader}>
          <h2>Buy Now</h2>
          <p>{tripTitle}</p>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.priceRow}>
            <span className={styles.priceLabel}>Price per person</span>
            <span className={styles.priceValue}>₹ {validPrice.toLocaleString('en-IN')}</span>
          </div>

          <div className={styles.personSelector}>
            <span className={styles.selectorLabel}>Number of Persons</span>
            <div className={styles.counter}>
              <button className={styles.counterBtn} onClick={handleDecrement}>-</button>
              <span className={styles.counterValue}>{persons}</span>
              <button className={styles.counterBtn} onClick={handleIncrement}>+</button>
            </div>
          </div>

          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total Amount</span>
            <span className={styles.totalValue}>₹ {totalAmount.toLocaleString('en-IN')}</span>
          </div>

          <button 
            className={styles.payBtn} 
            onClick={handlePay}
            disabled={loading || totalAmount <= 0}
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BuyNowModal;
