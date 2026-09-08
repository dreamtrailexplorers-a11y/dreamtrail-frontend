import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './ManagePaymentReminders.module.css';
import { FiMail, FiClock, FiSearch, FiAlertTriangle, FiCheckCircle, FiDollarSign, FiMessageSquare, FiTrash2 } from 'react-icons/fi';

const ManagePaymentReminders = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'window' (46-55), 'overdue' (<=45)

  const fetchPendingBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings');
      
      // 1. Filter bookings that have a pending balance
      const pending = (res.data || []).filter(b => {
        // Exclude fully paid, cancelled, failed
        if (b.paymentStatus === 'Fully Paid' || b.paymentStatus === 'Cancelled' || b.paymentStatus === 'Failed') {
          return false;
        }
        // Balance due must be greater than 0
        const balanceDue = Number(b.paymentDetails?.balanceDue) || 0;
        if (balanceDue <= 0) {
          return false;
        }
        return true;
      });

      // 2. Calculate days left for departure
      const withDays = pending.map(b => {
        let daysLeft = null;
        if (b.departureDate && b.departureDate !== 'N/A') {
          try {
            let startStr = null;
            if (typeof b.departureDate === 'object' && b.departureDate !== null) {
              startStr = b.departureDate.start;
            } else if (typeof b.departureDate === 'string') {
              const parts = b.departureDate.split(' to ');
              startStr = parts[0]?.trim();
            }
            if (startStr) {
              const start = new Date(startStr);
              if (!isNaN(start.getTime())) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                start.setHours(0, 0, 0, 0);
                daysLeft = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              }
            }
          } catch (e) {}
        }
        return { ...b, daysLeft };
      });

      // 3. User Rule:
      // Final payment is required 45 days before departure.
      // Reminders should ONLY appear when departure is 55 days or fewer away (daysLeft <= 55).
      // Bookings further than 55 days are not in the reminder window yet.
      const dueForReminder = withDays.filter(b => b.daysLeft !== null && b.daysLeft <= 55 && b.daysLeft >= 0);

      // Sort closest departure first
      dueForReminder.sort((a, b) => a.daysLeft - b.daysLeft);

      setBookings(dueForReminder);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
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
      alert(error.response?.data?.message || 'Error sending reminder email. Check backend SMTP settings.');
    } finally {
      setSendingId(null);
    }
  };

  const handleWhatsAppReminder = (booking) => {
    const rawPhone = booking.user?.phone || booking.paymentDetails?.contact || '';
    const phoneDigits = rawPhone.replace(/\D/g, '');
    if (!phoneDigits) {
      alert('No phone number found for this traveler.');
      return;
    }
    const cleanPhone = phoneDigits.length === 10 ? `91${phoneDigits}` : phoneDigits;
    const travelerName = booking.user?.name || booking.paymentDetails?.name || 'Traveler';
    const tripName = booking.tripTitle ? booking.tripTitle.split(' - ')[0] : 'Your Trip';
    const balance = Number(booking.paymentDetails?.balanceDue || 0).toLocaleString('en-IN');
    const depDate = typeof booking.departureDate === 'object' && booking.departureDate !== null
      ? `${booking.departureDate.start} to ${booking.departureDate.end}`
      : (booking.departureDate || 'upcoming date');

    const msg = encodeURIComponent(
      `Hello ${travelerName}, this is a reminder from DreamTrail Explorers regarding your booking for *${tripName}* (Departure: ${depDate}).\n\nYour balance due amount is *₹${balance}*.\nAs per policy, full payment must be completed 45 days prior to departure. Kindly clear the pending balance to confirm your seat.\n\nThank you,\nDreamTrail Explorers`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    try {
      await api.delete(`/bookings/${bookingId}`);
      setBookings(prev => prev.filter(b => b._id !== bookingId));
      alert('Booking deleted successfully!');
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert(error.response?.data?.message || 'Failed to delete booking.');
    }
  };

  // Filtered Bookings based on search & filterType
  const filteredBookings = bookings.filter(b => {
    const name = (b.user?.name || b.paymentDetails?.name || '').toLowerCase();
    const email = (b.user?.email || b.paymentDetails?.email || '').toLowerCase();
    const phone = (b.user?.phone || b.paymentDetails?.contact || '').toLowerCase();
    const trip = (b.tripTitle || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = name.includes(q) || email.includes(q) || phone.includes(q) || trip.includes(q);
    if (!matchesSearch) return false;

    if (filterType === 'overdue') {
      return b.daysLeft <= 45;
    }
    if (filterType === 'window') {
      return b.daysLeft > 45 && b.daysLeft <= 55;
    }
    return true;
  });

  // Calculate Summary Statistics
  const totalPendingAmount = bookings.reduce((sum, b) => sum + (Number(b.paymentDetails?.balanceDue) || 0), 0);
  const overdueCount = bookings.filter(b => b.daysLeft <= 45).length;
  const windowCount = bookings.filter(b => b.daysLeft > 45 && b.daysLeft <= 55).length;

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          Loading payment reminders...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerContainer}>
        <div className={styles.titleArea}>
          <h1>Payment Reminders</h1>
          <p>Track travelers with pending balances and send email or WhatsApp payment reminders.</p>
        </div>
        <div className={styles.policyBadge}>
          <FiClock /> Policy: Full Payment required 45 days before departure (Reminders active 55 days prior)
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Due Reminders</span>
          <div className={styles.statValue}>{bookings.length}</div>
          <span className={styles.statSub}>Within 55 days of departure</span>
        </div>

        <div className={styles.statCard} style={{ borderLeft: '4px solid #ea580c' }}>
          <span className={styles.statLabel}>Reminder Window</span>
          <div className={styles.statValue} style={{ color: '#ea580c' }}>{windowCount}</div>
          <span className={styles.statSub}>46 - 55 days to departure</span>
        </div>

        <div className={styles.statCard} style={{ borderLeft: '4px solid #dc2626' }}>
          <span className={styles.statLabel}>Deadline Passed</span>
          <div className={styles.statValue} style={{ color: '#dc2626' }}>{overdueCount}</div>
          <span className={styles.statSub}>&le; 45 days to departure (Urgent)</span>
        </div>

        <div className={styles.statCard} style={{ borderLeft: '4px solid #10b981' }}>
          <span className={styles.statLabel}>Total Pending Balance</span>
          <div className={styles.statValue} style={{ color: '#0f172a' }}>
            ₹{totalPendingAmount.toLocaleString('en-IN')}
          </div>
          <span className={styles.statSub}>Across all due bookings</span>
        </div>
      </div>

      {/* Toolbar: Search & Filter */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <FiSearch color="#64748b" size={16} />
          <input 
            type="text" 
            placeholder="Search traveler, trip, email, phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filterChips}>
          <button 
            type="button" 
            className={`${styles.filterChip} ${filterType === 'all' ? styles.activeChip : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Due ({bookings.length})
          </button>
          <button 
            type="button" 
            className={`${styles.filterChip} ${filterType === 'window' ? styles.activeChip : ''}`}
            onClick={() => setFilterType('window')}
          >
            Reminder Window ({windowCount})
          </button>
          <button 
            type="button" 
            className={`${styles.filterChip} ${filterType === 'overdue' ? styles.activeChip : ''}`}
            onClick={() => setFilterType('overdue')}
          >
            Deadline Passed ({overdueCount})
          </button>
        </div>
      </div>

      {/* Table / List */}
      {filteredBookings.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FiCheckCircle size={32} color="#10b981" />
          </div>
          <div className={styles.emptyTitle}>No Reminders Due Right Now</div>
          <p className={styles.emptyDesc}>
            {searchQuery || filterType !== 'all' 
              ? 'No bookings match your current filter criteria.' 
              : 'All pending payment travelers are either already fully paid or their departure date is more than 55 days away. Bookings will automatically appear here once they reach 55 days before departure.'}
          </p>
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Traveler</th>
                  <th>Trip Details</th>
                  <th>Departure Timeline</th>
                  <th>Financials</th>
                  <th>Balance Due</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(booking => {
                  const days = booking.daysLeft;
                  const isOverdue = days <= 45;
                  const daysToDeadline = days - 45;

                  const formattedDepDate = typeof booking.departureDate === 'object' && booking.departureDate !== null
                    ? `${booking.departureDate.start} to ${booking.departureDate.end}`
                    : (booking.departureDate || 'N/A');

                  return (
                    <tr key={booking._id}>
                      {/* Traveler Cell */}
                      <td>
                        <div className={styles.travelerName}>
                          {booking.user?.name || booking.paymentDetails?.name || 'Unknown Traveler'}
                        </div>
                        <div className={styles.travelerMeta}>
                          <span>{booking.user?.email || booking.paymentDetails?.email || 'No Email'}</span>
                          <span>{booking.user?.phone || booking.paymentDetails?.contact || 'No Phone'}</span>
                        </div>
                      </td>

                      {/* Trip Details Cell */}
                      <td>
                        <div className={styles.tripTitle}>
                          {booking.tripTitle ? booking.tripTitle.split(' - ')[0] : 'Trip'}
                        </div>
                        <div className={styles.tripMeta}>
                          <span>{formattedDepDate}</span>
                          <span>{booking.numberOfPersons || 1} Person(s)</span>
                        </div>
                      </td>

                      {/* Departure Timeline Cell */}
                      <td>
                        <div style={{ marginBottom: '6px' }}>
                          <span className={`${styles.urgencyPill} ${isOverdue ? styles.pillCritical : styles.pillWarning}`}>
                            <FiClock size={13} /> {days} Days Left
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: isOverdue ? '#dc2626' : '#ea580c', fontWeight: '600' }}>
                          {isOverdue ? (
                            <span>⚠️ 45-day deadline passed</span>
                          ) : (
                            <span>⏳ {daysToDeadline} days until 45-day deadline</span>
                          )}
                        </div>
                      </td>

                      {/* Financials Cell */}
                      <td>
                        <div className={styles.totalAmount}>
                          Total: ₹{Number(booking.totalAmount || 0).toLocaleString('en-IN')}
                        </div>
                        <div className={styles.paidAmount}>
                          Paid: ₹{Number(booking.paymentDetails?.preBookPaid || 0).toLocaleString('en-IN')}
                        </div>
                      </td>

                      {/* Balance Due Cell */}
                      <td>
                        <span className={styles.balanceDue}>
                          ₹{Number(booking.paymentDetails?.balanceDue || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Action Cell */}
                      <td>
                        <div className={styles.actionGroup}>
                          <button
                            type="button"
                            onClick={() => handleSendReminder(booking._id)}
                            disabled={sendingId === booking._id}
                            className={styles.btnMail}
                            title="Send payment reminder email"
                          >
                            <FiMail size={15} />
                            {sendingId === booking._id ? 'Sending...' : 'Send Mail'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleWhatsAppReminder(booking)}
                            className={styles.btnWhatsapp}
                            title="Send payment reminder on WhatsApp"
                          >
                            <FiMessageSquare size={15} />
                            WhatsApp
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(booking._id)}
                            className={styles.btnDelete}
                            title="Delete booking"
                          >
                            <FiTrash2 size={15} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cards View for sm & md screens */}
        <div className={styles.cardsContainer}>
          {filteredBookings.map(booking => {
            const days = booking.daysLeft;
            const isOverdue = days <= 45;
            const daysToDeadline = days - 45;

            const formattedDepDate = typeof booking.departureDate === 'object' && booking.departureDate !== null
              ? `${booking.departureDate.start} to ${booking.departureDate.end}`
              : (booking.departureDate || 'N/A');

            return (
              <div key={booking._id} className={styles.reminderCard}>
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.travelerName}>
                      {booking.user?.name || booking.paymentDetails?.name || 'Unknown Traveler'}
                    </div>
                    <div className={styles.travelerMeta}>
                      <span>{booking.user?.email || booking.paymentDetails?.email || 'No Email'}</span>
                      <span>{booking.user?.phone || booking.paymentDetails?.contact || 'No Phone'}</span>
                    </div>
                  </div>
                  <div className={styles.cardUrgencyArea}>
                    <span className={`${styles.urgencyPill} ${isOverdue ? styles.pillCritical : styles.pillWarning}`}>
                      <FiClock size={13} /> {days} Days Left
                    </span>
                    <div style={{ fontSize: '0.78rem', color: isOverdue ? '#dc2626' : '#ea580c', fontWeight: '600', marginTop: '4px', textAlign: 'right' }}>
                      {isOverdue ? '⚠️ 45-day deadline passed' : `⏳ ${daysToDeadline} days until 45-day deadline`}
                    </div>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardTripDetails}>
                    <div className={styles.cardSectionLabel}>Trip Details</div>
                    <div className={styles.tripTitle}>
                      {booking.tripTitle ? booking.tripTitle.split(' - ')[0] : 'Trip'}
                    </div>
                    <div className={styles.tripMeta}>
                      <span>📅 {formattedDepDate}</span>
                      <span>👥 {booking.numberOfPersons || 1} Person(s)</span>
                    </div>
                  </div>

                  <div className={styles.cardFinancials}>
                    <div className={styles.cardSectionLabel}>Financials</div>
                    <div className={styles.totalAmount}>
                      Total: ₹{Number(booking.totalAmount || 0).toLocaleString('en-IN')}
                    </div>
                    <div className={styles.paidAmount}>
                      Paid: ₹{Number(booking.paymentDetails?.preBookPaid || 0).toLocaleString('en-IN')}
                    </div>
                    <div className={styles.cardBalanceRow}>
                      <span className={styles.cardBalanceLabel}>Balance Due:</span>
                      <span className={styles.balanceDue}>
                        ₹{Number(booking.paymentDetails?.balanceDue || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <button
                    type="button"
                    onClick={() => handleSendReminder(booking._id)}
                    disabled={sendingId === booking._id}
                    className={styles.btnMail}
                    title="Send payment reminder email"
                  >
                    <FiMail size={15} />
                    {sendingId === booking._id ? 'Sending...' : 'Send Mail'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleWhatsAppReminder(booking)}
                    className={styles.btnWhatsapp}
                    title="Send payment reminder on WhatsApp"
                  >
                    <FiMessageSquare size={15} />
                    WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(booking._id)}
                    className={styles.btnDelete}
                    title="Delete booking"
                  >
                    <FiTrash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}
    </div>
  );
};

export default ManagePaymentReminders;
