import React, { useState, useEffect } from 'react';
import { getSiteSettings } from '../../services/api';
import { FaWhatsapp, FaQuoteLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './MeetTheTeam.module.css';

const MeetTheTeam = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await getSiteSettings();
        if (response.data && response.data.meetTheTeam) {
          setData(response.data.meetTheTeam);
        }
      } catch (err) {
        console.error('Error fetching team data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamData();
  }, []);

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.loader}></div>
    </div>
  );
  
  if (!data) return (
    <>
      <Navbar />
      <div className={styles.errorContainer}>No data available. Please configure the Meet The Team page in the Admin Panel.</div>
      <Footer />
    </>
  );

  const rideMarshals = (data.teamMembers || []).filter(m => m.teamType === 'Ride Marshal');
  const backOffice = (data.teamMembers || []).filter(m => m.teamType === 'Back Office');

  // Animation variants
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {data.heroTitle && <div className={styles.heroBadge}>Our People</div>}
            {data.heroTitle && <h1 className={styles.heroTitle}>{data.heroTitle}</h1>}
            {data.heroSubtitle && <h2 className={styles.heroSubtitle}>{data.heroSubtitle}</h2>}
            {data.heroText && <p className={styles.heroDesc}>{data.heroText}</p>}
          </motion.div>
        </div>

        {/* Main Content Container */}
        <div className={styles.contentContainer}>
          
          {/* Quote Section */}
          {(data.quoteText && data.quoteText !== 'WHAT INSPIRED ME...') && (
            <motion.div 
              className={styles.quoteSection}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUpVariant}
            >
              <FaQuoteLeft className={styles.quoteIcon} />
              <p className={styles.quoteText}>{data.quoteText}</p>
            </motion.div>
          )}

          {/* Ride Marshals Section */}
          {rideMarshals.length > 0 && (
            <div className={styles.sectionBlock}>
              <motion.div 
                className={styles.sectionHeader}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUpVariant}
              >
                <h2 className={styles.sectionHeading}>Ride Marshals</h2>
                <div className={styles.headingUnderline}></div>
                <p className={styles.sectionSubheading}>The experienced leaders guiding your journey.</p>
              </motion.div>
              
              <motion.div 
                className={styles.marshalsList}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={staggerContainer}
              >
                {rideMarshals.map((marshal, idx) => (
                  <motion.div 
                    key={idx} 
                    className={styles.marshalCard}
                    style={{ gridTemplateColumns: marshal.image ? '1fr 1.2fr' : '1fr' }}
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
                        <h3 className={styles.marshalName}>{marshal.name}</h3>
                        <span className={styles.marshalRole}>{marshal.role}</span>
                      </div>
                      {marshal.description && <p className={styles.marshalDesc}>{marshal.description}</p>}
                      
                      {marshal.whatsapp && (
                        <a href={`https://wa.me/${marshal.whatsapp}`} target="_blank" rel="noreferrer" className={styles.whatsappBtn}>
                          <FaWhatsapp size={20} />
                          <span>Connect on WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {/* Back Office Section */}
          {backOffice.length > 0 && (
            <div className={styles.sectionBlock}>
              <motion.div 
                className={styles.sectionHeader}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUpVariant}
              >
                <h2 className={styles.sectionHeading}>Back Office & Team</h2>
                <div className={styles.headingUnderline}></div>
                <p className={styles.sectionSubheading}>The dedicated team making everything possible behind the scenes.</p>
              </motion.div>
              
              <motion.div 
                className={styles.backOfficeGrid}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={staggerContainer}
              >
                {backOffice.map((member, idx) => (
                  <motion.div 
                    key={idx} 
                    className={styles.backOfficeCard}
                    variants={fadeUpVariant}
                  >
                    {member.image && (
                      <div className={styles.backOfficeImageWrapper}>
                        <img src={member.image} alt={member.name} className={styles.backOfficeImage} referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <div className={styles.backOfficeInfo}>
                      <h4 className={styles.backOfficeName}>{member.name}</h4>
                      <p className={styles.backOfficeRole}>{member.role}</p>
                      {member.description && <p className={styles.backOfficeDesc}>{member.description}</p>}
                      
                      {member.whatsapp && (
                        <a href={`https://wa.me/${member.whatsapp}`} target="_blank" rel="noreferrer" className={styles.whatsappBtnSmall}>
                          <FaWhatsapp size={18} />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
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
