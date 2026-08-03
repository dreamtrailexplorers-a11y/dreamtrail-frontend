import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import CategoryMenu from '../../components/CategoryMenu/CategoryMenu';
import TrendingCard from '../../components/TrendingSection/TrendingCard';
import CreatorFaqs from '../CreatorTripDetails/components/CreatorFaqs';
import Footer from '../../components/Footer/Footer';
import { FiSend, FiUsers, FiBriefcase, FiMapPin, FiStar } from 'react-icons/fi';
import { FaCarSide } from 'react-icons/fa';
import styles from './DestinationPage.module.css';

const DestinationPage = () => {
  const { slug } = useParams();

  const [currentDestination, setCurrentDestination] = useState(null);
  const [allDestinations, setAllDestinations] = useState([]);
  const [allTrips, setAllTrips] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [attractions, setAttractions] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchDestData = async () => {
      try {
        const { getDestinations, getTrips, getReviews, getAttractionsByDestination } = await import('../../services/api');
        const [destRes, tripsRes, reviewsRes] = await Promise.all([getDestinations(), getTrips(), getReviews()]);
        
        const dest = destRes.data.find(d => d.slug === slug || d.name.toLowerCase().replace(/\s+/g, '-') === slug) || destRes.data[0];
        setCurrentDestination(dest);
        setAllDestinations(destRes.data);
        
        // Filter trips for this destination
        const destName = dest ? dest.name : formatTitle(slug);
        const filteredTrips = tripsRes.data.filter(t => t.destination === destName || t.destination?.toLowerCase() === destName.toLowerCase());
        setAllTrips(filteredTrips);
        
        setReviews(reviewsRes.data.filter(r => r.location === dest?.name));

        if (destName) {
          const attrRes = await getAttractionsByDestination(destName);
          setAttractions(attrRes.data);
        }

      } catch (error) {
        console.error('Failed to fetch destination details:', error);
      }
    };
    fetchDestData();
  }, [slug]);

  const formatTitle = (s) => {
    if (!s) return 'Spiti Valley';
    return s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  const title = currentDestination ? currentDestination.name : formatTitle(slug);

  if (!currentDestination) return <div>Loading...</div>;

  // Group trips dynamically by reading their new explicit category field.
  const flightPackages = allTrips.filter(t => t.category === 'Flight Package');
  const tourPackages = allTrips.filter(t => t.category === 'Tour Package');
  const groupTrips = allTrips.filter(t => t.category === 'Group Trip');
  const honeymoonPackages = allTrips.filter(t => t.category === 'Honeymoon');
  const uniqueExperiences = allTrips.filter(t => t.category === 'Unique Experience');

  const handpickedHotels = currentDestination.handpickedHotels || [];
  const curatedExperiences = currentDestination.curatedExperiences || [];
  const faqs = currentDestination.faqs || [];
  const popularCities = currentDestination.popularCities || [];
  const aboutText = currentDestination.aboutText || '';

  const domesticDestinations = allDestinations.filter(d => d.type === 'domestic');
  const internationalDestinations = allDestinations.filter(d => d.type === 'international');

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <CategoryMenu />

      {/* Sticky In-Page Nav */}
      <div className={styles.stickyNavContainer}>
        <div className={styles.stickyNavInner}>
          <button onClick={() => handleScrollTo('flight-packages')} className={styles.stickyNavItem}>
            <FiSend className={styles.navIcon} /> Flight Packages
          </button>
          <button onClick={() => handleScrollTo('tour-packages')} className={styles.stickyNavItem}>
            <FaCarSide className={styles.navIcon} /> Tour Packages
          </button>
          <button onClick={() => handleScrollTo('group-trips')} className={styles.stickyNavItem}>
            <FiUsers className={styles.navIcon} /> Group Trips
          </button>
          <button onClick={() => handleScrollTo('honeymoon')} className={styles.stickyNavItem}>
            <FiBriefcase className={styles.navIcon} /> Honeymoon
          </button>
          <button onClick={() => handleScrollTo('unique-experiences')} className={styles.stickyNavItem}>
            <FiStar className={styles.navIcon} /> Unique Experiences
          </button>
          <button onClick={() => handleScrollTo('attractions')} className={styles.stickyNavItem}>
            <FiMapPin className={styles.navIcon} /> Attractions
          </button>
        </div>
      </div>

      <main className={styles.mainContainer}>
        {/* Flight Packages Section */}
        {flightPackages.length > 0 && (
          <section id="flight-packages" className={styles.section}>
            <h2 className={styles.sectionTitle}>Flight Packages</h2>
            <div className={styles.tripsGrid}>
              {flightPackages.map(pkg => (
                <TrendingCard key={`flight-${pkg._id || pkg.id}`} trip={pkg} />
              ))}
            </div>
          </section>
        )}

        {/* Tour Packages Section */}
        {tourPackages.length > 0 && (
          <section id="tour-packages" className={styles.section}>
            <h2 className={styles.sectionTitle}>Tour Packages</h2>
            <div className={styles.tripsGrid}>
              {tourPackages.map(trip => (
                <TrendingCard key={`tour-${trip._id || trip.id}`} trip={trip} />
              ))}
            </div>
          </section>
        )}

        {/* Group Trips Section */}
        {groupTrips.length > 0 && (
          <section id="group-trips" className={styles.section}>
            <h2 className={styles.sectionTitle}>Group Trips</h2>
            <div className={styles.tripsGrid}>
              {groupTrips.map(trip => (
                <TrendingCard key={`group-${trip._id || trip.id}`} trip={trip} />
              ))}
            </div>
          </section>
        )}

        {/* Honeymoon Section */}
        {honeymoonPackages.length > 0 && (
          <section id="honeymoon" className={styles.section}>
            <h2 className={styles.sectionTitle}>Honeymoon Packages</h2>
            <div className={styles.tripsGrid}>
              {honeymoonPackages.map(trip => (
                <TrendingCard key={`honeymoon-${trip._id || trip.id}`} trip={trip} />
              ))}
            </div>
          </section>
        )}

        {/* Handpicked Hotels Section */}
        {handpickedHotels.length > 0 && (
          <section id="hotels" className={styles.section}>
            <h2 className={styles.sectionTitle}>Handpicked Hotels</h2>
            <div className={styles.hotelsGrid}>
              {handpickedHotels.map(hotel => (
                <Link key={hotel.id || hotel.title} to="#" target="_blank" className={styles.hotelCardLink}>
                  <div className={styles.hotelCard}>
                    <img src={hotel.image} alt={hotel.title} className={styles.hotelImg} />
                    <div className={styles.hotelInfo}>
                      <h4 className={styles.hotelTitle}>{hotel.title}</h4>
                      <span className={styles.hotelStarTag}>{hotel.star}</span>
                      <p className={styles.hotelPrice}>From ₹{hotel.startPrice}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Curated Experiences Section */}
        {curatedExperiences.length > 0 && (
          <section id="experiences" className={styles.section}>
            <h2 className={styles.sectionTitle}>Curated Experiences</h2>
            <div className={styles.hotelsGrid}>
              {curatedExperiences.map(exp => (
                <Link key={exp.id || exp.title} to="#" target="_blank" className={styles.hotelCardLink}>
                  <div className={styles.hotelCard}>
                    <img src={exp.image} alt={exp.title} className={styles.hotelImg} />
                    <div className={styles.hotelInfo}>
                      <h4 className={styles.hotelTitle}>{exp.title}</h4>
                      <span className={styles.hotelStarTag}>{exp.type}</span>
                      <p className={styles.hotelPrice}>From ₹{exp.startPrice}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Unique Experiences Section */}
        {uniqueExperiences.length > 0 && (
          <section id="unique-experiences" className={styles.section}>
            <h2 className={styles.sectionTitle}>Unique Experiences</h2>
            <div className={styles.tripsGrid}>
              {uniqueExperiences.map(trip => (
                <TrendingCard key={`unique-${trip._id || trip.id}`} trip={trip} />
              ))}
            </div>
          </section>
        )}

        {/* About Section */}
        {aboutText && (
          <section className={styles.aboutSection}>
            <h2 className={styles.sectionTitle}>About {title}</h2>
            <p className={styles.aboutText}>
              {aboutText} <span className={styles.readMore}>Read More</span>
            </p>
          </section>
        )}

        {/* Attractions Section */}
        {attractions.length > 0 && (
          <section id="attractions" className={styles.section}>
            <h2 className={styles.sectionTitle}>Attractions</h2>
            <div className={styles.placesGrid}>
              {attractions.map((place, idx) => {
                return (
                  <Link key={idx} to={`/attractions/${place.slug}`} style={{ textDecoration: 'none' }}>
                    <div className={styles.placeCard}>
                      <div className={styles.placeImgWrapper}>
                        <img src={`${import.meta.env.VITE_BACKEND_URL}${place.image}`} alt={place.title} className={styles.placeImg} />
                        <div className={styles.placeTitleOverlay}>{place.title}</div>
                      </div>
                      <div className={styles.placeInfo}>
                        <h4 className={styles.placeSubTitle}>Explore {place.title}</h4>
                        <p className={styles.placeDesc}>- Location: {title}</p>
                        <span className={styles.readMore}>Read More</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* FAQs Section */}
        {faqs.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>FAQs</h2>
            <CreatorFaqs faqs={faqs} />
          </section>
        )}

      </main>

      {/* Customer Reviews (Full Width) */}
      <div className={styles.reviewsWrapper}>
        <div className={styles.mainContainer} style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
          <h2 className={styles.sectionTitle}>Travellers Reviews</h2>
          <div className={styles.reviewsMasonry}>
            {reviews.length > 0 ? reviews.map(review => (
              <div key={review._id || review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  {review.avatar ? (
                    <img src={review.avatar} alt={review.author} className={styles.avatarImg} />
                  ) : (
                    <div className={styles.avatarLetter}>
                      {review.author?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className={styles.reviewMeta}>
                    <div className={styles.reviewAuthor}>
                      {review.author} <span className={styles.privateTag}>private</span>
                    </div>
                    <div className={styles.reviewBooked}>
                      Booked: <strong>{title}</strong> ↗
                    </div>
                  </div>
                </div>
                <div className={styles.reviewRating}>
                  {'⭐'.repeat(review.rating || 5)} <span className={styles.reviewTime}>1 month ago</span>
                </div>
                  <p className={styles.reviewText}>
                    {review.review}
                  </p>
                  
                  <div className={styles.reviewPhotosGrid} style={{ gridTemplateColumns: (review.tripImages?.length > 0 ? review.tripImages : (review.tripImage ? [review.tripImage] : [])).length === 1 ? '1fr' : '1fr 1fr', display: (review.tripImages?.length > 0 ? review.tripImages : (review.tripImage ? [review.tripImage] : [])).length > 0 ? 'grid' : 'none' }}>
                    {(review.tripImages?.length > 0 ? review.tripImages : (review.tripImage ? [review.tripImage] : [])).slice(0, 4).map((img, i) => (
                      <img key={i} src={img} alt="Trip Memory" className={styles.reviewTripImg} />
                    ))}
                  </div>
                </div>
            )) : <p>No reviews yet for {title}.</p>}
          </div>
        </div>
      </div>

      {/* SEO Links Section */}
      <section className={styles.seoSection}>
        <div className={styles.seoContainer}>
          {popularCities.length > 0 && (
            <>
              <h3 className={styles.seoTitle}>{title} Tour Packages From Popular Cities</h3>
              <div className={styles.seoLinks}>
                {popularCities.map(city => (
                  <Link key={city} to="#" className={styles.seoLink}>
                    {title} Tour Packages From {city}
                  </Link>
                ))}
              </div>
            </>
          )}

          {domesticDestinations.length > 0 && (
            <>
              <h3 className={styles.seoTitle} style={{ marginTop: '3rem' }}>Popular Domestic Destinations</h3>
              <div className={styles.seoLinks}>
                {domesticDestinations.map(dest => (
                  <Link key={dest._id} to={`/destinations/${dest.slug || dest.name.toLowerCase().replace(/\s+/g, '-')}`} className={styles.seoLink}>
                    {dest.name}
                  </Link>
                ))}
              </div>
            </>
          )}

          {internationalDestinations.length > 0 && (
            <>
              <h3 className={styles.seoTitle} style={{ marginTop: '3rem' }}>Popular International Destinations</h3>
              <div className={styles.seoLinks}>
                {internationalDestinations.map(dest => (
                  <Link key={dest._id} to={`/destinations/${dest.slug || dest.name.toLowerCase().replace(/\s+/g, '-')}`} className={styles.seoLink}>
                    {dest.name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DestinationPage;
