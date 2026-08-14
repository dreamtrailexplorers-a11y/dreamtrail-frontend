import React, { useState, useEffect } from 'react';
import { getBlogs } from '../../services/api';
import BlogCard from '../../components/BlogSection/BlogCard';
import styles from './BlogsPage.module.css';

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

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Our Blogs</h1>
        <p className={styles.subtitle}>Discover travel stories, tips, and insights.</p>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading blogs...</div>
      ) : blogsList.length === 0 ? (
        <div className={styles.noBlogs}>No blogs found.</div>
      ) : (
        <div className={styles.blogsGrid}>
          {blogsList.map(blog => (
            <BlogCard key={blog._id || blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogsPage;
