import React, { useState, useEffect } from 'react';
import { getSiteSettings } from '../../services/api';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './DynamicPage.module.css';

const DynamicPage = ({ title, contentKey }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
    
    const fetchContent = async () => {
      try {
        const { data } = await getSiteSettings();
        if (data && data[contentKey]) {
          setContent(data[contentKey]);
        } else {
          setContent('Content not found.');
        }
      } catch (err) {
        console.error('Error fetching dynamic content:', err);
        setContent('Error loading content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, [contentKey]);

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.mainContent}>
        <div className={styles.headerArea}>
          <h1 className={styles.pageTitle}>{title}</h1>
        </div>
        <div className={styles.contentArea}>
          {loading ? (
            <div className={styles.loadingWrapper}>
              <div className={styles.spinner}></div>
            </div>
          ) : (
            <div 
              className={styles.textContent}
              dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DynamicPage;
