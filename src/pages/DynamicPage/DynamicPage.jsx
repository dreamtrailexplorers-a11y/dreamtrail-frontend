import React, { useState, useEffect } from 'react';
import { getSiteSettings } from '../../services/api';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './DynamicPage.module.css';

const DynamicPage = ({ title, blocksKey }) => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
    
    const fetchContent = async () => {
      try {
        const { data } = await getSiteSettings();
        if (data && data[blocksKey]) {
          setBlocks(data[blocksKey]);
        } else {
          setBlocks([{ blockType: 'text', content: 'Content not found.' }]);
        }
      } catch (err) {
        console.error('Error fetching dynamic content:', err);
        setBlocks([{ blockType: 'text', content: 'Error loading content. Please try again later.' }]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, [blocksKey]);

  
  const renderFormattedText = (text) => {
    if (!text) return null;
    
    // First, try to fix missing newlines before ## if user forgot them
    let cleanText = text.replace(/([^\n])(##+ )/g, '$1\n\n$2');
    
    // Split by newlines
    const paragraphs = cleanText.split(/\n+/);
    
    return paragraphs.map((para, i) => {
      para = para.trim();
      if (!para) return null;
      
      if (para.startsWith('## ')) {
        return <h2 key={i} className={styles.manifestoHeading}>{para.replace('## ', '')}</h2>;
      }
      if (para.startsWith('### ')) {
        return <h3 key={i} className={styles.manifestoSubheading}>{para.replace('### ', '')}</h3>;
      }
      if (para.startsWith('- ') || para.startsWith('* ') || para.startsWith('• ')) {
        const bulletText = para.substring(2).trim();
        const parts = bulletText.split(/(\*\*.*?\*\*)/g);
        return (
          <div key={i} className={styles.manifestoBullet}>
             <span className={styles.bulletIcon}>•</span>
             <span>
              {parts.map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={j}>{part.slice(2, -2)}</strong>;
                }
                return part;
              })}
             </span>
          </div>
        );
      }
      
      // Parse bold **text**
      const parts = para.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className={styles.manifestoParagraph}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

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
            <div className={styles.textContent}>
              {blocks.map((block, index) => {
                if (block.blockType === 'title') {
                  return <h2 key={index} className={styles.manifestoHeading}>{block.content}</h2>;
                }
                if (block.blockType === 'subtitle') {
                  return <h3 key={index} className={styles.manifestoSubheading}>{block.content}</h3>;
                }
                if (block.blockType === 'point') {
                  const parts = block.content.split(/(\*\*.*?\*\*)/g);
                  return (
                    <div key={index} className={styles.manifestoBullet}>
                       <span className={styles.bulletIcon}>•</span>
                       <span>
                        {parts.map((part, j) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j}>{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                       </span>
                    </div>
                  );
                }
                if (block.blockType === 'text') {
                  const cleanText = block.content.replace(/([^\n])(##+ )/g, '$1\n\n$2');
                  const paragraphs = cleanText.split(/\n+/);
                  return paragraphs.map((para, i) => {
                    para = para.trim();
                    if (!para) return null;
                    const parts = para.split(/(\*\*.*?\*\*)/g);
                    return (
                      <p key={`${index}-${i}`} className={styles.manifestoParagraph}>
                        {parts.map((part, j) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j}>{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                      </p>
                    );
                  });
                }
                return null;
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DynamicPage;
