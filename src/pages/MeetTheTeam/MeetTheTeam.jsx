import React, { useState, useEffect } from 'react';
import { getSiteSettings } from '../../services/api';
import { FaWhatsapp } from 'react-icons/fa';
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

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!data) return <div className={styles.error}>No data available.</div>;

  const rideMarshals = (data.teamMembers || []).filter(m => m.teamType === 'Ride Marshal');
  const backOffice = (data.teamMembers || []).filter(m => m.teamType === 'Back Office');

  return (
    <div className={styles.teamContainer}>
      
      {/* Hero Section */}
      <div className={styles.heroSection} style={{ backgroundImage: `url(${data.heroImage})` }}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroBox}>
            <div className={styles.heroImageContainer}>
              <img src="/logo.png" alt="Dream Riders" className={styles.heroLogo} />
            </div>
            <div className={styles.heroTextContent}>
              <h1 className={styles.heroTitle}>{data.heroTitle}</h1>
              <h2 className={styles.heroSubtitle}>{data.heroSubtitle}</h2>
              <p className={styles.heroDesc}>{data.heroText}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Section */}
      {data.quoteText && (
        <div className={styles.quoteSection}>
          <p className={styles.quoteText}>{data.quoteText}</p>
        </div>
      )}

      {/* Ride Marshals Section */}
      {rideMarshals.length > 0 && (
        <div className={styles.rideMarshalSection}>
          <h2 className={styles.sectionHeading}>
            Meet the <span className={styles.highlightText}>Ride Marshal</span>
          </h2>
          
          <div className={styles.marshalsList}>
            {rideMarshals.map((marshal, idx) => (
              <div key={idx} className={`${styles.marshalCard} ${idx % 2 !== 0 ? styles.marshalCardReverse : ''}`}>
                <div className={styles.marshalImageCol}>
                  <img src={marshal.image} alt={marshal.name} className={styles.marshalImage} />
                  <div className={styles.marshalNumber}>{marshal.orderNumber}</div>
                </div>
                <div className={styles.marshalInfoCol}>
                  <h3 className={styles.marshalName}>{marshal.name} <span className={styles.marshalRole}>{marshal.role}</span></h3>
                  <div className={styles.divider}></div>
                  <p className={styles.marshalDesc}>{marshal.description}</p>
                  {marshal.whatsapp && (
                    <a href={`https://wa.me/${marshal.whatsapp}`} target="_blank" rel="noreferrer" className={styles.whatsappBtn}>
                      <FaWhatsapp size={24} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back Office Section */}
      {backOffice.length > 0 && (
        <div className={styles.backOfficeSection}>
          <h2 className={styles.sectionHeading}>
            Back Office & <span className={styles.highlightText}>Team</span>
          </h2>
          
          <div className={styles.backOfficeGrid}>
            {backOffice.map((member, idx) => (
              <div key={idx} className={styles.backOfficeCard}>
                <img src={member.image} alt={member.name} className={styles.backOfficeImage} />
                <div className={styles.backOfficeInfo}>
                  <h4>{member.name}</h4>
                  <p>{member.role}</p>
                  {member.whatsapp && (
                    <a href={`https://wa.me/${member.whatsapp}`} target="_blank" rel="noreferrer" className={styles.whatsappBtnSmall}>
                      <FaWhatsapp size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default MeetTheTeam;
