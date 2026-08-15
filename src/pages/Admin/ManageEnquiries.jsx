import React, { useState, useEffect } from 'react';
import { getEnquiries, deleteEnquiry } from '../../services/api';
import styles from './Admin.module.css';
import { FiTrash2, FiDownload, FiSearch } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ManageEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Format Date Helper
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
    return ${dd}//;
  };

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [activeTab, setActiveTab] = useState('packages'); // 'packages' | 'contact'

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const { data } = await getEnquiries();
      setEnquiries(data);
    } catch (error) {
      console.error('Failed to fetch enquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      try {
        await deleteEnquiry(id);
        fetchEnquiries();
      } catch (error) {
        console.error('Failed to delete enquiry:', error);
      }
    }
  };

  // Filter Logic
  const filteredEnquiries = enquiries.filter(enq => {
    // 0. Tab Filter
    const isContact = enq.tripTitle === 'General Contact';
    if (activeTab === 'packages' && isContact) return false;
    if (activeTab === 'contact' && !isContact) return false;

    // 1. Search Query
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (enq.name && enq.name.toLowerCase().includes(searchLower)) ||
      (enq.email && enq.email.toLowerCase().includes(searchLower)) ||
      (enq.phone && enq.phone.includes(searchLower)) ||
      (enq.tripTitle && enq.tripTitle.toLowerCase().includes(searchLower));

    // 2. Date Range Filter
    let matchesDateRange = true;
    const enqDate = new Date(enq.createdAt);
    if (startDate) {
      matchesDateRange = matchesDateRange && (enqDate >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchesDateRange = matchesDateRange && (enqDate <= end);
    }

    // 3. Month/Year Filter (format: YYYY-MM)
    let matchesMonth = true;
    if (selectedMonth) {
      const enqMonthStr = ${enqDate.getFullYear()}-;
      matchesMonth = (enqMonthStr === selectedMonth);
    }

    return matchesSearch && matchesDateRange && matchesMonth;
  });

  // PDF Export
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add Title
    doc.setFontSize(16);
    doc.text(activeTab === 'packages' ? 'Package Enquiries Report' : 'Contact Us Enquiries Report', 14, 15);
    doc.setFontSize(10);
    doc.text(Generated on:  + new Date().toLocaleDateString(), 14, 22);

    // Table Data
    const tableColumn = ["Date", "Name", "Email", "Phone", "Destination", "Package", "Travel Date", "Pax", "Message"];
    const tableRows = [];

    filteredEnquiries.forEach(enq => {
      const rowData = [
        formatDate(enq.createdAt),
        enq.name || '-',
        enq.email || '-',
        enq.phone || '-',
        enq.destination || '-',
        enq.tripTitle || '-',
        enq.date || '-',
        enq.travellers ? String(enq.travellers) : '-',
        enq.message || '-'
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(Enquiries_Report_ + new Date().getTime() + .pdf);
  };

  // CSV Export
  const handleDownloadExcel = () => {
    const headers = ["Date", "Name", "Email", "Phone", "Destination", "Package", "Travel Date", "Pax", "Message"];
    const csvRows = [];
    csvRows.push(headers.join(','));

    filteredEnquiries.forEach(enq => {
      const rowData = [
        formatDate(enq.createdAt),
        enq.name || '-',
        enq.email || '-',
        enq.phone ? \t + enq.phone : '-',
        enq.destination || '-',
        enq.tripTitle || '-',
        enq.date ? \t + enq.date : '-',
        enq.travellers ? String(enq.travellers) : '-',
        enq.message ? enq.message.replace(/"/g, '""') : '-'
      ];
      csvRows.push(rowData.map(item => " + item + ").join(','));
    });

    const csvData = new Blob(['\ufeff' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const csvUrl = URL.createObjectURL(csvData);
    const hiddenElement = document.createElement('a');
    hiddenElement.href = csvUrl;
    hiddenElement.target = '_blank';
    hiddenElement.download = Enquiries_Report_ + new Date().getTime() + .csv;
    hiddenElement.click();
  };

  if (loading) return <div>Loading enquiries...</div>;

  return (
    <div className={styles.adminPage}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className={styles.pageTitle} style={{ margin: 0 }}>Manage Enquiries (Leads)</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
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

      {/* TABS FOR ENQUIRY TYPES */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0' }}>
        <button 
          onClick={() => setActiveTab('packages')}
          style={{ padding: '10px 20px', border: 'none', background: 'none', borderBottom: activeTab === 'packages' ? '3px solid #3b82f6' : 'none', color: activeTab === 'packages' ? '#3b82f6' : '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '1rem', marginBottom: '-2px' }}
        >
          Package Enquiries
        </button>
        <button 
          onClick={() => setActiveTab('contact')}
          style={{ padding: '10px 20px', border: 'none', background: 'none', borderBottom: activeTab === 'contact' ? '3px solid #3b82f6' : 'none', color: activeTab === 'contact' ? '#3b82f6' : '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '1rem', marginBottom: '-2px' }}
        >
          Contact Us Messages
        </button>
      </div>

      {/* Filters Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        
        {/* Search */}
        <div style={{ flex: '1 1 250px', display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px' }}>
          <FiSearch color="#64748b" />
          <input 
            type="text" 
            placeholder="Search name, phone, trip..." 
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
              // Clear date range if month is selected to avoid confusion
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
              if(e.target.value) setSelectedMonth(''); // Clear month if specific date is used
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
      
      {filteredEnquiries.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
          No {activeTab === 'packages' ? 'package enquiries' : 'contact us messages'} found.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Date</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Name</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Phone</th>
                {activeTab === 'packages' && <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Destination</th>}
                {activeTab === 'packages' && <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Package</th>}
                {activeTab === 'packages' && <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Travel Date</th>}
                {activeTab === 'packages' && <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Pax</th>}
                <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Message</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnquiries.map((enq) => (
                <tr key={enq._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px' }}>{formatDate(enq.createdAt)}</td>
                  <td style={{ padding: '12px', fontWeight: '600' }}>{enq.name}<br/><small>{enq.email}</small></td>
                  <td style={{ padding: '12px' }}>{enq.phone}</td>
                  
                  {activeTab === 'packages' && (
                    <>
                      <td style={{ padding: '12px' }}>{enq.destination || '-'}</td>
                      <td style={{ padding: '12px' }}>
                          {enq.tripTitle?.includes(' (') ? (
                            <>
                              <div style={{fontWeight: 600, color: '#0f172a'}}>{enq.tripTitle.split(' (')[0]}</div>
                              <div style={{fontSize: '0.85em', color: '#64748b'}}>{enq.tripTitle.split(' (')[1].replace(')', '')}</div>
                            </>
                          ) : (
                            enq.tripTitle
                          )}
                        </td>
                      <td style={{ padding: '12px' }}>{enq.date || '-'}</td>
                      <td style={{ padding: '12px' }}>{enq.travellers || '-'}</td>
                    </>
                  )}

                  <td style={{ padding: '12px', maxWidth: activeTab === 'contact' ? '400px' : '200px' }}>{enq.message}</td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => handleDelete(enq._id)} className={styles.btnDanger} style={{ padding: '6px' }}>
                      <FiTrash2 />
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

export default ManageEnquiries;
