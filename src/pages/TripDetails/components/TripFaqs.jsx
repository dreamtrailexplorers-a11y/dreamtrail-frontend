import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import styles from './TripFaqs.module.css';

const TripFaqs = ({ faqs }) => {
  const [expandedFaq, setExpandedFaq] = useState({});

  const toggleFaq = (index) => {
    setExpandedFaq((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className={styles.sectionBlock}>
      <h2 className={styles.blockTitle}>FAQs</h2>
      <div className={styles.faqList}>
        {faqs.map((faq, idx) => (
          <div key={idx} className={styles.faqCard}>
            <div className={styles.faqHeader} onClick={() => toggleFaq(idx)}>
              <span>? {faq.q}</span>
              {expandedFaq[idx] ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            {expandedFaq[idx] && (
              <div className={styles.faqBody}>
                <p>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripFaqs;
