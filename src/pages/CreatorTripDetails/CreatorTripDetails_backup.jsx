import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheck, FiX, FiArrowRight } from 'react-icons/fi';
import { MdLuggage, MdFlightTakeoff, MdInfoOutline, MdOutlinePayment, MdGavel, MdOutlineCancel } from 'react-icons/md';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './CreatorTripDetails.module.css';

// Reused components from TripDetails
import TripItinerary from '../TripDetails/components/TripItinerary';

// New Creator Trip specific components
import CreatorTripHeader from './components/CreatorTripHeader';
import CuratorProfile from './components/CuratorProfile';
import CreatorQuickInfo from './components/CreatorQuickInfo';
import CreatorTripTabs from './components/CreatorTripTabs';
import CreatorHighlights from './components/CreatorHighlights';
import CreatorSidebarForm from './components/CreatorSidebarForm';
import CreatorFaqs from './components/CreatorFaqs';
import CreatorNotFound from './components/CreatorNotFound';

const CreatorTripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentTrip, setCurrentTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quickInfoModal, setQuickInfoModal] = useState({ isOpen: false, title: '', content: [] });

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchTrip = async () => {
      try {
        const { getCreatorTrip } = await import('../../services/api');
        const { data: creatorTrip } = await getCreatorTrip(id);
        
        if (creatorTrip && creatorTrip.linkedTrip) {
          // Merge CreatorTrip overrides with LinkedTrip data
          const mergedTrip = {
            ...creatorTrip.linkedTrip,
            // Creator details override linked trip details
            title: creatorTrip.title,
            curatorName: creatorTrip.curatorName,
            curatorAvatar: creatorTrip.curatorAvatar,
            curatorFollowers: creatorTrip.curatorFollowers,
            aboutItinerary: creatorTrip.aboutItinerary,
            hotelCategory: creatorTrip.hotelCategory || creatorTrip.linkedTrip.hotelCategory,
            meals: creatorTrip.meals || creatorTrip.linkedTrip.meals,
            galleryImages: creatorTrip.galleryImages?.length > 0 ? creatorTrip.galleryImages : creatorTrip.linkedTrip.galleryImages,
          };
          setCurrentTrip(mergedTrip);
        } else {
          setCurrentTrip('not-found');
        }
      } catch (error) {
        console.error('Failed to fetch creator trip details:', error);
        setCurrentTrip('not-found');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-block', width: '50px', height: '50px', border: '4px solid #f3f3f3', borderTop: '4px solid #ef4444', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '1.2rem', fontFamily: 'Outfit, sans-serif' }}>Packing bags...</p>
            <style>
              {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
            </style>
          </div>
        </div>

        <Footer />
        
        {/* Quick Info Modal */}
        {quickInfoModal.isOpen && (
          <div className={styles.modalOverlay} onClick={() => setQuickInfoModal({ isOpen: false, title: '', content: [] })}>
            <div className={styles.modalContent} style={{ maxWidth: '600px', padding: '30px' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>{quickInfoModal.title}</h3>
                <button onClick={() => setQuickInfoModal({ isOpen: false, title: '', content: [] })} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
              </div>
              <div style={{ lineHeight: '1.6', color: '#334155' }}>
                {Array.isArray(quickInfoModal.content) ? (
                  <ul style={{ paddingLeft: '20px', margin: 0 }}>
                    {quickInfoModal.content.map((point, i) => (
                      <li key={i} style={{ marginBottom: '10px' }}>{point}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{quickInfoModal.content}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentTrip === 'not-found' || !currentTrip) return <CreatorNotFound />;

  const galleryImages = currentTrip.galleryImages?.length > 0 ? currentTrip.galleryImages : [
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80"
  ];
  const itineraryDays = currentTrip.itinerary || [];
  const inclusions = currentTrip.inclusions || [];
  const exclusions = currentTrip.exclusions || [];
  const faqs = currentTrip.faqs || [];

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <div className={styles.mainContainer}>
        <CreatorTripHeader trip={currentTrip} images={galleryImages} />
        
        <div className={styles.contentLayout}>
          {/* Left Column (Main Details) */}
          <div className={styles.leftColumn}>
            <CuratorProfile trip={currentTrip} />
            <CreatorQuickInfo trip={currentTrip} />
            <CreatorTripTabs />
            
            <section id="about" className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>About this Itinerary</h3>
              <p className={styles.aboutText}>
                {currentTrip.aboutItinerary || "Get ready to experience the magic..."}
              </p>
              <button className={styles.readMoreBtn}>Read more</button>
            </section>
            
            <section id="highlights" className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>Highlights</h3>
              <CreatorHighlights images={galleryImages} />
            </section>
            
            <section id="itinerary" className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>Itinerary</h3>
              <TripItinerary itineraryDays={itineraryDays} hideDownload={true} />
            </section>
            
            <section id="inclusions" className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>Inclusion</h3>
              <div className={styles.listGrid}>
                {inclusions.map((item, idx) => (
                  <div key={idx} className={styles.listItem}>
                    <FiCheck className={styles.checkIcon} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
            
            <section id="exclusions" className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>Exclusion</h3>
              <div className={styles.listGrid}>
                {exclusions.map((item, idx) => (
                  <div key={idx} className={styles.listItem}>
                    <FiX className={styles.crossIcon} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right Column (Sticky Form Sidebar) */}
          <div className={styles.rightColumn}>
            <CreatorSidebarForm trip={currentTrip} />
          </div>

        </div>

        {/* Full Width Sections */}
        {currentTrip.quickInfo && Object.values(currentTrip.quickInfo).some(arr => Array.isArray(arr) && arr.length > 0) && (
          <div style={{ marginTop: '3rem' }}>
            <section className={styles.cleanSection}>
              <h3 className={styles.sectionTitle}>Quick Info</h3>
              <div className={styles.quickInfoGrid}>
                {Array.isArray(currentTrip.quickInfo.packingList) && currentTrip.quickInfo.packingList.length > 0 && (
                  <button className={styles.quickInfoBtn} onClick={() => setQuickInfoModal({ isOpen: true, title: 'Packing List', content: currentTrip.quickInfo.packingList })}>
                    <div className={styles.btnLeft}>
                      <MdLuggage className={styles.btnIcon} /> Packing List
                    </div>
                    <FiArrowRight />
                  </button>
                )}
                {Array.isArray(currentTrip.quickInfo.bookFlight) && currentTrip.quickInfo.bookFlight.length > 0 && (
                  <button className={styles.quickInfoBtn} onClick={() => setQuickInfoModal({ isOpen: true, title: 'Book a Flight', content: currentTrip.quickInfo.bookFlight })}>
                    <div className={styles.btnLeft}>
                      <MdFlightTakeoff className={styles.btnIcon} /> Book a Flight
                    </div>
                    <FiArrowRight />
                  </button>
                )}
                {Array.isArray(currentTrip.quickInfo.knowBeforeYouGo) && currentTrip.quickInfo.knowBeforeYouGo.length > 0 && (
                  <button className={styles.quickInfoBtn} onClick={() => setQuickInfoModal({ isOpen: true, title: 'Know Before You Go', content: currentTrip.quickInfo.knowBeforeYouGo })}>
                    <div className={styles.btnLeft}>
                      <MdInfoOutline className={styles.btnIcon} /> Know Before You Go
                    </div>
                    <FiArrowRight />
                  </button>
                )}
                {Array.isArray(currentTrip.quickInfo.paymentPolicy) && currentTrip.quickInfo.paymentPolicy.length > 0 && (
                  <button className={styles.quickInfoBtn} onClick={() => setQuickInfoModal({ isOpen: true, title: 'Payment Policy', content: currentTrip.quickInfo.paymentPolicy })}>
                    <div className={styles.btnLeft}>
                      <MdOutlinePayment className={styles.btnIcon} /> Payment Policy
                    </div>
                    <FiArrowRight />
                  </button>
                )}
                {Array.isArray(currentTrip.quickInfo.termsAndConditions) && currentTrip.quickInfo.termsAndConditions.length > 0 && (
                  <button className={styles.quickInfoBtn} onClick={() => setQuickInfoModal({ isOpen: true, title: 'Terms and Conditions', content: currentTrip.quickInfo.termsAndConditions })}>
                    <div className={styles.btnLeft}>
                      <MdGavel className={styles.btnIcon} /> Terms and Conditions
                    </div>
                    <FiArrowRight />
                  </button>
                )}
                {Array.isArray(currentTrip.quickInfo.cancellationAndRefundPolicy) && currentTrip.quickInfo.cancellationAndRefundPolicy.length > 0 && (
                  <button className={styles.quickInfoBtn} onClick={() => setQuickInfoModal({ isOpen: true, title: 'Cancellation and Refund Policy', content: currentTrip.quickInfo.cancellationAndRefundPolicy })}>
                    <div className={styles.btnLeft}>
                      <MdOutlineCancel className={styles.btnIcon} /> Cancellation and Refund Policy
                    </div>
                    <FiArrowRight />
                  </button>
                )}
              </div>
            </section>
          </div>
        )}  
          <section className={styles.cleanSection}>
            <h3 className={styles.sectionTitle} style={{textAlign: 'center', marginBottom: '2rem'}}>FAQs</h3>
            <CreatorFaqs faqs={faqs} />
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreatorTripDetails;
