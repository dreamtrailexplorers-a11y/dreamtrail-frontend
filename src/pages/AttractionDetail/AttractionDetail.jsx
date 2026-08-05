import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { getAttractionBySlug } from '../../services/api';
import styles from './AttractionDetail.module.css';

const AttractionDetail = () => {
  const { slug } = useParams();
  const [attraction, setAttraction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttraction = async () => {
      try {
        const { data } = await getAttractionBySlug(slug);
        setAttraction(data);
      } catch (error) {
        console.error('Error fetching attraction:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttraction();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (!attraction) return <div>Attraction not found</div>;

  const renderSection = (title, items) => {
    if (!items || items.length === 0 || (items.length === 1 && !items[0].title)) return null;
    return (
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <ul className={styles.itemList}>
          {items.map((item, index) => (
            <li key={index}>
              <strong>{item.title}</strong>
              {item.desc && <span> : {item.desc}</span>}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderTextSection = (title, text) => {
    if (!text) return null;
    return (
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <p className={styles.text}>{text}</p>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <Navbar sticky={true} />
      
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <img src={attraction.image?.startsWith('http') ? attraction.image : `${import.meta.env.VITE_BACKEND_URL}${attraction.image}`} alt={attraction.title} className={styles.heroImage} />
        <div className={styles.heroOverlay}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{attraction.title}</h1>
            <div className={styles.breadcrumb}>
              <Link to="/">Home</Link> / <Link to={`/destination/${attraction.destination.toLowerCase()}`}>{attraction.destination}</Link> / <span>{attraction.title}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContainer}>
        {/* Content wrapper */}
        <div className={styles.contentWrapper}>
          
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Overview</h3>
            <p className={styles.text}>{attraction.overview}</p>
          </div>

          {renderSection('Places to Visit Around ' + attraction.title, attraction.placesToVisitAround)}
          {renderSection('Things to Do', attraction.thingsToDo)}
          {renderSection('Must-Try Food Dishes', attraction.mustTryFood)}
          
          {renderTextSection('Culture and Nature', attraction.cultureAndNature)}
          
          {renderSection('Local Attractions', attraction.localAttractions)}
          {renderSection('Shopping & Sightseeing', attraction.shoppingSightseeing)}
          
          {renderTextSection('Best Time to Visit', attraction.bestTimeToVisit)}
          
          {renderSection('Things to Take Care of While Traveling', attraction.thingsToTakeCare)}

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AttractionDetail;

