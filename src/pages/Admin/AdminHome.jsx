import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, {
  getDestinations,
  getTrips,
  getReviews,
  getBlogs,
  getCreatorTrips,
  getEnquiries,
  getAttractions
} from '../../services/api';
import styles from './Admin.module.css';

import { 
  FiMapPin, 
  FiBriefcase, 
  FiStar, 
  FiFileText, 
  FiCamera, 
  FiMessageCircle, 
  FiShoppingCart,
  FiImage
} from 'react-icons/fi';

const AdminHome = () => {
  const [rawData, setRawData] = useState({
    destinations: [],
    packages: [],
    reviews: [],
    blogs: [],
    creatorTrips: [],
    enquiries: [],
    bookings: [],
    attractions: []
  });

  const [counts, setCounts] = useState({
    destinations: 0,
    packages: 0,
    reviews: 0,
    blogs: 0,
    creatorTrips: 0,
    enquiries: 0,
    bookings: 0,
    attractions: 0
  });

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [monthYear, setMonthYear] = useState('');

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [
          destRes,
          tripRes,
          reviewRes,
          blogRes,
          creatorRes,
          enquiryRes,
          bookingRes,
          attractionsRes
        ] = await Promise.all([
          getDestinations(),
          getTrips(),
          getReviews(),
          getBlogs(),
          getCreatorTrips(),
          getEnquiries(),
          api.get('/bookings'),
          getAttractions()
        ]);

        setRawData({
          destinations: destRes.data,
          packages: tripRes.data,
          reviews: reviewRes.data,
          blogs: blogRes.data,
          creatorTrips: creatorRes.data,
          enquiries: enquiryRes.data,
          bookings: bookingRes.data,
          attractions: attractionsRes.data
        });
      } catch (err) {
        console.error('Error fetching dashboard counts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  useEffect(() => {
    let dests = rawData.destinations;
    let pkgs = rawData.packages;
    let revs = rawData.reviews;
    let blgs = rawData.blogs;
    let ctrips = rawData.creatorTrips;
    let enqs = rawData.enquiries;
    let bks = rawData.bookings;
    let attrs = rawData.attractions;

    const filterByDate = (items) => {
      if (!items) return [];
      return items.filter(item => {
        if (!item.createdAt) return true;
        const itemDate = new Date(item.createdAt);
        
        if (monthYear) {
          const [year, month] = monthYear.split('-');
          if (itemDate.getFullYear() !== parseInt(year) || itemDate.getMonth() + 1 !== parseInt(month)) {
            return false;
          }
        } else if (dateRange.start && dateRange.end) {
          const start = new Date(dateRange.start);
          start.setHours(0, 0, 0, 0);
          const end = new Date(dateRange.end);
          end.setHours(23, 59, 59, 999);
          if (itemDate < start || itemDate > end) return false;
        }
        return true;
      });
    };

    setCounts({
      destinations: filterByDate(dests).length,
      packages: filterByDate(pkgs).length,
      reviews: filterByDate(revs).length,
      blogs: filterByDate(blgs).length,
      creatorTrips: filterByDate(ctrips).length,
      enquiries: filterByDate(enqs).length,
      bookings: filterByDate(bks).length,
      attractions: filterByDate(attrs).length
    });
  }, [rawData, dateRange, monthYear]);

  const handleClearFilters = () => {
    setDateRange({ start: '', end: '' });
    setMonthYear('');
  };

  const cards = [
    { title: 'Destinations', count: counts.destinations, icon: <FiMapPin />, link: '/admin/destinations', color: '#3b82f6' },
    { title: 'Packages', count: counts.packages, icon: <FiBriefcase />, link: '/admin/all-packages', color: '#10b981' },
    { title: 'Attractions', count: counts.attractions, icon: <FiImage />, link: '/admin/attractions', color: '#f97316' },
    { title: 'Bookings', count: counts.bookings, icon: <FiShoppingCart />, link: '/admin/bookings', color: '#f59e0b' },
    { title: 'Enquiries', count: counts.enquiries, icon: <FiMessageCircle />, link: '/admin/enquiries', color: '#ef4444' },
    { title: 'Reviews', count: counts.reviews, icon: <FiStar />, link: '/admin/reviews', color: '#ec4899' },
    { title: 'Blogs', count: counts.blogs, icon: <FiFileText />, link: '/admin/blogs', color: '#06b6d4' }
  ];

  if (loading) {
    return <h2 className={styles.pageHeader}>Loading dashboard...</h2>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className={styles.pageHeader} style={{ margin: 0 }}>Dashboard Overview</h2>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Filter by Month</label>
            <input 
              type="month" 
              value={monthYear} 
              onChange={(e) => { setMonthYear(e.target.value); setDateRange({start:'', end:''}); }}
              style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }}
            />
          </div>
          <div style={{ color: '#94a3b8', paddingBottom: '8px' }}>OR</div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Custom Date Range</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="date" 
                value={dateRange.start} 
                onChange={(e) => { setDateRange({...dateRange, start: e.target.value}); setMonthYear(''); }}
                style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }}
              />
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center' }}>to</span>
              <input 
                type="date" 
                value={dateRange.end} 
                onChange={(e) => { setDateRange({...dateRange, end: e.target.value}); setMonthYear(''); }}
                style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }}
              />
            </div>
          </div>
          {(monthYear || (dateRange.start && dateRange.end)) && (
            <button 
              onClick={handleClearFilters}
              style={{ padding: '8px 12px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', color: '#475569' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '20px'
      }}>
        {cards.map((card, idx) => (
          <Link 
            to={card.link} 
            key={idx}
            style={{
              textDecoration: 'none',
              backgroundColor: '#fff',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              border: '1px solid #f1f5f9'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
            }}
          >
            <div style={{
              backgroundColor: `${card.color}15`,
              color: card.color,
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '24px',
              marginRight: '16px'
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', lineHeight: '1' }}>
                {card.count}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', marginTop: '6px', fontWeight: '500' }}>
                {card.title}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminHome;
