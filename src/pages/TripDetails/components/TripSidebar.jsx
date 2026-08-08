import React, { useState } from 'react';
import { FiCheck, FiPhone, FiMessageSquare, FiDownload, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import styles from './TripSidebar.module.css';
import BuyNowModal from '../../../components/BuyNowModal/BuyNowModal';

const TripSidebar = ({ trip, selectedOptionTitle, whatsappNumber, onOpenEnquiry, selectedDepartureDate, destinationInfo }) => {
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [expandedWhyUs, setExpandedWhyUs] = useState(null);
  
  const origPriceNum = Number(trip.originalPrice) || 0;
  const discPriceNum = Number(trip.discountedPrice) || 0;

  return (
    <div className={styles.stickySidebar}>
      {origPriceNum > 0 && discPriceNum > 0 && origPriceNum > discPriceNum && (
        <div className={styles.saveHeaderPill}>
          <FiCheck size={14} /> Save {'\u20B9'} {(origPriceNum - discPriceNum).toLocaleString('en-IN')}
        </div>
      )}

      <div className={styles.priceContainer}>
        <span className={styles.startFromLabel}>Starting from</span>
        <div className={styles.sidebarPriceRow}>
          <span className={styles.mainPrice}>
            {'\u20B9'} {trip.discountedPrice ? Number(trip.discountedPrice).toLocaleString('en-IN') : '0'}
          </span>
          <div className={styles.perPersonSub}>
            {origPriceNum > 0 && (
              <span className={styles.sidebarOldPrice}>
                {'\u20B9'} {origPriceNum.toLocaleString('en-IN')}
              </span>
            )}
            <span>per person</span>
            <span style={{fontSize: '0.65rem'}}>+ taxes</span>
          </div>
        </div>



        <div style={{ borderTop: '1px solid #e2e8f0', margin: '15px 0', paddingTop: '15px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '700', marginBottom: '4px' }}>
            {trip.title}
          </p>
          {selectedOptionTitle && selectedOptionTitle !== trip.title && (
            <p style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500', marginBottom: '4px' }}>
              {selectedOptionTitle}
            </p>
          )}
          <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginBottom: '15px' }}>
            {trip.duration || '5 Days 4 Nights'}
          </p>

          {/* Hover Dropdown for Why Choose Us */}
          {destinationInfo && destinationInfo.whyChooseUs && destinationInfo.whyChooseUs.length > 0 && (
            <div className={styles.whyUsDropdownWrapper}>
              <div className={styles.whyUsDropdownHeader}>
                <FiCheck style={{color: '#cc0000'}}/> 
                <span>Why Choose Us For {destinationInfo.name}</span>
                <FiChevronDown className={styles.whyUsChevron} />
              </div>
              <div className={styles.whyUsDropdownContent}>
                <div className={styles.whyUsScrollArea}>
                  {destinationInfo.whyChooseUs.map((item, index) => (
                    <div key={index} className={styles.whyUsDropdownItem}>
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Enquire & Buy Now Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={styles.sidebarEnquireBtn}
            onClick={onOpenEnquiry}
            style={{ flex: 1, fontSize: '0.95rem' }}
          >
            Send Enquiry
          </button>
          <button 
            onClick={() => setIsBuyModalOpen(true)}
            className={styles.sidebarBuyBtn}
            style={{ 
              flex: 1, 
              backgroundColor: '#ffffff', 
              color: '#e60000', 
              border: '1px solid #e60000', 
              padding: '0.85rem', 
              borderRadius: '8px', 
              fontSize: '0.95rem', 
              fontWeight: '800', 
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(230, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fff0f0'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Still Got Queries Box */}
      <div className={styles.queriesCard} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', marginTop: '15px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '10px' }}>Still Got Queries ?</h4>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Have your queries answered by</p>
        <p style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '15px' }}>DreamTrail's Destination Experts</p>
        <a 
          href={`https://wa.me/${whatsappNumber || '9099599331'}`} 
          target="_blank" 
          rel="noreferrer"
          className={styles.connectExpertBtn}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s' }}
        >
          <FiMessageSquare size={16} color="#25D366" /> Connect with Expert
        </a>
      </div>

      <BuyNowModal 
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        tripTitle={selectedOptionTitle && selectedOptionTitle !== trip.title ? `${trip.title} (${selectedOptionTitle})` : trip.title}
        pricePerPerson={discPriceNum}
        duration={trip.duration}
        destination={trip.destination?.name || trip.destination || ''}
        selectedDepartureDate={selectedDepartureDate}
      />
    </div>
  );
};

export default TripSidebar;
