import React from 'react';
import { Link } from 'react-router-dom';
import styles from './BlogSection.module.css';
import { cleanImageUrl } from '../../utils/cleanUrl';

const BlogCard = ({ blog }) => {
  const blogSlug = blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const imageUrl = cleanImageUrl(blog.image)?.trim();
  const authorAvatarUrl = cleanImageUrl(blog.authorAvatar)?.trim();

  return (
    <Link to={`/blog/${blogSlug}`} style={{ textDecoration: 'none', color: 'inherit' }} target="_blank" rel="noopener noreferrer">
      <div className={styles.cardContainer}>
        <div className={styles.imageWrapper} style={{ backgroundColor: '#f1f5f9' }}>
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt={blog.title} 
              onError={(e) => { e.target.style.display = 'none'; }}
              className={styles.cardImage} 
            />
          )}
        </div>

        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>{blog.title}</h3>
          <p className={styles.cardExcerpt}>{blog.excerpt}</p>

          <div className={styles.authorFooter}>
            {authorAvatarUrl ? (
              <img
                src={authorAvatarUrl}
                alt={blog.author}
                onError={(e) => { e.target.style.display = 'none'; }}
                className={styles.authorAvatar}
              />
            ) : (
              <div 
                className={styles.authorAvatar} 
                style={{ 
                  backgroundColor: '#e2e8f0', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '0.8rem', 
                  fontWeight: 600, 
                  color: '#64748b' 
                }}
              >
                {blog.author ? blog.author.trim().charAt(0).toUpperCase() : 'U'}
              </div>
            )}
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
