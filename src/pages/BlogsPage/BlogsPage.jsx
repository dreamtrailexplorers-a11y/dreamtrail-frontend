import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBlogs } from '../../services/api';
import BlogCard from '../../components/BlogSection/BlogCard';
import styles from './BlogsPage.module.css';
import { cleanImageUrl } from '../../utils/cleanUrl';

const BlogsPage = () => {
  const [blogsList, setBlogsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await getBlogs();
        setBlogsList(data);
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const featuredBlog = blogsList.length > 0 ? blogsList[0] : null;
  const regularBlogs = blogsList.length > 1 ? blogsList.slice(1) : [];

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <span className={styles.categoryBadge}>Stories & Tips</span>
          <h1 className={styles.heroTitle}>Our <span className={styles.highlight}>Blogs</span></h1>
          <p className={styles.heroSubtitle}>
            Dive into the world of adventure. Discover travel stories, expert tips, and unforgettable experiences from our riders.
          </p>
        </div>
      </div>

      <div className={styles.contentContainer}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading latest stories...</p>
          </div>
        ) : blogsList.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No blogs published yet. Check back soon for new adventures!</p>
          </div>
        ) : (
          <>
            {/* Featured Blog */}
            {featuredBlog && (
              <div className={styles.featuredSection}>
                <h2 className={styles.sectionHeading}>Featured Post</h2>
                <Link 
                  to={`/blog/${featuredBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}`} 
                  className={styles.featuredCard}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <div className={styles.featuredImageWrapper}>
                    <img 
                      src={cleanImageUrl(featuredBlog.image) || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80"} 
                      alt={featuredBlog.title} 
                      className={styles.featuredImage} 
                    />
                    <div className={styles.featuredOverlay}></div>
                  </div>
                  <div className={styles.featuredInfo}>
                    <div className={styles.featuredMeta}>
                      <span className={styles.featuredDate}>{new Date(featuredBlog.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      <span className={styles.featuredReadTime}>{featuredBlog.readTime}</span>
                    </div>
                    <h3 className={styles.featuredTitle}>{featuredBlog.title}</h3>
                    <p className={styles.featuredExcerpt}>{featuredBlog.excerpt}</p>
                    <div className={styles.featuredAuthor}>
                      <img
                        src={cleanImageUrl(featuredBlog.authorAvatar) || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"}
                        alt={featuredBlog.author}
                        className={styles.authorAvatar}
                      />
                      <span className={styles.authorName}>by {featuredBlog.author}</span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Regular Blogs Grid */}
            {regularBlogs.length > 0 && (
              <div className={styles.gridSection}>
                <h2 className={styles.sectionHeading}>More Articles</h2>
                <div className={styles.blogsGrid}>
                  {regularBlogs.map(blog => (
                    <BlogCard key={blog._id || blog.id} blog={blog} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;
