import React, { useState, useEffect } from 'react';
import { getSiteSettings, submitEnquiry, getDestinations } from '../../services/api';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Loader from '../../components/Loader/Loader';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiShield, FiSliders, FiUsers, FiCoffee, FiCamera, FiFileText, FiPhoneCall, FiMessageCircle, FiMail, FiMapPin } from 'react-icons/fi';
import styles from './CorporateTours.module.css';

const IconMap = {
  FiShield: <FiShield />,
  FiSliders: <FiSliders />,
  FiUsers: <FiUsers />,
  FiCoffee: <FiCoffee />,
  FiCamera: <FiCamera />,
  FiFileText: <FiFileText />
};

const CorporateTours = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    teamSize: '',
    destination: '',
    tripType: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [destinationsList, setDestinationsList] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, destRes] = await Promise.all([
        getSiteSettings(),
        getDestinations()
      ]);
      setData(settingsRes.data.corporateTours);
      setDestinationsList(destRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitEnquiry({
        ...formData,
        tripTitle: 'Corporate Tour Enquiry',
        status: 'New'
      });
      toast.success('Enquiry submitted successfully! Our team will contact you soon.');
      setFormData({ name: '', companyName: '', email: '', phone: '', teamSize: '', destination: '', tripType: '', message: '' });
    } catch (err) {
      toast.error('Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullScreen={true} />;
  if (!data) return <div>Failed to load data</div>;

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      
      {/* HERO SECTION */}
      <section className={styles.heroSection} style={{ backgroundImage: `url(${data.heroImage})` }}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{data.heroTitle}</h1>
          <h2 className={styles.heroSubtitle}>{data.heroSubtitle}</h2>
        </div>
      </section>

      {/* STATS SECTION */}
      {data.stats && data.stats.length > 0 && (
        <section className={styles.statsSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle} style={{ whiteSpace: 'pre-line' }}>{data.statsTitle}</h2>
            <p className={styles.sectionSubtitle}>{data.statsText}</p>
            <div className={styles.statsGrid}>
              {data.stats.map((stat, idx) => (
                <div key={idx} className={styles.statCard}>
                  <div className={styles.statNumber}>{stat.number}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURES SECTION */}
      {data.features && data.features.length > 0 && (
        <section className={styles.container}>
          <h2 className={styles.sectionTitle}>{data.featuresTitle}</h2>
          <p className={styles.sectionSubtitle}>{data.featuresText}</p>
          <div className={styles.featuresGrid}>
            {data.features.map((feature, idx) => (
              <div key={idx} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  {IconMap[feature.icon] || <FiCheckCircle />}
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureText}>{feature.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* OFFERINGS SECTION */}
      {data.offerings && data.offerings.length > 0 && (
        <section className={styles.offeringsSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{data.offeringsTitle}</h2>
            <p className={styles.sectionSubtitle}>{data.offeringsText}</p>
            <div className={styles.offeringsGrid}>
              {data.offerings.map((offering, idx) => (
                <div key={idx} className={styles.offeringCard}>
                  <div className={styles.offeringBg} style={{ backgroundImage: `url(${offering.image})` }}></div>
                  <div className={styles.offeringOverlay}></div>
                  <div className={styles.offeringContent}>
                    <div className={styles.offeringTitle}>{offering.title}</div>
                    <div className={styles.offeringText}>{offering.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GALLERY & VIDEO SECTION */}
      {(data.galleryImages?.length > 0 || data.videoUrl) && (
        <section className={styles.container}>
          {data.galleryImages?.length > 0 && (
            <>
              <h2 className={styles.sectionTitle}>{data.galleryTitle}</h2>
              <p className={styles.sectionSubtitle}>{data.galleryText}</p>
              <div className={styles.galleryGrid} style={{ marginBottom: '60px' }}>
                {data.galleryImages.map((img, idx) => (
                  <img key={idx} src={img} alt="Gallery" className={styles.galleryImage} />
                ))}
              </div>
            </>
          )}
          
          {data.videoUrl && (
            <div className={styles.videoContainer}>
              <iframe 
                src={data.videoUrl} 
                title="YouTube video player" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen>
              </iframe>
            </div>
          )}
        </section>
      )}

      {/* STEPS SECTION */}
      {data.steps && data.steps.length > 0 && (
        <section className={styles.statsSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{data.stepsTitle}</h2>
            <p className={styles.sectionSubtitle}>{data.stepsText}</p>
            
            <div className={styles.stepsContainer}>
              <div className={styles.stepLine}></div>
              {data.steps.map((step, idx) => (
                <div key={idx} className={styles.stepCard}>
                  <div className={styles.stepNumber}>{idx + 1}</div>
                  <h4 className={styles.stepTitle}>{step.title}</h4>
                  <p className={styles.stepText}>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS SECTION */}
      {data.testimonials && data.testimonials.length > 0 && (
        <section className={styles.container}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ color: '#d32f2f', border: '1px solid #d32f2f', padding: '4px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>TESTIMONIALS</span>
            <h2 className={styles.sectionTitle} style={{ marginTop: '15px', fontSize: '2.5rem' }}>
              {data.testimonialsTitle?.split('Say About Us')[0]}<span style={{ color: '#d32f2f' }}>Say About Us</span>
            </h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginTop: '40px' }}>
            {data.testimonials.map((testi, idx) => {
              const initials = testi.name ? testi.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'U';
              return (
                <div key={idx} style={{ background: '#fff', padding: '35px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: idx === 0 ? '1px solid #d32f2f' : '1px solid #f1f5f9', position: 'relative' }}>
                  <div style={{ color: '#d32f2f', marginBottom: '20px', fontSize: '1.1rem', letterSpacing: '3px' }}>★★★★★</div>
                  <p style={{ fontStyle: 'italic', color: '#475569', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '30px' }}>"{testi.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#d32f2f', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{testi.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{testi.designation}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '40px' }}>
            <button style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer' }}>←</button>
            <button style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer' }}>→</button>
          </div>
        </section>
      )}

      {/* FORM SECTION */}
      <section style={{ backgroundColor: '#fafafa', padding: '80px 0', marginTop: '60px' }}>
        <div className={styles.container}>
          <div className={styles.contactLayout}>
            {/* Left Info */}
            <div>
              <span style={{ color: '#d32f2f', border: '1px solid #d32f2f', padding: '4px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>GET IN TOUCH</span>
              <h2 style={{ textAlign: 'left', marginTop: '20px', fontSize: '3rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                Let's Plan Your <span style={{ color: '#d32f2f' }}>Team's<br/>Adventure</span>
              </h2>
              <p style={{ textAlign: 'left', margin: '25px 0', color: '#475569', fontSize: '1.05rem', lineHeight: 1.6 }}>
                Fill in the form and our corporate travel specialist will reach out within 24 hours with a customised proposal. No obligations, no templates — just a plan built for your team.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '10px', backgroundColor: '#fee2e2', color: '#d32f2f', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem', flexShrink: 0 }}><FiPhoneCall /></div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Call Us</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem', whiteSpace: 'pre-line' }}>{data.contactPhone || '+91 98980 36338\n+91 98985 54465'}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '10px', backgroundColor: '#fee2e2', color: '#d32f2f', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem', flexShrink: 0 }}><FiMessageCircle /></div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>WhatsApp</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>{data.contactWhatsapp || '+91 98985 54465'}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '10px', backgroundColor: '#fee2e2', color: '#d32f2f', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem', flexShrink: 0 }}><FiMail /></div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Email</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>{data.contactEmail || 'info@dreamridersmototouring.com'}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '10px', backgroundColor: '#fee2e2', color: '#d32f2f', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem', flexShrink: 0 }}><FiMapPin /></div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Location</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>{data.contactLocation || 'Ahmedabad, Gujarat, India'}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Form */}
            <div style={{ background: '#fff', padding: '45px', borderRadius: '20px', boxShadow: '0 15px 50px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 10px 0', color: '#0f172a' }}>Request a Corporate Proposal</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '35px' }}>We'll send you a personalised itinerary within 24–48 hours.</p>
              
              <form onSubmit={handleSubmit} className={styles.contactFormGrid}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: '8px', letterSpacing: '1px' }}>Your Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: '8px', letterSpacing: '1px' }}>Company Name *</label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} required style={{ width: '100%', padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: '8px', letterSpacing: '1px' }}>Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required style={{ width: '100%', padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: '8px', letterSpacing: '1px' }}>Phone Number *</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} required style={{ width: '100%', padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: '8px', letterSpacing: '1px' }}>Team Size *</label>
                  <select name="teamSize" value={formData.teamSize} onChange={handleInputChange} required style={{ width: '100%', padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', background: '#fff', outline: 'none', appearance: 'auto' }}>
                    <option value="">Select size</option>
                    <option value="1-10">1-10 people</option>
                    <option value="11-20">11-20 people</option>
                    <option value="21-50">21-50 people</option>
                    <option value="50+">50+ people</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: '8px', letterSpacing: '1px' }}>Preferred Destination</label>
                  <select name="destination" value={formData.destination} onChange={handleInputChange} style={{ width: '100%', padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', background: '#fff', outline: 'none', appearance: 'auto' }}>
                    <option value="">Select destination</option>
                    {destinationsList.map((dest) => (
                      <option key={dest._id} value={dest.name}>{dest.name}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: '8px', letterSpacing: '1px' }}>Trip Type</label>
                  <select name="tripType" value={formData.tripType} onChange={handleInputChange} style={{ width: '100%', padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', background: '#fff', outline: 'none', appearance: 'auto' }}>
                    <option value="">Select type</option>
                    <option value="Signature Adventure">Signature Adventure</option>
                    <option value="Incentive">Incentive</option>
                    <option value="MICE">MICE</option>
                    <option value="Team Outing">Team Outing</option>
                  </select>
                </div>
                
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: '8px', letterSpacing: '1px' }}>Message</label>
                  <textarea name="message" value={formData.message} onChange={handleInputChange} rows="3" style={{ width: '100%', padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }}></textarea>
                </div>
                
                <div style={{ gridColumn: '1 / -1' }}>
                  <button type="submit" disabled={submitting} style={{ width: '100%', padding: '16px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', marginTop: '15px', transition: 'background 0.3s' }}>
                    {submitting ? 'Submitting...' : 'Send Enquiry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CorporateTours;
