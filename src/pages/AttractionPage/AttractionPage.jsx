import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import TrendingCard from '../../components/TrendingSection/TrendingCard';
import CreatorFaqs from '../CreatorTripDetails/components/CreatorFaqs';
import Footer from '../../components/Footer/Footer';
import styles from './AttractionPage.module.css';
import { getAttractionBySlug, getTrips } from '../../services/api';

const AttractionPage = () => {
  const { slug } = useParams();
  const [attraction, setAttraction] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: attrData } = await getAttractionBySlug(slug);
        setAttraction(attrData);
        
        const { data: tripsData } = await getTrips();
        setTrips(tripsData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading attraction...</div>;
  if (!attraction) return <div style={{ padding: '100px', textAlign: 'center' }}>Attraction not found.</div>;

  const title = attraction.title;
  const tourPackages = attraction.relatedTrips && attraction.relatedTrips.length > 0 
    ? trips.filter(trip => attraction.relatedTrips.includes(trip._id || trip.id))
    : [];
  
  const faqs = attraction.faqs && attraction.faqs.length > 0 ? attraction.faqs : [];

  const formatArrayToMarkdownList = (arr) => {
    if (!arr || arr.length === 0 || (arr.length === 1 && !arr[0].title)) return null;
    return arr.map(item => `- **${item.title}**: ${item.desc}`).join('\n');
  };

  const contentSections = [
    {
      title: "Overview",
      content: attraction.overview
    },
    {
      title: `Places to Visit Near ${title}`,
      content: formatArrayToMarkdownList(attraction.placesToVisitAround)
    },
    {
      title: `Things to Do at ${title}`,
      content: formatArrayToMarkdownList(attraction.thingsToDo)
    },
    {
      title: `Must-Try Food Dishes`,
      content: formatArrayToMarkdownList(attraction.mustTryFood)
    },
    {
      title: `Culture and Nature`,
      content: attraction.cultureAndNature
    },
    {
      title: `Local Attractions`,
      content: formatArrayToMarkdownList(attraction.localAttractions)
    },
    {
      title: `Shopping & Sightseeing`,
      content: formatArrayToMarkdownList(attraction.shoppingSightseeing)
    },
    {
      title: `Best Time to Visit ${title}`,
      content: attraction.bestTimeToVisit
    }
  ].filter(sec => sec.content && sec.content.trim() !== '');

  const renderContent = (text) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('- ')) {
        const itemText = line.substring(2);
        const parts = itemText.split('**');
        if (parts.length > 2) {
          return <li key={idx}><strong>{parts[1]}</strong>{parts[2]}</li>;
        }
        return <li key={idx}>{itemText}</li>;
      }
      return <p key={idx}>{line}</p>;
    });
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      {/* Hero Banner */}
      <div className={styles.heroBanner}>
        <img 
          src={attraction.image?.startsWith('http') ? attraction.image : `${import.meta.env.VITE_BACKEND_URL}${attraction.image}`} 
          alt={title} 
          className={styles.heroImg} 
        />
        <div className={styles.heroOverlay}>
          <h1 className={styles.heroTitle}>{title}</h1>
          <p className={styles.heroSubtitle}>Explore {attraction.destination}</p>
        </div>
      </div>

      <main className={styles.mainContainer}>
        
        {/* Content Sections */}
        <div className={styles.contentSections}>
          {contentSections.map((sec, index) => (
            <div key={index} className={styles.contentBlock}>
              <h3 className={styles.contentHeading}>
                <span className={styles.redBar}></span>
                {sec.title}
              </h3>
              <div className={styles.contentText}>
                {sec.content.includes('- ') ? <ul>{renderContent(sec.content)}</ul> : renderContent(sec.content)}
              </div>
            </div>
          ))}
        </div>

        {/* FAQs */}
        {faqs && faqs.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>FAQs</h2>
            <CreatorFaqs faqs={faqs} />
          </section>
        )}

        {/* Related Trips */}
        {tourPackages.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Plan Your {title} Trips</h2>
              <div className={styles.navButtons}>
                 <button className={styles.navBtn}>❮</button>
                 <button className={styles.navBtn}>❯</button>
              </div>
            </div>
            <div className={styles.tripsGrid}>
              {tourPackages.map(trip => (
                <TrendingCard key={trip._id || trip.id} trip={trip} />
              ))}
            </div>
          </section>
        )}



        {/* Why Choose Us */}
        <section className={styles.whyChooseSection}>
          <h2 className={styles.sectionTitle}>Why Choose DreamTrail?</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>⭐</div>
              <h4 className={styles.featureTitle}>Best Assistance</h4>
              <p className={styles.featureDesc}>Personalized support to make your trip hassle-free and enjoyable.</p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>💬</div>
              <h4 className={styles.featureTitle}>Happy Travellers</h4>
              <p className={styles.featureDesc}>Join thousands of satisfied explorers who trust us for their journeys.</p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>💖</div>
              <h4 className={styles.featureTitle}>Curated Trips</h4>
              <p className={styles.featureDesc}>Hand-picked itineraries that guarantee unforgettable experiences.</p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🛡️</div>
              <h4 className={styles.featureTitle}>24/7 Support</h4>
              <p className={styles.featureDesc}>We are always here to help you, anytime, anywhere during your trip.</p>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default AttractionPage;
