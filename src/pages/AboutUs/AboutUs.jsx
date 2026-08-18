import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './AboutUs.module.css';
import { FiCheck, FiChevronDown, FiCompass, FiAward, FiShield } from 'react-icons/fi';
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
  const [expandedStory, setExpandedStory] = useState(false);

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

  const renderFormattedText = (text, customPClass = styles.manifestoParagraph, limit = false) => {
    if (!text) return null;
    
    let cleanText = text.replace(/([^\n])(##+ )/g, '$1\n\n$2');
    let paragraphs = cleanText.split(/\n+/).map(p => p.trim()).filter(Boolean);
    
    if (limit && !expandedStory && paragraphs.length > 2) {
      paragraphs = paragraphs.slice(0, 2);
    }
    
    return paragraphs.map((para, i) => {
      if (para.startsWith('## ')) return <h3 key={i} className={styles.manifestoHeading}>{para.replace('## ', '')}</h3>;
      if (para.startsWith('### ')) return <h4 key={i} className={styles.manifestoSubheading}>{para.replace('### ', '')}</h4>;
      
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

  const hasLongStory = aboutPage.storyText && aboutPage.storyText.split(/\n+/).filter(Boolean).length > 2;

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
            <h1 className={styles.heroTitle}>{aboutPage.heroTitle || 'JOURNEY BEYOND ORDINARY. EXPLORE THE HIMALAYAS WITH US.'}</h1>
            <p className={styles.heroSubtitle}>{aboutPage.heroSubtitle || 'Discover our story, values, and passion for unforgettable adventures.'}</p>
          </div>
        </section>

        {/* 2. Stats Bar */}
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <h3 className={styles.statNumber}>500+</h3>
            <p className={styles.statLabel}>RIDERS</p>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <h3 className={styles.statNumber}>15+</h3>
            <p className={styles.statLabel}>DESTINATIONS</p>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <h3 className={styles.statNumber}>10+</h3>
            <p className={styles.statLabel}>YEARS</p>
          </div>
        </div>

        {/* 3. Intro Section with Asymmetric Collage */}
        <section className={styles.introSection}>
          <div className={styles.introLeft}>
            <h2 className={styles.sectionTitle}>{aboutPage.introTitle1 || 'Crafting Extraordinary Experiences.'}</h2>
            <div className={styles.introTextWrapper}>
              <p className={styles.sectionText}>
                {aboutPage.introText1 && aboutPage.introText1.length > 200 
                  ? `${aboutPage.introText1.substring(0, 200)}... ` 
                  : aboutPage.introText1}
                {aboutPage.introText1 && aboutPage.introText1.length > 200 && (
                  <button className={styles.readMoreBtnInline} onClick={() => setSelectedIntro({ title: aboutPage.introTitle1, text: aboutPage.introText1 })}>
                    Read More
                  </button>
                )}
              </p>
              
              <h3 className={styles.sectionSubtitle}>{aboutPage.introTitle2 || 'Expanding Horizon'}</h3>
              <p className={styles.sectionText}>
                {aboutPage.introText2 && aboutPage.introText2.length > 200 
                  ? `${aboutPage.introText2.substring(0, 200)}... ` 
                  : aboutPage.introText2}
                {aboutPage.introText2 && aboutPage.introText2.length > 200 && (
                  <button className={styles.readMoreBtnInline} onClick={() => setSelectedIntro({ title: aboutPage.introTitle2, text: aboutPage.introText2 })}>
                    Read More
                  </button>
                )}
              </p>
            </div>
          </div>
          
          <div className={styles.introRight}>
            <div className={styles.asymmetricCollage}>
              {aboutPage.introImages && aboutPage.introImages.length >= 4 ? (
                <>
                  <img src={aboutPage.introImages[0]} alt="Collage 1" className={styles.collageImg1} onError={(e) => handleImageError(e)} />
                  <img src={aboutPage.introImages[1]} alt="Collage 2" className={styles.collageImg2} onError={(e) => handleImageError(e)} />
                  <img src={aboutPage.introImages[2]} alt="Collage 3" className={styles.collageImg3} onError={(e) => handleImageError(e)} />
                  <img src={aboutPage.introImages[3]} alt="Collage 4" className={styles.collageImg4} onError={(e) => handleImageError(e)} />
                </>
              ) : (
                <>
                  <img src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc" alt="Fallback 1" className={styles.collageImg1} />
                  <img src="https://images.unsplash.com/photo-1568772585407-9361fa3bd7a0" alt="Fallback 2" className={styles.collageImg2} />
                  <img src="https://images.unsplash.com/photo-1541818222452-f4726e6e2e50" alt="Fallback 3" className={styles.collageImg3} />
                  <img src="https://images.unsplash.com/photo-1518175510-1845eb522856" alt="Fallback 4" className={styles.collageImg4} />
                </>
              )}
            </div>
          </div>
        </section>

        {/* 4. Our Story Section (Dark) */}
        <section className={styles.storySectionDark}>
          <div className={styles.storyContainerDark}>
            <div className={styles.storyImageBlockDark}>
              <img 
                src={aboutPage.storyImage || 'https://images.unsplash.com/photo-1533560904424-a0c61dc306fc'} 
                alt="Our Story" 
                onError={(e) => handleImageError(e, 'https://images.unsplash.com/photo-1533560904424-a0c61dc306fc')}
              />
            </div>
            <div className={styles.storyTextBlockDark}>
              <h2 className={styles.storyTitleDark}>{aboutPage.storyTitle || 'Our Story'}</h2>
              <div className={styles.storyContentDark}>
                {renderFormattedText(aboutPage.storyText, styles.storyTextDark, true)}
                {hasLongStory && (
                  <button className={styles.readMoreStoryBtn} onClick={() => setExpandedStory(!expandedStory)}>
                    {expandedStory ? 'Read Less' : 'Read Full Story'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 5. Why Choose Us Section (Accordion) */}
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

        {/* 6. Community Section */}
        <section className={styles.communitySection}>
          <div className={styles.manifestoContainer}>
            <h2 className={styles.manifestoTitle}>{aboutPage.communityTitle || 'Join the Passionate Rider Community'}</h2>
            <div className={styles.communityTextSummary}>
              {renderFormattedText(aboutPage.communityText)}
            </div>
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

        {/* 7. Extra Intros (Deep Dive) */}
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

        {/* Modal for Discover More & Read More texts */}
        {selectedIntro && (
          <div className={styles.modalOverlay} onClick={() => setSelectedIntro(null)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <button className={styles.modalCloseBtn} onClick={() => setSelectedIntro(null)}>&times;</button>
              {selectedIntro.title && <h3 className={styles.modalTitle}>{selectedIntro.title}</h3>}
              {selectedIntro.text && (
                <div className={styles.modalText}>
                  {selectedIntro.text.split('\n').map((line, i) => (
                    <p key={i} style={{ marginBottom: '10px' }}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
      <Footer />
    </>
  );
};

export default AboutUs;
