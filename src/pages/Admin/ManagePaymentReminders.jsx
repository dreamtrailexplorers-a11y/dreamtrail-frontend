import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './Admin.module.css';
import { FiMail, FiCheck, FiX, FiClock } from 'react-icons/fi';

const ManagePaymentReminders = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);

  const fetchPendingBookings = async () => {
    try {
      const res = await api.get('/bookings');
      // Filter bookings that are not fully paid
      const pending = res.data.filter(b => b.paymentStatus !== 'Fully Paid' && b.paymentStatus !== 'Cancelled' && b.paymentStatus !== 'Failed');
      
      // Calculate days left for departure
      const withDays = pending.map(b => {
        let daysLeft = null;
        if (b.departureDate && b.departureDate !== 'N/A') {
          try {
            const dates = b.departureDate.split(' to ');
            const start = new Date(dates[0]);
            const today = new Date();
            today.setHours(0,0,0,0);
            daysLeft = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
          } catch(e) {}
        }
        return { ...b, daysLeft };
      });
      
      // Sort by days left (closest first)
      withDays.sort((a, b) => {
        if (a.daysLeft === null) return 1;
        if (b.daysLeft === null) return -1;
        return a.daysLeft - b.daysLeft;
      });

      setBookings(withDays);
    } catch (error) {
      console.error('Error fetching bookings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const handleSendReminder = async (bookingId) => {
    if (!window.confirm('Are you sure you want to send a payment reminder email?')) return;
    
    setSendingId(bookingId);
    try {
      const res = await api.post(`/bookings/${bookingId}/send-reminder`);
      if (res.data.success) {
        alert('Reminder email sent successfully!');
      } else {
        alert(res.data.message || 'Failed to send reminder.');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert(error.response?.data?.message || 'Error sending reminder email. Ensure SMTP is configured in .env.');
    } finally {
      setSendingId(null);
    }
  };

  if (loading) return <div className={styles.loading}>Loading payment reminders...</div>;

  return (
    <div className={styles.adminContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Payment Reminders</h1>
      </div>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Manage pending payments and send email reminders to travelers.
      </p>

      {bookings.length === 0 ? (
        <p>No pending payments found.</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Traveler</th>
                <th>Trip Details</th>
                <th>Departure In</th>
                <th>Total Cost</th>
                <th>Balance Due</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking._id} style={{ backgroundColor: (booking.daysLeft !== null && booking.daysLeft <= 45 && booking.daysLeft >= 10) ? '#fff7ed' : (booking.daysLeft !== null && booking.daysLeft < 10) ? '#fef2f2' : 'inherit' }}>
                  <td>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{booking.user?.name || booking.paymentDetails?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{booking.user?.email || booking.paymentDetails?.email || 'No email'}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{booking.user?.phone || booking.paymentDetails?.contact || ''}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{booking.tripTitle.split(' - ')[0]}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{booking.departureDate || 'N/A'}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{booking.numberOfPersons} Person(s)</div>
                  </td>
                  <td>
                    {booking.daysLeft !== null ? (
                      <span style={{ 
                        color: booking.daysLeft <= 10 ? '#ef4444' : booking.daysLeft <= 45 ? '#f97316' : '#10b981',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <FiClock /> {booking.daysLeft} Days
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td style={{ fontWeight: '600' }}>
                    ₹{booking.totalAmount?.toLocaleString('en-IN')}
                  </td>
                  <td style={{ fontWeight: 'bold', color: '#ef4444' }}>
                    ₹{booking.paymentDetails?.balanceDue?.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <button 
                      onClick={() => handleSendReminder(booking._id)}
                      disabled={sendingId === booking._id}
                      className={styles.btnAction}
                      style={{ 
                        backgroundColor: '#3b82f6', 
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 12px',
                        opacity: sendingId === booking._id ? 0.7 : 1
                      }}
                    >
                      <FiMail /> {sendingId === booking._id ? 'Sending...' : 'Send Mail'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManagePaymentReminders;
