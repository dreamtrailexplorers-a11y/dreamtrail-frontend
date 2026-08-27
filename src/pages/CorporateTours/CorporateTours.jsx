import React, { useState, useEffect } from 'react';
import { getSiteSettings } from '../../services/api';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Loader from '../../components/Loader/Loader';
import { FiCheckCircle, FiShield, FiSliders, FiUsers, FiCoffee, FiCamera, FiFileText } from 'react-icons/fi';
import styles from './CorporateTours.module.css';

const IconMap = {
  FiShield: <FiShield />,
  FiSliders: <FiSliders />,
  FiUsers: <FiUsers />,
  FiCoffee: <FiCoffee />,
  FiCamera: <FiCamera />,
  FiFileText: <FiFileText />
};

const CorporateTours = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getSiteSettings();
      setData(res.data.corporateTours);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen={true} />;
  if (!data) return <div>Failed to load data</div>;

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      
      {/* HERO SECTION */}
      <section className={styles.heroSection} style={{ backgroundImage: `url(${data.heroImage})` }}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{data.heroTitle}</h1>
          <h2 className={styles.heroSubtitle}>{data.heroSubtitle}</h2>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle} style={{ whiteSpace: 'pre-line' }}>{data.statsTitle}</h2>
          <p className={styles.sectionSubtitle}>{data.statsText}</p>
          <div className={styles.statsGrid}>
            {data.stats && data.stats.map((stat, idx) => (
              <div key={idx} className={styles.statCard}>
                <div className={styles.statNumber}>{stat.number}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className={styles.container}>
        <h2 className={styles.sectionTitle}>{data.featuresTitle}</h2>
        <p className={styles.sectionSubtitle}>{data.featuresText}</p>
        <div className={styles.featuresGrid}>
          {data.features && data.features.map((feature, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                {IconMap[feature.icon] || <FiCheckCircle />}
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureText}>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OFFERINGS SECTION */}
      <section className={styles.offeringsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{data.offeringsTitle}</h2>
          <p className={styles.sectionSubtitle}>{data.offeringsText}</p>
          <div className={styles.offeringsGrid}>
            {data.offerings && data.offerings.map((offering, idx) => (
              <div key={idx} className={styles.offeringCard}>
                <div className={styles.offeringBg} style={{ backgroundImage: `url(${offering.image})` }}></div>
                <div className={styles.offeringOverlay}></div>
                <div className={styles.offeringContent}>
                  <div className={styles.offeringTitle}>{offering.title}</div>
                  <div className={styles.offeringText}>{offering.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY & VIDEO SECTION */}
      <section className={styles.container}>
        <h2 className={styles.sectionTitle}>{data.galleryTitle}</h2>
        <p className={styles.sectionSubtitle}>{data.galleryText}</p>
        <div className={styles.galleryGrid} style={{ marginBottom: '60px' }}>
          {data.galleryImages && data.galleryImages.map((img, idx) => (
            <img key={idx} src={img} alt="Gallery" className={styles.galleryImage} />
          ))}
        </div>
        
        {data.videoUrl && (
          <div className={styles.videoContainer}>
            <iframe 
              src={data.videoUrl} 
              title="YouTube video player" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
        )}
      </section>

      {/* STEPS SECTION */}
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{data.stepsTitle}</h2>
          <p className={styles.sectionSubtitle}>{data.stepsText}</p>
          
          <div className={styles.stepsContainer}>
            <div className={styles.stepLine}></div>
            {data.steps && data.steps.map((step, idx) => (
              <div key={idx} className={styles.stepCard}>
                <div className={styles.stepNumber}>{idx + 1}</div>
                <h4 className={styles.stepTitle}>{step.title}</h4>
                <p className={styles.stepText}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CorporateTours;
