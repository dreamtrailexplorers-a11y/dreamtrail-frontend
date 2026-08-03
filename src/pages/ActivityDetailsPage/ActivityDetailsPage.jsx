import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import CheckAvailabilityModal from './components/CheckAvailabilityModal';
import styles from './ActivityDetailsPage.module.css';

const ActivityDetailsPage = () => {
  const { slug } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Format title from slug
  const formatTitle = (s) => {
    if (!s) return 'Alcazar Cabaret Show';
    return s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  const title = formatTitle(slug);

  // Mock data for Similar Activities
  const similarActivities = [
    { title: "ATV Ride in Thailand", price: "7,999", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=400&q=80" },
    { title: "Bangkok City Tour", price: "4,600", image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=400&q=80" },
    { title: "Coral Island Tour with Lunch", price: "2,300", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80" },
    { title: "Ang Thong National Marine Park", price: "4,100", image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=400&q=80" }
  ];

  // Mock data for Similar Attractions
  const similarAttractions = [
    { title: "Bangkok", image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=400&q=80" },
    { title: "Big Buddha", image: "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=400&q=80" },
    { title: "Chicken Island", image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=400&q=80" },
    { title: "Chinatown Bangkok", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80" }
  ];

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        
        {/* Photo Grid */}
        <div className={styles.photoGrid}>
          <div className={styles.mainPhoto}>
            <img src="https://images.unsplash.com/photo-1518991669955-9c7e78ec80ca?auto=format&fit=crop&w=800&q=80" alt={title} />
          </div>
          <div className={styles.smallPhotos}>
            <img src="https://images.unsplash.com/photo-1470229722913-7c092db62220?auto=format&fit=crop&w=400&q=80" alt="Activity 2" />
            <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80" alt="Activity 3" />
            <img src="https://images.unsplash.com/photo-1469598614039-ccfeb0a21111?auto=format&fit=crop&w=400&q=80" alt="Activity 4" />
            <img src="https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=400&q=80" alt="Activity 5" />
          </div>
        </div>

        <div className={styles.twoColumnLayout}>
          
          {/* Left Column */}
          <div className={styles.leftColumn}>
            
            {/* Header Card */}
            <div className={styles.card}>
              <div className={styles.headerTopRow}>
                <div>
                  <h1 className={styles.activityTitle}>{title}</h1>
                  <div className={styles.pillsRow}>
                    <span className={styles.infoPill}>1 hour 30 minutes</span>
                    <span className={styles.infoPill}>Pattaya, Thailand</span>
                  </div>
                </div>
                <button className={styles.shareBtn}>➤ Share</button>
              </div>

              <div className={styles.featuresList}>
                <div className={styles.featureItem}>
                  <div className={styles.featureIconBox}>🎟️</div>
                  <div>
                    <h5 className={styles.featureTitleActive}>Closed Today ❯</h5>
                    <p className={styles.featureDesc}>Will open tomorrow from 05:00 PM - 11:00 PM</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIconBox}>📱</div>
                  <div>
                    <h5 className={styles.featureTitle}>Mobile Ticket</h5>
                    <p className={styles.featureDesc}>Get tickets delivered to your inbox</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIconBox}>🧭</div>
                  <div>
                    <h5 className={styles.featureTitle}>Explore at Your Own Pace</h5>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours Card */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Operating Hours</h3>
              <div className={styles.operatingStatusBox}>
                <span className={styles.openStatus}>● Open Today</span> • Wednesday, 29 Jul 2026
              </div>
              <div className={styles.daysRow}>
                <span className={styles.dayPillActive}>SUN</span>
                <span className={styles.dayPill}>MON</span>
                <span className={styles.dayPill}>TUE</span>
                <span className={styles.dayPill}>WED</span>
                <span className={styles.dayPill}>THU</span>
                <span className={styles.dayPill}>FRI</span>
                <span className={styles.dayPill}>SAT</span>
              </div>
              <p className={styles.timingsText}>Timings: <strong>05:00 PM to 11:00 PM</strong></p>
            </div>
            
          </div>

          {/* Right Column (Sticky Pricing) */}
          <div className={styles.rightColumn}>
            <div className={styles.pricingCard}>
              <div className={styles.pricingHeader}>
                <span className={styles.saleTag}>❖ New Year Sale</span>
                <span className={styles.saveTag}>⭐ Save ₹ 370</span>
              </div>
              <div className={styles.pricingBody}>
                <div className={styles.priceRow}>
                  <span className={styles.startingFrom}>Starting from</span>
                  <div className={styles.priceDetails}>
                    <span className={styles.currentPrice}>₹ 1,460</span>
                    <span className={styles.oldPrice}>₹ 1,830</span>
                    <span className={styles.perPerson}>per person</span>
                  </div>
                </div>
                <button className={styles.checkAvailabilityBtn} onClick={() => setIsModalOpen(true)}>Check Availability</button>
              </div>
            </div>
          </div>

        </div>

        {/* Similar Activities */}
        <div className={styles.card} style={{ marginTop: '2rem' }}>
          <h3 className={styles.cardTitle}>Similar <span className={styles.textRed}>Activities</span></h3>
          <div className={styles.scrollGrid}>
            {similarActivities.map((act, idx) => (
              <div key={idx} className={styles.scrollCard}>
                <img src={act.image} alt={act.title} className={styles.scrollImg} />
                <div className={styles.scrollInfo}>
                  <h5 className={styles.scrollTitle}>{act.title}</h5>
                  <p className={styles.scrollSub}>From ₹{act.price}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.loadMoreWrapper}>
            <button className={styles.loadMoreBtn}>Load More</button>
          </div>
        </div>

        {/* Similar Attractions */}
        <div className={styles.card} style={{ marginTop: '2rem' }}>
          <h3 className={styles.cardTitle}>Similar <span className={styles.textRed}>Attractions</span></h3>
          <div className={styles.scrollGrid}>
            {similarAttractions.map((attr, idx) => (
              <div key={idx} className={styles.scrollCard}>
                <img src={attr.image} alt={attr.title} className={styles.scrollImg} />
                <div className={styles.scrollInfo}>
                  <h5 className={styles.scrollTitle}>{attr.title}</h5>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.loadMoreWrapper}>
            <button className={styles.loadMoreBtn}>Load More</button>
          </div>
        </div>

      </main>



      <Footer />

      <CheckAvailabilityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        activityTitle={title}
        activityLocation="Pattaya, Thailand"
        image="https://images.unsplash.com/photo-1518991669955-9c7e78ec80ca?auto=format&fit=crop&w=800&q=80"
      />
    </div>
  );
};

export default ActivityDetailsPage;
