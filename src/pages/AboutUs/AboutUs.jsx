import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './AboutUs.module.css';
import { FiCheck, FiChevronDown } from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

const AboutUs = () => {
  const [siteSettings, setSiteSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/settings`);
        setSiteSettings(response.data);
      } catch (err) {
        console.error('Failed to fetch site settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSiteSettings();
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>;
  }

  const aboutPage = siteSettings?.aboutPage || {};

  const handleImageError = (e, fallbackSrc) => {
    e.target.onerror = null;
    e.target.src = fallbackSrc || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc';
  };

  return (
    <>
      <Navbar />
      <div className={styles.aboutUsContainer}>
      {/* 1. Hero Section */}
      <section 
        className={styles.heroSection} 
        style={aboutPage.heroImage ? { backgroundImage: `url(${aboutPage.heroImage})` } : {}}
      >
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{aboutPage.heroTitle || 'Where Your Riding Dreams Begin'}</h1>
          <p className={styles.heroSubtitle}>{aboutPage.heroSubtitle || 'Designed by Riders, for Riders'}</p>
        </div>
      </section>

      {/* 2. Intro Section with Collage */}
      <section className={styles.introSection}>
        <div className={styles.introLeft}>
          <h2 className={styles.sectionTitle}>{aboutPage.introTitle1 || 'Explore the Unexplored'}</h2>
          <p className={styles.sectionText}>{aboutPage.introText1}</p>
          
          <h2 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>{aboutPage.introTitle2 || 'Expanding Horizon'}</h2>
          <p className={styles.sectionText}>{aboutPage.introText2}</p>
          
          {(aboutPage.extraIntros || []).map((intro, idx) => (
             <React.Fragment key={idx}>
               {intro.title && <h2 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>{intro.title}</h2>}
               {intro.text && <p className={styles.sectionText}>{intro.text}</p>}
             </React.Fragment>
          ))}
        </div>
        
        <div className={styles.introRight}>
          <div className={styles.collageGrid}>
            {(aboutPage.introImages && aboutPage.introImages.length > 0) ? (
              aboutPage.introImages.slice(0, 4).map((img, idx) => (
                <div key={idx} className={styles.collageItem}>
                  <img 
                    src={img} 
                    alt={`Collage ${idx}`} 
                    loading="lazy" 
                    onError={(e) => handleImageError(e, 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc')}
                  />
                </div>
              ))
            ) : (
              // Fallback placeholder images
              <>
                <div className={styles.collageItem}><img src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc" alt="" /></div>
                <div className={styles.collageItem}><img src="https://images.unsplash.com/photo-1568772585407-9361fa3bd7a0" alt="" /></div>
                <div className={styles.collageItem}><img src="https://images.unsplash.com/photo-1541818222452-f4726e6e2e50" alt="" /></div>
                <div className={styles.collageItem}><img src="https://images.unsplash.com/photo-1518175510-1845eb522856" alt="" /></div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 3. Our Story Section */}
      <section className={styles.storySection}>
        <div className={styles.storyContainer}>
          <div className={styles.storyImageBlock}>
            <img 
              src={aboutPage.storyImage || 'https://images.unsplash.com/photo-1533560904424-a0c61dc306fc'} 
              alt="Our Story" 
              onError={(e) => handleImageError(e, 'https://images.unsplash.com/photo-1533560904424-a0c61dc306fc')}
            />
          </div>
          <div className={styles.storyTextBlock}>
            <h2 className={styles.storyTitle}>{aboutPage.storyTitle || 'Our Story'}</h2>
            <p className={styles.storyText}>{aboutPage.storyText}</p>
          </div>
        </div>
      </section>

      {/* 4. Community Section */}
      <section className={styles.communitySection}>
        <div className={styles.communityHeader}>
          <h2 className={styles.communityTitle}>{aboutPage.communityTitle || 'Join the Passionate Rider Community'}</h2>
          <p className={styles.communityText}>{aboutPage.communityText}</p>
        </div>
        
        <div className={styles.featuresGrid}>
          {(aboutPage.communityPoints || []).map((point, index) => (
            <div key={index} className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FiCheck />
              </div>
              <span className={styles.featureText}>{point.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Why Choose Us Section */}
      {(aboutPage.whyChooseUsTitle || (aboutPage.whyChooseUsPoints && aboutPage.whyChooseUsPoints.length > 0)) && (
        <section className={styles.whyChooseUsSection}>
          <div className={styles.whyChooseUsContainer}>
            {aboutPage.whyChooseUsTitle && (
              <div className={styles.whyChooseUsHeader}>
                <h2 className={styles.whyChooseUsTitle}>{aboutPage.whyChooseUsTitle}</h2>
              </div>
            )}
            
            {aboutPage.whyChooseUsPoints && aboutPage.whyChooseUsPoints.length > 0 && (
              <div className={styles.whyChooseUsList}>
                {aboutPage.whyChooseUsPoints.map((point, index) => (
                  <div key={index} className={styles.whyChooseUsItem}>
                    <div className={styles.whyChooseUsIcon}>
                      <FiChevronDown strokeWidth={3} />
                    </div>
                    <span className={styles.whyChooseUsText}>{point.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

    </div>
    <Footer />
    </>
  );
};

export default AboutUs;
