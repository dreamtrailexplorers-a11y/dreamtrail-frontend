import React, { useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import styles from './CreatorFaqs.module.css';

const CreatorFaqs = ({ faqs }) => {
  const [expandedFaq, setExpandedFaq] = useState({});
  const [visibleCount, setVisibleCount] = useState(6);
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  if (!faqs || faqs.length === 0) return null;

  const toggleFaq = (index) => {
    setExpandedFaq((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  const visibleFaqs = faqs.slice(0, visibleCount);

  const toggleExpandAll = () => {
    const newState = !isAllExpanded;
    setIsAllExpanded(newState);
    
    if (newState) {
      // Expand all visible
      const allExpanded = {};
      visibleFaqs.forEach((_, idx) => {
        allExpanded[idx] = true;
      });
      setExpandedFaq(allExpanded);
    } else {
      // Collapse all
      setExpandedFaq({});
    }
  };

  return (
    <div className={styles.faqList}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
        <button 
          onClick={toggleExpandAll}
          style={{ 
            background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', 
            padding: '6px 12px', fontSize: '0.9rem', cursor: 'pointer', 
            display: 'flex', alignItems: 'center', gap: '5px',
            color: '#475569', fontWeight: '500'
          }}
        >
          {isAllExpanded ? 'Collapse All' : 'Expand All'}
        </button>
      </div>
      {visibleFaqs.map((faq, idx) => (
        <div key={idx} className={styles.faqCard}>
          <div className={styles.faqHeader} onClick={() => toggleFaq(idx)}>
            {expandedFaq[idx] ? <FiMinus className={styles.icon} /> : <FiPlus className={styles.icon} />}
            <span className={styles.faqQuestion}>{faq.q}</span>
          </div>
          {expandedFaq[idx] && (
            <div className={styles.faqBody}>
              <p>{faq.a}</p>
            </div>
          )}
        </div>
      ))}
      
      {faqs.length > visibleCount && (
        <div className={styles.loadMoreContainer}>
          <button className={styles.loadMoreBtn} onClick={handleLoadMore}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default CreatorFaqs;
