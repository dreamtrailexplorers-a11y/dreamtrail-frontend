import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import CategoryMenu from '../../components/CategoryMenu/CategoryMenu';
import Hero from '../../components/Hero/Hero';
import TrendingSection from '../../components/TrendingSection/TrendingSection';
import Banner from '../../components/Banner/Banner';
import DestinationSlider from '../../components/DestinationSlider/DestinationSlider';
import GroupTripBanner from '../../components/GroupTripBanner/GroupTripBanner';
import BlogSection from '../../components/BlogSection/BlogSection';
import ReviewSection from '../../components/ReviewSection/ReviewSection';
import Footer from '../../components/Footer/Footer';

import { getDestinations } from '../../services/api';

import styles from './Home.module.css';

const Home = () => {
  const [internationalDestinations, setInternationalDestinations] = useState([]);
  const [domesticDestinations, setDomesticDestinations] = useState([]);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const { data: intl } = await getDestinations('international');
        setInternationalDestinations(intl);
        
        const { data: dom } = await getDestinations('domestic');
        setDomesticDestinations(dom);
      } catch (error) {
        console.error('Failed to fetch destinations:', error);
      }
    };
    fetchDestinations();
  }, []);

  return (
    <div className={styles.homeWrapper}>
      {/* 1. Navbar */}
      <Navbar />

      <main className={styles.mainContent}>
        {/* 2. Category Icons Row */}
        <CategoryMenu />

        {/* 3. Hero Banner */}
        <Hero />

        {/* 4. Trending Section */}
        <TrendingSection />

        {/* 5. Promotional Banner */}
        <Banner />

        {/* 6. International Destinations */}
        {internationalDestinations.length > 0 && (
          <DestinationSlider
            title="International Destinations"
            destinations={internationalDestinations}
          />
        )}

        {/* 7. Domestic Destinations */}
        {domesticDestinations.length > 0 && (
          <DestinationSlider
            title="Domestic Destinations"
            destinations={domesticDestinations}
          />
        )}

        {/* 8. Group Trips Banner */}
        <GroupTripBanner />

        {/* 9. Blogs & Travel Tips */}
        <BlogSection />

        {/* 10. Customer Reviews */}
        <ReviewSection />
      </main>

      {/* 11. Footer */}
      <Footer />
    </div>
  );
};

export default Home;
