import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import EnquiryModal from '../../components/EnquiryModal/EnquiryModal';
import styles from './TripDetails.module.css';

import { FiArrowRight } from 'react-icons/fi';
import { MdLuggage, MdFlightTakeoff, MdInfoOutline, MdOutlinePayment, MdGavel, MdOutlineCancel } from 'react-icons/md';

// Extracted Components
import TripGallery from './components/TripGallery';
import TripHeader from './components/TripHeader';
import TripAmenities from './components/TripAmenities';
import TripAbout from './components/TripAbout';
import TripItinerary from './components/TripItinerary';
import TripInclusions from './components/TripInclusions';
import TripPackages from './components/TripPackages';
import Loader from '../../components/Loader/Loader';
import TripReviews from './components/TripReviews';
import TripSidebar from './components/TripSidebar';
import TripPackageOptions from './components/TripPackageOptions';
import TripPageNav from './components/TripPageNav';

// Reusing CreatorFaqs for clean layout
import CreatorFaqs from '../CreatorTripDetails/components/CreatorFaqs';
import BuyNowModal from '../../components/BuyNowModal/BuyNowModal';

const TripDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [selectedOptionIndices, setSelectedOptionIndices] = useState([0]);
  const [selectedSubOptionIndex, setSelectedSubOptionIndex] = useState(null);
  const [selectedDepartureDate, setSelectedDepartureDate] = useState(null);

  const [currentTrip, setCurrentTrip] = useState(null);
  const [currentDestination, setCurrentDestination] = useState(null);
  const [quickInfoModal, setQuickInfoModal] = useState({ isOpen: false, title: '', content: '' });
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState(null);
  const [linkedAttractions, setLinkedAttractions] = useState([]);
  const [showAllAttractions, setShowAllAttractions] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTripAndReviews = async () => {
      try {
        const { getTrips, getReviews, getSiteSettings, getDestinations, getAttractions } = await import('../../services/api');
        const [tripsRes, reviewsRes, settingsRes, destinationsRes, attractionsRes] = await Promise.all([getTrips(), getReviews(), getSiteSettings(), getDestinations(), getAttractions()]);
        
        const trip = tripsRes.data.find((t) => t.slug === slug);
        setCurrentTrip(trip || 'not-found');
        setSettings(settingsRes.data);
        if (trip) {
          const dest = destinationsRes.data.find(d => d.name === trip.destination);
          setCurrentDestination(dest || null);
          
          if (attractionsRes && attractionsRes.data) {
            setLinkedAttractions(attractionsRes.data.filter(attr => attr.relatedTrips && attr.relatedTrips.includes(trip._id)));
          }
        }
        setReviews(reviewsRes.data.filter(r => 
          (r.tripSlug && r.tripSlug === trip.slug) || 
          (!r.tripSlug && r.destination && trip.destination && r.destination.toLowerCase() === trip.destination.toLowerCase()) ||
          (!r.tripSlug && !r.destination && r.trip === trip.title) // Fallback for old reviews
        ));
      } catch (error) {
        console.error('Failed to fetch trip details:', error);
      }
    };
    fetchTripAndReviews();

    const timer = setTimeout(() => {
      setIsEnquiryModalOpen(true);
    }, 5000);

    // Check if we just returned from login after trying to buy
    const pendingBuyStr = sessionStorage.getItem('pendingBuy');
    if (pendingBuyStr) {
      try {
        const pendingBuy = JSON.parse(pendingBuyStr);
        if (pendingBuy && pendingBuy.path === window.location.pathname) {
          setIsBuyModalOpen(true);
        }
      } catch (e) {}
    }

    return () => clearTimeout(timer);
  }, [slug]);

  const handleOpenEnquiry = () => setIsEnquiryModalOpen(true);

  if (!currentTrip) return <Loader fullScreen={true} />;
  if (currentTrip === 'not-found') return <div style={{textAlign: 'center', padding: '100px'}}><h2>Package Not Found</h2><p>Please check the URL and try again.</p></div>;

  const galleryImages = currentTrip.galleryImages?.length > 0 ? currentTrip.galleryImages : [
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80"
  ];
  
  const itineraryDays = currentTrip.itinerary || [];
  const attractions = currentTrip.attractions || [];
  const inclusions = currentTrip.inclusions || [];
  const exclusions = currentTrip.exclusions || [];
  const departureDates = [...(currentTrip.departureDates || [])].sort((a, b) => {
    const dateA = new Date(a.start);
    const dateB = new Date(b.start);
    if (isNaN(dateA) && !isNaN(dateB)) return 1;
    if (!isNaN(dateA) && isNaN(dateB)) return -1;
    if (isNaN(dateA) && isNaN(dateB)) return 0;
    return dateA - dateB;
  });
  const faqs = currentTrip.faqs || [];
  const tripReviews = reviews.length > 0 ? reviews : [];

  const packageOptions = currentTrip.packageOptions || [];
  
  // Calculate base display prices
  let baseDisc = Number(currentTrip.discountedPrice) || 0;
  let baseOrig = Number(currentTrip.originalPrice) || 0;
  
  // If no discount is provided, the original price BECOMES the final selling price
  if (baseDisc === 0 && baseOrig > 0) {
    baseDisc = baseOrig;
    baseOrig = 0; // Don't show crossed out price
  }

  let displayDiscPrice = baseDisc;
  let displayOrigPrice = baseOrig > 0 ? baseOrig : null;
  
  let selectedSidebarTitle = currentTrip.title;
  let selectedSidebarDuration = currentTrip.duration || "5 Days 4 Nights";
  
  let variantAddon = 0;
  const variants = currentTrip.variants || [];
  const validVariants = variants.filter(v => v.name && v.name.trim() !== '');
  const variant = selectedSubOptionIndex !== null ? validVariants[selectedSubOptionIndex] : null;
  if (variant && variant.name) {
    variantAddon = Number(variant.price) || 0;
  }

  // Calculate selected packages
  const selectedPackages = [];
  if (packageOptions && packageOptions.length > 0) {
    selectedOptionIndices.forEach(idx => {
      if (packageOptions[idx]) {
        let optPrice = Number(packageOptions[idx].price) || 0;
        let optOrigPrice = Number(packageOptions[idx].originalPrice) || baseOrig || baseDisc;
        let finalPrice = (optPrice === 0 || optPrice >= optOrigPrice) ? optOrigPrice : optPrice;
        
        selectedPackages.push({
          title: packageOptions[idx].title + (variant && variant.name ? ` with ${variant.name}` : ''),
          price: finalPrice + variantAddon,
          originalPrice: (optPrice !== 0 && optPrice < optOrigPrice) ? optOrigPrice + variantAddon : null
        });
      }
    });
  } else {
    selectedPackages.push({
      title: currentTrip.title + (variant && variant.name ? ` with ${variant.name}` : ''),
      price: baseDisc + variantAddon,
      originalPrice: baseOrig > 0 ? (baseOrig + variantAddon) : null
    });
  }

  const processedAllPackages = (packageOptions || []).map(opt => {
    let optPrice = Number(opt.price) || 0;
    let optOrigPrice = Number(opt.originalPrice) || baseOrig || baseDisc;
    let finalPrice = (optPrice === 0 || optPrice >= optOrigPrice) ? optOrigPrice : optPrice;
    return {
      title: opt.title + (variant && variant.name ? ` with ${variant.name}` : ''),
      price: finalPrice + variantAddon
    };
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPast = selectedDepartureDate && !isNaN(new Date(selectedDepartureDate.start)) && new Date(selectedDepartureDate.start) < today;
  const isSoldOut = selectedDepartureDate?.status === 'Sold Out';
  const isUnavailable = isPast || isSoldOut;

  if (selectedPackages.length > 0) {
    // For sidebar display, show the first package selected, or "Multiple Packages" if > 1
    if (selectedPackages.length === 1) {
      displayDiscPrice = selectedPackages[0].price;
      displayOrigPrice = selectedPackages[0].originalPrice;
      selectedSidebarTitle = selectedPackages[0].title;
    } else {
      displayDiscPrice = selectedPackages.reduce((sum, pkg) => sum + pkg.price, 0);
      displayOrigPrice = selectedPackages.reduce((sum, pkg) => sum + (pkg.originalPrice || pkg.price), 0);
      selectedSidebarTitle = "Multiple Packages Selected";
    }
  }
  
    return (
    <div className={styles.pageWrapper}>
      <Navbar sticky={false} />

      <TripGallery images={galleryImages} />
      
      <TripPageNav trip={currentTrip} hasAttractions={linkedAttractions.length > 0 || attractions.length > 0} />

      <div className={styles.mainContainer}>
        <div className={styles.contentLayout}>
          
          {/* Left Column (Main Details) */}
          <div className={styles.leftColumn}>
            <div id="about" style={{ scrollMarginTop: '90px' }}>
              <TripHeader trip={currentTrip} />
              <TripAmenities trip={currentTrip} />
              <TripAbout trip={currentTrip} />
            </div>
            
            <div id="packages" style={{ scrollMarginTop: '90px' }}>
              <TripPackageOptions 
                trip={currentTrip}
                options={packageOptions} 
                selectedOptionIndices={selectedOptionIndices} 
                onSelectOption={setSelectedOptionIndices} 
                selectedSubOptionIndex={selectedSubOptionIndex} 
                onSelectSubOption={setSelectedSubOptionIndex} 
              />
            </div>



            <div id="itinerary" style={{ scrollMarginTop: '90px' }}>
              <TripItinerary itineraryDays={itineraryDays} onOpenEnquiry={handleOpenEnquiry} />
            </div>
            
            <div id="inclusions" style={{ scrollMarginTop: '90px' }}>
              <TripInclusions inclusions={inclusions} exclusions={exclusions} mapImage={currentTrip.mapImage} />
            </div>

            {/* Trip Packages / Departure Dates */}
            <div id="dates" className={styles.sectionMargin} style={{ scrollMarginTop: '90px' }}>
              <TripPackages 
                departureDates={departureDates} 
                onOpenEnquiry={handleOpenEnquiry} 
                selectedDepartureDate={selectedDepartureDate}
                setSelectedDepartureDate={setSelectedDepartureDate}
              />
            </div>
            
            {/* Pre Book Section */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '25px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', margin: 0, marginBottom: '5px' }}>Book your seat now!</h4>
                <p style={{ color: '#475569', margin: 0, fontSize: '0.95rem' }}>Pre Book @ {settings?.preBookingSettings?.amount || 5000}/-</p>
              </div>
              <button 
                onClick={() => { if (!isUnavailable) setIsBuyModalOpen(true); }}
                style={{ 
                  backgroundColor: isUnavailable ? '#cbd5e1' : '#e60000', 
                  color: '#ffffff', 
                  border: 'none', 
                  padding: '0.85rem 2rem', 
                  borderRadius: '8px', 
                  fontSize: '0.95rem', 
                  fontWeight: '800', 
                  cursor: isUnavailable ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isUnavailable ? 'none' : '0 4px 14px rgba(230, 0, 0, 0.2)'
                }}
                onMouseOver={(e) => { if(!isUnavailable) { e.currentTarget.style.backgroundColor = '#cc0000'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseOut={(e) => { if(!isUnavailable) { e.currentTarget.style.backgroundColor = '#e60000'; e.currentTarget.style.transform = 'translateY(0)'; } }}
              >
                {isSoldOut ? 'SOLD OUT' : isPast ? 'UNAVAILABLE' : 'BOOK NOW'}
              </button>
            </div>
          </div>

          {/* Right Column (Sticky Pricing Sidebar) */}
          <div className={styles.rightColumn}>
            <TripSidebar 
              destinationInfo={currentDestination}
              trip={{
                ...currentTrip, 
                discountedPrice: displayDiscPrice, 
                originalPrice: displayOrigPrice,
                duration: selectedSidebarDuration
              }} 
              selectedOptionTitle={selectedSidebarTitle}
              whatsappNumber={settings?.whatsappNumber}
              onOpenEnquiry={handleOpenEnquiry} 
              selectedDepartureDate={selectedDepartureDate}
              selectedPackages={selectedPackages}
              isUnavailable={isUnavailable}
              isSoldOut={isSoldOut}
              isPast={isPast}
            />
          </div>

        </div>

        {/* Full Width Sections */}

        {/* Attractions Section */}
        {(linkedAttractions.length > 0 || attractions.length > 0) && (
          <div id="attractions" style={{ marginTop: '2rem', backgroundColor: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Attractions & Activities</h3>
              {showAllAttractions && (
                <button 
                  onClick={() => setShowAllAttractions(false)}
                  style={{ padding: '6px 16px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', color: '#475569', fontWeight: '500' }}
                >
                  Collapse All
                </button>
              )}
            </div>
            <div className={styles.attractionsGrid}>
              {(() => {
                const allAttractionsList = [
                  ...linkedAttractions.map(a => ({...a, type: 'linked'})),
                  ...attractions.map(a => ({...a, type: 'inline'}))
                ];
                const displayedAttractions = showAllAttractions ? allAttractionsList : allAttractionsList.slice(0, 4);

                return displayedAttractions.map((attr, idx) => {
                  if (attr.type === 'linked') {
                    const linkTo = attr.slug?.startsWith('/') ? attr.slug : `/attractions/${attr.slug}`;
                    return (
                      <div key={`linked-${idx}`} className={styles.attractionCard}>
                        <a href={linkTo} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                          <img src={attr.image?.startsWith('http') ? attr.image : `${import.meta.env.VITE_BACKEND_URL}${attr.image}`} alt={attr.title} className={styles.attractionImg} />
                          <h4 className={styles.attractionTitle} style={{ marginTop: '0.75rem' }}>{attr.title}</h4>
                          <p className={styles.attractionSubtitle}>{attr.overview?.substring(0, 50)}...</p>
                        </a>
                      </div>
                    );
                  } else {
                    return (
                      <div key={`inline-${idx}`} className={styles.attractionCard}>
                        <img src={attr.image} alt={attr.title} className={styles.attractionImg} />
                        <h4 className={styles.attractionTitle} style={{ marginTop: '0.75rem' }}>{attr.title}</h4>
                        <p className={styles.attractionSubtitle}>{attr.subtitle}</p>
                      </div>
                    );
                  }
                });
              })()}
            </div>
            {/* Load More Button */}
            {(() => {
                const allLength = linkedAttractions.length + attractions.length;
                if (allLength > 4 && !showAllAttractions) {
                  return (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                      <button 
                        onClick={() => setShowAllAttractions(true)}
                        style={{ padding: '8px 24px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', color: '#475569', fontWeight: '600' }}
                      >
                        Load More
                      </button>
                    </div>
                  );
                }
                return null;
            })()}
          </div>
        )}

        {/* FAQs */}
        {faqs && faqs.length > 0 && (
          <div id="faqs" style={{ marginTop: '2rem', backgroundColor: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', marginBottom: '20px' }}>FAQs</h3>
            <CreatorFaqs faqs={faqs} />
          </div>
        )}

        {/* Quick Info - Only show if at least one field exists */}
        {currentTrip.quickInfo && Object.values(currentTrip.quickInfo).some(arr => Array.isArray(arr) && arr.length > 0) && (
          <div style={{ marginTop: '2rem', backgroundColor: '#fff', padding: '2rem', borderRadius: '16px' }}>
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
                {Array.isArray(currentTrip.quickInfo.generalNote) && currentTrip.quickInfo.generalNote.length > 0 && (
                  <button className={styles.quickInfoBtn} onClick={() => setQuickInfoModal({ isOpen: true, title: 'General Note', content: currentTrip.quickInfo.generalNote })}>
                    <div className={styles.btnLeft}>
                      <MdInfoOutline className={styles.btnIcon} /> General Note
                    </div>
                    <FiArrowRight />
                  </button>
                )}
              </div>
            </section>
          </div>
        )}
          
        {/* Reviews Section */}
        {tripReviews && tripReviews.length > 0 && (
          <div style={{ marginTop: '2rem', backgroundColor: '#fff', padding: '2rem', borderRadius: '16px' }}>
            <section className={styles.cleanSection}>
              <TripReviews reviews={tripReviews} />
            </section>
          </div>
        )}
      </div>

      <Footer />

      <EnquiryModal 
        isOpen={isEnquiryModalOpen} 
        onClose={() => setIsEnquiryModalOpen(false)} 
        trip={currentTrip}
        selectedOptionTitle={selectedSidebarTitle}
        selectedDepartureDate={selectedDepartureDate}
      />

      {currentTrip && (
        <BuyNowModal 
          isOpen={isBuyModalOpen}
          onClose={() => setIsBuyModalOpen(false)}
          mode="both" initialPreBookingSettings={settings?.preBookingSettings}
          tripTitle={selectedSidebarTitle && selectedSidebarTitle !== currentTrip.title ? `${currentTrip.title} (${selectedSidebarTitle})` : currentTrip.title}
          pricePerPerson={Number(displayDiscPrice) || 0}
          duration={currentTrip.duration}
          destination={currentDestination ? currentDestination.name : ''}
          selectedDepartureDate={selectedDepartureDate}
          selectedPackages={selectedPackages}
          allPackages={processedAllPackages}
        />
      )}

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
                <div style={{ margin: 0 }}>
                  {quickInfoModal.content.map((point, i) => (
                    <div key={i} style={{ marginBottom: '15px' }}>
                      {typeof point === 'object' && point !== null ? (
                        <>
                          {point.title && <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: '#1e293b' }}>{point.title}</h4>}
                          {point.desc && (
                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.95rem', color: '#475569' }}>
                              {point.desc.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                                <li key={idx} style={{ marginBottom: '6px', lineHeight: '1.5' }}>{line}</li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : (
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.95rem', color: '#475569' }}>
                          {String(point).split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                            <li key={idx} style={{ marginBottom: '6px', lineHeight: '1.5' }}>{line}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.95rem', color: '#475569' }}>
                  {String(quickInfoModal.content).split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                    <li key={idx} style={{ marginBottom: '6px', lineHeight: '1.5' }}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetails;




