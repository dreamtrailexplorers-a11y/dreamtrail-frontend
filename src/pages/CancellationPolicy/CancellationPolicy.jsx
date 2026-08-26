import React, { useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './CancellationPolicy.module.css';

const CancellationPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.mainContent}>
        <div className={styles.headerArea}>
          <h1 className={styles.pageTitle}>Cancellation and Refund Terms</h1>
        </div>
        
        <div className={styles.contentArea}>
          <h2 className={styles.sectionTitle}>Policy on cancellations & deductions – domestic travel (Premium & Deluxe Services)</h2>
          
          <div className={styles.tableList}>
            <div className={styles.tableRow}>
              <div className={styles.tableCol1}>
                <span className={styles.circleIcon}></span>
                Non-Returnable Amount
              </div>
              <div className={styles.tableCol2}>Registration Amount</div>
            </div>
            <div className={styles.tableRow}>
              <div className={styles.tableCol1}>
                <span className={styles.circleIcon}></span>
                Within 54 to 31 Days Before Tour Commencement
              </div>
              <div className={styles.tableCol2}>50% Forfeiture of Package Cost</div>
            </div>
            <div className={styles.tableRow}>
              <div className={styles.tableCol1}>
                <span className={styles.circleIcon}></span>
                Less than 30 Days or Failure to Travel
              </div>
              <div className={styles.tableCol2}>No Refund Allowed</div>
            </div>
          </div>

          <h2 className={styles.sectionTitle} style={{ marginTop: '40px' }}>The GST amount is strictly non-refundable under any circumstances.</h2>
          
          <p className={styles.paragraphText}>
            The booking amount is strictly non-refundable. Additionally, the GST amount is non-refundable under any circumstances. Participants may cancel their registration/booking at any time, provided they adhere to the standard cancellation policy, and send a cancellation request via email prior to the commencement of the tour.
          </p>

          <h2 className={styles.sectionTitle} style={{ marginTop: '40px' }}>Standard booking, cancellation & refund policy</h2>
          
          <div className={styles.bulletList}>
            <div className={styles.bulletItem}>
              <span className={styles.circleIcon}></span>
              <span>GST amount is non-refundable under any circumstance.</span>
            </div>
            <div className={styles.bulletItem}>
              <span className={styles.circleIcon}></span>
              <span>The registration/booking amount is non-refundable and will be forfeited. The remaining balance, after deducting the registration amount and GST, will be eligible for a refund. This refund will be processed within 30 working days upon confirmation from our side and once the amount qualifies for a refund.</span>
            </div>
          </div>

          <p className={styles.redBoldText}>
            In the event of a no-show at the starting point for any reason, Dreamtrail Explorers will not be liable for refunding any amount paid.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CancellationPolicy;
