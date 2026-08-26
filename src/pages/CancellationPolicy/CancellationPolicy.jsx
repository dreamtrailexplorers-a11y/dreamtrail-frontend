import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './CancellationPolicy.module.css';
import { getSiteSettings } from '../../services/api';

const CancellationPolicy = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchSettings = async () => {
      try {
        const response = await getSiteSettings();
        if (response.data && response.data.cancellationSettings) {
          setData(response.data.cancellationSettings);
        }
      } catch (err) {
        console.error('Error fetching cancellation settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>Loading...</div>
        <Footer />
      </div>
    );
  }

  // Fallbacks if data is missing
  const tableSubtitle = data?.tableSubtitle || 'Policy on cancellations & deductions – domestic travel (Premium & Deluxe Services)';
  const tableRows = data?.tableRows?.length ? data.tableRows : [
    { leftText: 'Non-Returnable Amount', rightText: 'Registration Amount' },
    { leftText: 'Within 54 to 31 Days Before Tour Commencement', rightText: '50% Forfeiture of Package Cost' },
    { leftText: 'Less than 30 Days or Failure to Travel', rightText: 'No Refund Allowed' }
  ];
  const middleSubtitle = data?.middleSubtitle || 'The GST amount is strictly non-refundable under any circumstances.';
  const middleText = data?.middleText || 'The booking amount is strictly non-refundable. Additionally, the GST amount is non-refundable under any circumstances. Participants may cancel their registration/booking at any time, provided they adhere to the standard cancellation policy, and send a cancellation request via email prior to the commencement of the tour.';
  const bottomSubtitle = data?.bottomSubtitle || 'Standard booking, cancellation & refund policy';
  const bottomBullets = data?.bottomBullets?.length ? data.bottomBullets : [
    'GST amount is non-refundable under any circumstance.',
    'The registration/booking amount is non-refundable and will be forfeited. The remaining balance, after deducting the registration amount and GST, will be eligible for a refund. This refund will be processed within 30 working days upon confirmation from our side and once the amount qualifies for a refund.'
  ];
  const redNote = data?.redNote || 'In the event of a no-show at the starting point for any reason, Dreamtrail Explorers will not be liable for refunding any amount paid.';

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.mainContent}>
        <div className={styles.headerArea}>
          <h1 className={styles.pageTitle}>Cancellation and Refund Terms</h1>
        </div>
        
        <div className={styles.contentArea}>
          {tableSubtitle && <h2 className={styles.sectionTitle}>{tableSubtitle}</h2>}
          
          <div className={styles.tableList}>
            {tableRows.map((row, index) => (
              <div key={index} className={styles.tableRow}>
                <div className={styles.tableCol1}>
                  <span className={styles.circleIcon}></span>
                  {row.leftText}
                </div>
                <div className={styles.tableCol2}>{row.rightText}</div>
              </div>
            ))}
          </div>

          {middleSubtitle && <h2 className={styles.sectionTitle} style={{ marginTop: '40px' }}>{middleSubtitle}</h2>}
          
          {middleText && (
            <p className={styles.paragraphText}>
              {middleText}
            </p>
          )}

          {bottomSubtitle && <h2 className={styles.sectionTitle} style={{ marginTop: '40px' }}>{bottomSubtitle}</h2>}
          
          <div className={styles.bulletList}>
            {bottomBullets.map((bullet, index) => (
              <div key={index} className={styles.bulletItem}>
                <span className={styles.circleIcon}></span>
                <span>{bullet}</span>
              </div>
            ))}
          </div>

          {redNote && (
            <p className={styles.redBoldText}>
              {redNote}
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CancellationPolicy;
