import React from 'react';
import { Link } from 'react-router-dom';
import styles from './BlogSection.module.css';
import { cleanImageUrl } from '../../utils/cleanUrl';

const BlogCard = ({ blog }) => {
  const blogSlug = blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  return (
    <Link to={`/blog/${blogSlug}`} style={{ textDecoration: 'none', color: 'inherit' }} target="_blank" rel="noopener noreferrer">
      <div className={styles.cardContainer}>
        <div className={styles.imageWrapper}>
          <img 
            src={cleanImageUrl(blog.image) || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80"} 
            alt={blog.title} 
            onError={(e) => e.target.src = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80"}
            className={styles.cardImage} 
          />
        </div>

        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>{blog.title}</h3>
          <p className={styles.cardExcerpt}>{blog.excerpt}</p>

          <div className={styles.authorFooter}>
            <img
              src={cleanImageUrl(blog.authorAvatar) || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"}
              alt={blog.author}
              onError={(e) => e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"}
              className={styles.authorAvatar}
            />
            <div className={styles.authorMeta}>
              <span className={styles.authorName}>by {blog.author}</span>
              <span className={styles.readTime}>{blog.readTime}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
