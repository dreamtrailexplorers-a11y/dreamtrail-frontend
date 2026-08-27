import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaQuoteLeft, FaWhatsapp } from 'react-icons/fa';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './MeetTheTeam.module.css';
import { getSiteSettings } from '../../services/api';

const MeetTheTeam = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSiteSettings();
        if (res.data && res.data.meetTheTeam) {
          setData(res.data.meetTheTeam);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) return <div className={styles.loadingContainer}><div className={styles.loader}></div></div>;
  if (!data) return <div className={styles.errorContainer}>Page data not found</div>;

  const rideMarshals = data.teamMembers?.filter(m => m.teamType === 'Ride Marshal' || m.teamType?.includes('Founder')) || [];
  const backOffice = data.teamMembers?.filter(m => m.teamType === 'Back Office') || [];
  
  const founder = rideMarshals.length > 0 ? rideMarshals[0] : null;
  const otherMarshals = rideMarshals.length > 1 ? rideMarshals.slice(1) : [];

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  // Robust Markdown Parser
  const renderText = (text) => {
    if (!text) return null;
    return text.split('\n').map((para, i) => {
      if (para.trim() === '') return null;
      
      // Headings
      let isHeading = false;
      let headingText = para;
      let headingLevel = 3;
      
      if (para.startsWith('### ')) {
        isHeading = true; headingLevel = 3; headingText = para.replace('### ', '');
      } else if (para.startsWith('#### ')) {
        isHeading = true; headingLevel = 4; headingText = para.replace('#### ', '');
      } else if (para.startsWith('## ')) {
        isHeading = true; headingLevel = 2; headingText = para.replace('## ', '');
      }
      
      // Bold text parser
      const renderInline = (str) => {
        const parts = str.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
          }
          return part;
        });
      };

      if (isHeading) {
        const HTag = `h${headingLevel}`;
        return <HTag key={i} className={styles.markdownHeading}>{renderInline(headingText)}</HTag>;
      }
      
      return <p key={i} className={styles.paragraphText}>{renderInline(para)}</p>;
    });
  };

  return (
    <>
      <Navbar />
      <div className={styles.pageWrapper}>
        
        {/* Hero Section */}
        <div className={styles.heroSection} style={!data.heroImage ? { backgroundImage: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' } : {}}>
          {data.heroImage && (
            <img 
              src={data.heroImage} 
              alt="Meet the Team Background" 
              className={styles.heroBackgroundImage} 
              referrerPolicy="no-referrer"
            />
          )}
          <div className={styles.heroOverlay}></div>
          <motion.div 
            className={styles.heroContent}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
          >
            {data.heroTitle && <h1 className={styles.heroTitle}>{data.heroTitle}</h1>}
            {data.heroSubtitle && <h2 className={styles.heroSubtitle}>{data.heroSubtitle}</h2>}
            {data.heroText && <p className={styles.heroDesc}>{data.heroText}</p>}
          </motion.div>
        </div>

        {founder && (
          <div className={styles.founderSectionContainer}>
            <div className={styles.founderContent}>
              
              <div className={styles.founderImageSide}>
                <div className={styles.founderImageWrapper}>
                  {founder.image && <img src={founder.image} alt={founder.name} className={styles.founderImage} referrerPolicy="no-referrer" />}
                  <div className={styles.founderOverlay}>
                    <h3 className={styles.founderName}>{founder.name}</h3>
                    <p className={styles.founderRole}>{founder.role}</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.founderTextSide}>
                <h1 className={styles.founderTitle}>Meet the Team<br/><span className={styles.redHighlight}>Dreamtrail Explorers</span></h1>
                <div className={styles.founderDesc}>
                  {renderText(founder.description)}
                </div>
              </div>

            </div>
          </div>
        )}

        <div className={styles.contentContainer}>
          
          {(data.quoteText && data.quoteText !== 'WHAT INSPIRED ME...') && (
            <motion.div 
              className={styles.quoteSection}
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUpVariant}
            >
              <div className={styles.quoteBox}>
                <h3 className={styles.quoteTitle}>WHAT INSPIRED HIM</h3>
                <FaQuoteLeft className={styles.quoteIcon} />
                <div className={styles.quoteText}>{renderText(data.quoteText)}</div>
              </div>
            </motion.div>
          )}

          {otherMarshals.length > 0 && (
            <div className={styles.sectionBlock}>
              <motion.div 
                className={styles.sectionHeader}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
              >
                <h2 className={styles.sectionHeading}>Meet the <span className={styles.redCursive}>Tour Managers</span></h2>
                <p className={styles.sectionSubheading}>The experienced leaders guiding your journey.</p>
              </motion.div>
              
              <motion.div 
                className={styles.marshalsList}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={staggerContainer}
              >
                {otherMarshals.map((marshal, idx) => {
                  const isReverse = idx % 2 !== 0;
                  return (
                    <motion.div 
                      key={idx} 
                      className={`${styles.marshalCard} ${isReverse ? styles.marshalCardReverse : ''}`}
                      variants={fadeUpVariant}
                    >
                      {marshal.image && (
                        <div className={styles.marshalImageWrapper}>
                          <img src={marshal.image} alt={marshal.name} className={styles.marshalImage} referrerPolicy="no-referrer" />
                          {marshal.orderNumber && (
                            <div className={styles.watermarkNumber}>{marshal.orderNumber}</div>
                          )}
                        </div>
                      )}
                      
                      <div className={styles.marshalInfo}>
                        <div className={styles.marshalHeader}>
                          <h3 className={styles.marshalName}>
                            {marshal.name.split(' ')[0]} <span className={styles.redCursive}>{marshal.name.split(' ').slice(1).join(' ')}</span>
                          </h3>
                          <div className={styles.nameUnderline}></div>
                          {marshal.role && <span className={styles.marshalRole}>{marshal.role}</span>}
                        </div>
                        {marshal.description && (
                          <div className={styles.marshalDesc}>
                            {renderText(marshal.description)}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ); 
                })}
              </motion.div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};
export default MeetTheTeam;
