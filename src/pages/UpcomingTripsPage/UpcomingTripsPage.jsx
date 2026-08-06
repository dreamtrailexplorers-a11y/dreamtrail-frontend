import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import TrendingCard from '../../components/TrendingSection/TrendingCard';
import { getTrips } from '../../services/api';
import styles from './UpcomingTripsPage.module.css';

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december"
];

const UpcomingTripsPage = () => {
  const { month } = useParams();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTrips = async () => {
      try {
        const { data } = await getTrips();
        setTrips(data);
      } catch (error) {
        console.error('Failed to fetch trips:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [month]);

  const selectedMonthIndex = MONTHS.indexOf(month?.toLowerCase());

  const filteredTrips = useMemo(() => {
    if (selectedMonthIndex === -1) return [];

    return trips.filter(trip => {
      if (!trip.departureDates || trip.departureDates.length === 0) return false;
      
      return trip.departureDates.some(dateObj => {
        if (!dateObj.start) return false;
        const startDate = new Date(dateObj.start);
        return startDate.getMonth() === selectedMonthIndex;
      });
    });
  }, [trips, selectedMonthIndex]);

  const displayMonth = month ? month.charAt(0).toUpperCase() + month.slice(1) : '';

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <div className={styles.contentContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Upcoming Community Trips in {displayMonth}</h1>
        </div>

        {loading ? (
          <div className={styles.loadingMessage}>Loading trips...</div>
        ) : selectedMonthIndex === -1 ? (
          <div className={styles.errorMessage}>Invalid month selected.</div>
        ) : filteredTrips.length > 0 ? (
          <div className={styles.gridContainer}>
            {filteredTrips.map((trip) => (
              <TrendingCard key={trip._id || trip.id} trip={trip} basePath="/tours" />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3>No trips scheduled for {displayMonth} yet.</h3>
            <p>Check back later or browse our other amazing packages!</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default UpcomingTripsPage;
