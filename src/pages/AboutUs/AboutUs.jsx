import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './AboutUs.module.css';
import { FiCheck, FiChevronDown } from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Footer from '../../components/Footer/Footer';

const AboutUs = () => {
  const [siteSettings, setSiteSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openAccordionId, setOpenAccordionId] = useState(null);
  const [selectedIntro, setSelectedIntro] = useState(null);

  const toggleAccordion = (index) => {
    setOpenAccordionId(openAccordionId === index ? null : index);
  };

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

  
  const renderFormattedText = (text, customPClass = styles.manifestoParagraph) => {
    if (!text) return null;
    
    // First, try to fix missing newlines before ## if user forgot them
    let cleanText = text.replace(/([^\n])(##+ )/g, '$1\n\n$2');
    
    // Split by newlines
    const paragraphs = cleanText.split(/\n+/);
    
    return paragraphs.map((para, i) => {
      para = para.trim();
      if (!para) return null;
      
      if (para.startsWith('## ')) {
        return <h3 key={i} className={styles.manifestoHeading}>{para.replace('## ', '')}</h3>;
      }
      if (para.startsWith('### ')) {
        return <h4 key={i} className={styles.manifestoSubheading}>{para.replace('### ', '')}</h4>;
      }
      
      // Parse bold **text**
      const parts = para.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className={customPClass}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
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

      {/* 2.5 Extra Intros Deep Dive Section */}
      {aboutPage.extraIntros && aboutPage.extraIntros.length > 0 && (
        <section className={styles.deepDiveSection}>
          <div className={styles.deepDiveContainer}>
              <div className={styles.deepDiveHeader}>
                <h2 className={styles.deepDiveTitle}>{aboutPage.extraIntrosTitle || 'Discover More'}</h2>
                <p className={styles.deepDiveSubtitle}>{aboutPage.extraIntrosSubtitle || 'Delve deeper into our vision, philosophy, and the journey that brought us here.'}</p>
              </div>
            <div className="about-swiper-container" style={{ padding: '20px 0 40px 0' }}>
                <Swiper
                  modules={[Navigation, Pagination]}
                  spaceBetween={30}
                  slidesPerView={1}
                  navigation
                  pagination={{ clickable: true }}
                  breakpoints={{
                    640: { slidesPerView: 1 },
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                  }}
                  style={{ paddingBottom: '40px' }}
                >
                  {aboutPage.extraIntros.map((intro, idx) => (
                    <SwiperSlide key={idx} style={{ height: 'auto' }}>
                      <div className={styles.deepDiveCard} onClick={() => setSelectedIntro(intro)}>
                        {intro.title && <h3 className={styles.cardTitle}>{intro.title}</h3>}
                        {intro.text && (
                          <>
                            <p className={`${styles.cardText} ${styles.truncatedText}`}>{intro.text}</p>
                            <span className={styles.readMoreBtn}>Read More &rarr;</span>
                          </>
                        )}
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </section>
      )}

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
              {renderFormattedText(aboutPage.storyText, styles.storyText)}
            </div>
        </div>
      </section>

      {/* 4. Community Section */}
      <section className={styles.communitySection}>
        
          <div className={styles.manifestoContainer}>
            <h2 className={styles.manifestoTitle}>{aboutPage.communityTitle || 'Join the Passionate Rider Community'}</h2>
            {renderFormattedText(aboutPage.communityText)}
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
                    <div 
                      key={index} 
                      className={`${styles.whyChooseUsItem} ${openAccordionId === index ? styles.accordionOpen : ''}`}
                    >
                      <div className={styles.accordionHeader} onClick={() => toggleAccordion(index)}>
                        <div className={styles.whyChooseUsIcon}>
                          <FiChevronDown strokeWidth={3} className={styles.accordionIcon} />
                        </div>
                        <h3 className={styles.accordionTitle}>{point.title || 'Point ' + (index + 1)}</h3>
                      </div>
                      <div className={styles.accordionContent}>
                        <p className={styles.whyChooseUsText}>{point.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </section>
      )}

      {/* Modal for Discover More */}
      {selectedIntro && (
        <div className={styles.modalOverlay} onClick={() => setSelectedIntro(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalCloseBtn} onClick={() => setSelectedIntro(null)}>&times;</button>
            {selectedIntro.title && <h3 className={styles.modalTitle}>{selectedIntro.title}</h3>}
            {selectedIntro.text && <p className={styles.modalText}>{selectedIntro.text}</p>}
          </div>
        </div>
      )}

    </div>
    <Footer />
    </>
  );
};

export default AboutUs;
