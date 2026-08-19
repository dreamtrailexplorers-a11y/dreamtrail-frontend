import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import styles from './ManageBookings.module.css';
import adminStyles from '../Admin.module.css';
import { FiDownload, FiSearch } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format Date Helper
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  };

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/bookings');
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await api.delete(`/bookings/${id}`);
        fetchBookings(); // Refresh list after deletion
      } catch (err) {
        console.error('Error deleting booking:', err);
        alert('Failed to delete booking');
      }
    }
  };

  const getBadgeClass = (status) => {
    switch(status) {
      case 'Paid': return styles.badgePaid;
      case 'Pending': return styles.badgePending;
      case 'Failed': return styles.badgeFailed;
      default: return styles.badgePending;
    }
  };

  // Filter Logic
  const filteredBookings = bookings.filter(booking => {
    // 1. Search Query
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (booking.user && booking.user.name && booking.user.name.toLowerCase().includes(searchLower)) ||
      (booking.user && booking.user.email && booking.user.email.toLowerCase().includes(searchLower)) ||
      (booking.tripTitle && booking.tripTitle.toLowerCase().includes(searchLower)) ||
      (booking.destination && booking.destination.toLowerCase().includes(searchLower));

    // 2. Date Range Filter
    let matchesDateRange = true;
    const bookingDate = new Date(booking.createdAt);
    if (startDate) {
      matchesDateRange = matchesDateRange && (bookingDate >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchesDateRange = matchesDateRange && (bookingDate <= end);
    }

    // 3. Month/Year Filter (format: YYYY-MM)
    let matchesMonth = true;
    if (selectedMonth) {
      const bookingMonthStr = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}`;
      matchesMonth = (bookingMonthStr === selectedMonth);
    }

    return matchesSearch && matchesDateRange && matchesMonth;
  });

  // PDF Export
  const handleDownloadPDF = () => {
    const doc = new jsPDF('landscape');
    
    // Add Title
    doc.setFontSize(16);
    doc.text('Bookings Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    // Table Data
    const tableColumn = ["Date", "Customer", "Email", "Trip", "Dest", "Dep Date", "Duration", "Pax", "Amount", "Status", "Order ID"];
    const tableRows = [];

    filteredBookings.forEach(booking => {
      const rowData = [
        formatDate(booking.createdAt),
        booking.user ? booking.user.name : '-',
        booking.user ? booking.user.email : '-',
        booking.tripTitle || '-',
        booking.destination || '-',
        booking.departureDate || '-',
        booking.duration || '-',
        booking.numberOfPersons || '-',
        booking.totalAmount ? booking.totalAmount.toLocaleString('en-IN') : '-',
        booking.paymentStatus || '-',
        booking.razorpayOrderId || '-'
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`Bookings_Report_${new Date().getTime()}.pdf`);
  };

  // Excel (CSV) Export
  const handleDownloadExcel = () => {
    const tableColumn = ["Date", "Customer", "Email", "Trip", "Dest", "Dep Date", "Duration", "Pax", "Amount", "Status", "Order ID"];
    const csvRows = [];
    csvRows.push(tableColumn.join(','));

    filteredBookings.forEach(booking => {
      const rowData = [
        formatDate(booking.createdAt),
        booking.user ? booking.user.name : '-',
        booking.user ? booking.user.email : '-',
        booking.tripTitle || '-',
        booking.destination || '-',
        booking.departureDate ? `\t${booking.departureDate}` : '-',
        booking.duration || '-',
        booking.numberOfPersons || '-',
        booking.totalAmount ? booking.totalAmount.toString() : '-',
        booking.paymentStatus || '-',
        booking.razorpayOrderId ? `\t${booking.razorpayOrderId}` : '-'
      ];
      csvRows.push(rowData.map(item => `"${item}"`).join(','));
    });

    const csvData = new Blob(['\ufeff' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const csvUrl = URL.createObjectURL(csvData);
    const hiddenElement = document.createElement('a');
    hiddenElement.href = csvUrl;
    hiddenElement.target = '_blank';
    hiddenElement.download = `Bookings_Report_${new Date().getTime()}.csv`;
    hiddenElement.click();
  };


  if (loading) return <div className={styles.container}>Loading bookings...</div>;
  if (error) return <div className={styles.container}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={adminStyles.adminResponsiveHeader}>
        <h1 className={styles.title} style={{ margin: 0 }}>Manage Bookings</h1>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleDownloadExcel} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          >
            <FiDownload /> Download Excel
          </button>
          <button 
            onClick={handleDownloadPDF} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          >
            <FiDownload /> Download PDF
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        
        {/* Search */}
        <div style={{ flex: '1 1 250px', display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px' }}>
          <FiSearch color="#64748b" />
          <input 
            type="text" 
            placeholder="Search customer, trip, destination..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', padding: '10px', width: '100%' }}
          />
        </div>

        {/* Month Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>Month:</label>
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              if(e.target.value) { setStartDate(''); setEndDate(''); }
            }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        {/* Date Range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>From:</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if(e.target.value) setSelectedMonth('');
            }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontFamily: 'inherit' }}
          />
          <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>To:</label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              if(e.target.value) setSelectedMonth('');
            }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        {/* Clear Filters */}
        {(searchQuery || startDate || endDate || selectedMonth) && (
          <button 
            onClick={() => { setSearchQuery(''); setStartDate(''); setEndDate(''); setSelectedMonth(''); }}
            style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Trip / Package</th>
              <th>Destination</th>
              <th>Travel / Dep Date</th>
              <th>Duration</th>
              <th>Persons</th>
              <th>Total Amount</th>
              <th>Pre-Booked</th>
              <th>Balance Due/Paid</th>
              <th>Payment Status</th>
              <th>Order ID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td data-label="Date">{formatDate(booking.createdAt)}</td>
                  <td data-label="Customer">
                    {booking.user ? (
                      <div>
                        <strong>{booking.user.name}</strong><br/>
                        <small>{booking.user.email}</small>
                      </div>
                    ) : 'N/A'}
                  </td>
                  <td data-label="Trip/Package">
                    {booking.tripTitle?.includes(' (') ? (
                        <>
                          <div style={{fontWeight: 600, color: '#0f172a'}}>{booking.tripTitle.split(' (')[0]}</div>
                          <div style={{fontSize: '0.85em', color: '#64748b'}}>{booking.tripTitle.split(' (')[1].replace(')', '')}</div>
                        </>
                      ) : (
                        booking.tripTitle
                      )}
                    </td>
                  <td data-label="Destination">{booking.destination || '-'}</td>
                  <td data-label="Dep Date">{booking.departureDate || '-'}</td>
                  <td data-label="Duration">{booking.duration || '-'}</td>
                  <td data-label="Persons">{booking.numberOfPersons}</td>
                  <td data-label="Total Amount">
  <div style={{fontWeight: 600}}>₹{booking.totalAmount?.toLocaleString('en-IN')}</div>
</td>
<td data-label="Pre-Booked">
  {booking.paymentDetails && booking.paymentDetails.preBookPaid > 0 ? (
    <div style={{ color: booking.paymentStatus === 'Pending' ? '#ef4444' : '#10b981', fontSize: '0.85rem' }}>
      {booking.paymentStatus === 'Pending' ? 'Pending:' : 'Paid:'} ₹{booking.paymentDetails.preBookPaid?.toLocaleString('en-IN')}
      <br/><span style={{fontSize: '0.75rem', color: '#64748b'}}>{new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
    </div>
  ) : (
    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>-</div>
  )}
</td>
<td data-label="Balance Due/Paid">
  {booking.paymentDetails && booking.paymentDetails.preBookPaid > 0 ? (
    booking.paymentStatus === 'Fully Paid' && booking.paymentDetails.balancePaidAt ? (
      <div style={{ color: '#10b981', fontSize: '0.85rem' }}>
        Paid: ₹{booking.paymentDetails.balancePaid?.toLocaleString('en-IN') || (booking.totalAmount - booking.paymentDetails.preBookPaid).toLocaleString('en-IN')}
        <br/><span style={{fontSize: '0.75rem', color: '#64748b'}}>{new Date(booking.paymentDetails.balancePaidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>
    ) : (
      <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>
        Due: ₹{booking.paymentDetails.balanceDue?.toLocaleString('en-IN')}
      </div>
    )
  ) : (
    booking.paymentStatus === 'Paid' ? (
      <div style={{ color: '#10b981', fontSize: '0.85rem' }}>
        Fully Paid
      </div>
    ) : (
      <div style={{ color: '#64748b', fontSize: '0.85rem' }}>-</div>
    )
  )}
</td>
                  <td data-label="Payment Status">
                    <span className={`${styles.badge} ${getBadgeClass(booking.paymentStatus)}`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td data-label="Order ID">{booking.razorpayOrderId || '-'}</td>
                  <td data-label="Action" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
  <button onClick={() => handleDelete(booking._id)} style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
  {booking.paymentDetails && booking.paymentDetails.balancePaymentLinkUrl && booking.paymentStatus === 'Pre-Booked' && (
    <a href={`https://wa.me/?text=Hi %2A${booking.user?.name}%2A, your balance payment of Rs. ${booking.paymentDetails.balanceDue} for ${booking.tripTitle} is pending. Pay here: ${booking.paymentDetails.balancePaymentLinkUrl}`} target="_blank" rel="noreferrer" style={{ backgroundColor: '#25D366', color: 'white', padding: '6px 12px', borderRadius: '4px', textDecoration: 'none', textAlign: 'center', fontSize: '0.85rem' }}>WhatsApp Link</a>
  )}
</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>
                  No bookings found matching filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageBookings;
