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
      case 'Pre-Booked': return styles.badgePreBooked;
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

  const renderPackageDetails = (tripTitle) => {
    if (!tripTitle) return <div style={{fontWeight: 600, color: '#1e293b'}}>-</div>;
    
    // Handle "Trip Name - Multiple Packages (Pkg1 x2, Pkg2 x1)"
    const match = tripTitle.match(/(.*) - Multiple Packages \((.*)\)/);
    if (match) {
      const title = match[1];
      const pkgsStr = match[2];
      const pkgs = pkgsStr.split(', ');
      return (
        <div>
          <div style={{fontWeight: 700, color: '#0f172a', marginBottom: '8px'}}>{title}</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
            {pkgs.map((p, i) => (
               <div key={i} style={{fontSize: '0.85rem', color: '#475569', display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px dashed #cbd5e1'}}>
                 <span>{p.split(' x')[0]}</span>
                 <span style={{fontWeight: 600, color: '#0f172a'}}>x{p.split(' x')[1]}</span>
               </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Handle normal "Trip Name (Package1)"
    if (tripTitle.includes(' (')) {
      const title = tripTitle.split(' (')[0];
      const pkg = tripTitle.split(' (')[1].replace(')', '');
      return (
        <div>
          <div style={{fontWeight: 700, color: '#0f172a'}}>{title}</div>
          <div style={{fontSize: '0.85rem', color: '#64748b', marginTop: '2px'}}>{pkg}</div>
        </div>
      );
    }

    return <div style={{fontWeight: 700, color: '#0f172a'}}>{tripTitle}</div>;
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

      <div className={styles.cardsGrid}>
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div key={booking._id} className={styles.bookingCard}>
              
              <div className={styles.cardHeader}>
                <div>
                  <div className={styles.orderId}>#{booking.razorpayOrderId || booking._id.substring(0,8)}</div>
                  <div className={styles.dateText}>Booked on {formatDate(booking.createdAt)}</div>
                </div>
                <span className={`${styles.badge} ${getBadgeClass(booking.paymentStatus)}`}>
                  {booking.paymentStatus}
                </span>
              </div>

              <div className={styles.cardBody}>
                
                <div className={styles.customerInfo}>
                  <div className={styles.customerName}>{booking.user ? booking.user.name : 'Unknown User'}</div>
                  <div className={styles.customerEmail}>{booking.user ? booking.user.email : 'N/A'}</div>
                </div>

                <div className={styles.tripInfo}>
                  {renderPackageDetails(booking.tripTitle)}
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginBottom: '15px' }}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Destination:</span>
                    <span className={styles.infoValue}>{booking.destination || '-'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Departure:</span>
                    <span className={styles.infoValue}>{booking.departureDate || '-'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Duration:</span>
                    <span className={styles.infoValue}>{booking.duration || '-'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Total Persons:</span>
                    <span className={styles.infoValue}>{booking.numberOfPersons}</span>
                  </div>
                </div>

                <div className={styles.financialsBox}>
                  <div className={styles.totalAmount}>
                    <span>Total Amount</span>
                    <span>₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  
                  {Boolean(booking.paymentDetails?.preBookPaid && booking.paymentDetails.preBookPaid > 0) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>Pre-Booked:</span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>({formatDate(booking.createdAt)})</span>
                      </span>
                      <span style={{ fontWeight: 600, color: '#3730a3' }}>
                        ₹{booking.paymentDetails.preBookPaid.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  {(booking.paymentStatus === 'Pre-Booked' || booking.paymentStatus === 'Pending') && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#ef4444', marginTop: '4px' }}>
                      <span style={{ fontWeight: 500 }}>Balance Due:</span>
                      <span style={{ fontWeight: 700 }}>
                        ₹{(booking.paymentDetails?.balanceDue ?? Math.max(0, (booking.totalAmount || 0) - (booking.paymentDetails?.preBookPaid || 0))).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  
                  {booking.paymentStatus === 'Fully Paid' && Boolean(booking.paymentDetails?.preBookPaid && booking.paymentDetails.preBookPaid > 0) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#16a34a', marginTop: '4px' }}>
                      <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>Balance Paid:</span>
                        <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 'normal' }}>
                          ({booking.paymentDetails?.balancePaidAt ? formatDate(booking.paymentDetails.balancePaidAt) : formatDate(booking.updatedAt || booking.createdAt)})
                        </span>
                      </span>
                      <span style={{ fontWeight: 700 }}>
                        ₹{((booking.paymentDetails?.balancePaid && booking.paymentDetails.balancePaid > 0)
                          ? booking.paymentDetails.balancePaid
                          : Math.max(0, (booking.totalAmount || 0) - (booking.paymentDetails?.preBookPaid || 0))
                        ).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  {booking.paymentStatus === 'Fully Paid' && (!booking.paymentDetails?.preBookPaid || booking.paymentDetails.preBookPaid <= 0) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#16a34a', marginTop: '4px' }}>
                      <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>Paid:</span>
                        <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 'normal' }}>({formatDate(booking.createdAt)})</span>
                      </span>
                      <span style={{ fontWeight: 700 }}>₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.actionBtns}>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(booking._id)}>Delete</button>
                  {booking.paymentDetails && booking.paymentDetails.balancePaymentLinkUrl && booking.paymentStatus === 'Pre-Booked' && (
                    <a 
                      href={`https://wa.me/?text=Hi %2A${booking.user?.name}%2A, your balance payment of Rs. ${booking.paymentDetails.balanceDue} for ${booking.tripTitle} is pending. Pay here: ${booking.paymentDetails.balancePaymentLinkUrl}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className={styles.whatsappBtn}
                    >
                      Send Payment Link
                    </a>
                  )}
                </div>
              </div>

            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <h3 style={{ color: '#475569', margin: 0 }}>No bookings found matching filters.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBookings;
