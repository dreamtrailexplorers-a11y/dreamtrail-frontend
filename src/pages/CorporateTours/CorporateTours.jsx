import React, { useState, useEffect } from 'react';
import { getSiteSettings, submitEnquiry } from '../../services/api';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Loader from '../../components/Loader/Loader';
import { FiCheckCircle, FiShield, FiSliders, FiUsers, FiCoffee, FiCamera, FiFileText } from 'react-icons/fi';
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
    phone: '',
    email: '',
    teamSize: '',
    budget: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getSiteSettings();
      setData(res.data.corporateTours);
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
      alert('Enquiry submitted successfully! Our team will contact you soon.');
      setFormData({ name: '', phone: '', email: '', teamSize: '', budget: '', message: '' });
    } catch (err) {
      alert('Failed to submit enquiry. Please try again.');
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
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle} style={{ whiteSpace: 'pre-line' }}>{data.statsTitle}</h2>
          <p className={styles.sectionSubtitle}>{data.statsText}</p>
          <div className={styles.statsGrid}>
            {data.stats && data.stats.map((stat, idx) => (
              <div key={idx} className={styles.statCard}>
                <div className={styles.statNumber}>{stat.number}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className={styles.container}>
        <h2 className={styles.sectionTitle}>{data.featuresTitle}</h2>
        <p className={styles.sectionSubtitle}>{data.featuresText}</p>
        <div className={styles.featuresGrid}>
          {data.features && data.features.map((feature, idx) => (
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

      {/* OFFERINGS SECTION */}
      <section className={styles.offeringsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{data.offeringsTitle}</h2>
          <p className={styles.sectionSubtitle}>{data.offeringsText}</p>
          <div className={styles.offeringsGrid}>
            {data.offerings && data.offerings.map((offering, idx) => (
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

      {/* GALLERY & VIDEO SECTION */}
      <section className={styles.container}>
        <h2 className={styles.sectionTitle}>{data.galleryTitle}</h2>
        <p className={styles.sectionSubtitle}>{data.galleryText}</p>
        <div className={styles.galleryGrid} style={{ marginBottom: '60px' }}>
          {data.galleryImages && data.galleryImages.map((img, idx) => (
            <img key={idx} src={img} alt="Gallery" className={styles.galleryImage} />
          ))}
        </div>
        
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

      {/* STEPS SECTION */}
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{data.stepsTitle}</h2>
          <p className={styles.sectionSubtitle}>{data.stepsText}</p>
          
          <div className={styles.stepsContainer}>
            <div className={styles.stepLine}></div>
            {data.steps && data.steps.map((step, idx) => (
              <div key={idx} className={styles.stepCard}>
                <div className={styles.stepNumber}>{idx + 1}</div>
                <h4 className={styles.stepTitle}>{step.title}</h4>
                <p className={styles.stepText}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className={styles.container}>
        <h2 className={styles.sectionTitle}>{data.testimonialsTitle}</h2>
        <div className={styles.testimonialsGrid} style={{ marginTop: '40px' }}>
          {data.testimonials && data.testimonials.map((testi, idx) => (
            <div key={idx} className={styles.testiCard}>
              <div className={styles.testiText}>"{testi.text}"</div>
              <div className={styles.testiAuthor}>{testi.name}</div>
              <div className={styles.testiRole}>{testi.designation}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FORM SECTION */}
      <section className={styles.formSection}>
        <div className={styles.container}>
          <div className={styles.formLayout}>
            <div className={styles.formLeft}>
              <h2 className={styles.sectionTitle} style={{ textAlign: 'left' }}>{data.formTitle}</h2>
              <p className={styles.sectionSubtitle} style={{ textAlign: 'left', margin: '0 0 20px 0' }}>{data.formText}</p>
              <ul className={styles.bulletList}>
                {data.formPoints && data.formPoints.map((point, idx) => (
                  <li key={idx} className={styles.bulletItem}>
                    <FiCheckCircle className={styles.bulletIcon} size={24} />
                    {point.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.formRight}>
              <form onSubmit={handleSubmit} className={styles.formGrid}>
                <div className={styles.formGroupFull}>
                  <label>Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className={styles.inputField} placeholder="John Doe" />
                </div>
                <div>
                  <label>Phone Number *</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} required className={styles.inputField} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div>
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={styles.inputField} placeholder="john@company.com" />
                </div>
                <div>
                  <label>Team Size</label>
                  <input type="text" name="teamSize" value={formData.teamSize} onChange={handleInputChange} className={styles.inputField} placeholder="e.g. 20-30 people" />
                </div>
                <div>
                  <label>Budget</label>
                  <input type="text" name="budget" value={formData.budget} onChange={handleInputChange} className={styles.inputField} placeholder="e.g. INR 2 Lakhs" />
                </div>
                <div className={styles.formGroupFull}>
                  <label>Additional Requirements</label>
                  <textarea name="message" value={formData.message} onChange={handleInputChange} className={styles.inputField} rows="4" placeholder="Tell us more about your ideal trip..."></textarea>
                </div>
                <div className={styles.formGroupFull}>
                  <button type="submit" disabled={submitting} className={styles.submitBtn}>
                    {submitting ? 'Submitting...' : 'Request a Proposal'}
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
