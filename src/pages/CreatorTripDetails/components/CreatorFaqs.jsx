import React, { useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import styles from './CreatorFaqs.module.css';

const CreatorFaqs = ({ faqs }) => {
  const [expandedFaq, setExpandedFaq] = useState({});
  const [visibleCount, setVisibleCount] = useState(6);

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

  return (
    <div className={styles.faqList}>
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
