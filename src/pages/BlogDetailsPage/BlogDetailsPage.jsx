import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getBlogs } from '../../services/api';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './BlogDetailsPage.module.css';

const BlogDetailsPage = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const { data } = await getBlogs();
      // Match slug (title converted to slug format)
      const found = data.find(b =>
        b.title.toLowerCase().replace(/\s+/g, '-') === slug
      );
      setBlog(found);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>;
  if (!blog) return <div style={{ textAlign: 'center', padding: '100px' }}>Blog not found</div>;

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <main className={styles.mainContainer}>

        {/* Article Header */}
        <header className={styles.articleHeader}>
          <div className={styles.breadcrumb}>Blog / {blog.title}</div>
          <h1 className={styles.title}>{blog.title}</h1>
          <div className={styles.authorMeta}>
            <img
              src={blog.authorAvatar}
              alt={blog.author}
              className={styles.authorAvatar}
              style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '8px', objectFit: 'cover' }}
            />
            <span className={styles.authorName}>{blog.author}</span>
            <span className={styles.metaDot}>•</span>
            <span className={styles.date}>{new Date(blog.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
            <span className={styles.metaDot}>•</span>
            <span className={styles.readTime}>{blog.readTime}</span>
          </div>
        </header>

        {/* Article Content Builder */}
        <article className={styles.articleContent}>
          
          {/* Main Cover (from the blog schema) */}
          <figure className={styles.fullImageBlock} style={{ marginBottom: '30px' }}>
            <img src={blog.image} alt={blog.title} className={styles.image} />
          </figure>

          {/* Intro Excerpt */}
          <p className={styles.paragraph} style={{ fontSize: '1.2rem', fontWeight: '500', fontStyle: 'italic', color: '#555' }}>
            {blog.excerpt}
          </p>

          {/* Dynamic Content Blocks */}
          {blog.contentBlocks && blog.contentBlocks.map((block, idx) => {
            if (block.type === 'text') {
              return (
                <p key={idx} className={styles.paragraph}>
                  {block.content}
                </p>
              );
            }
            if (block.type === 'image-full') {
              return (
                <figure key={idx} className={styles.fullImageBlock}>
                  <img src={block.url} alt={block.caption || 'Blog image'} className={styles.image} />
                  {block.caption && <figcaption className={styles.caption}>{block.caption}</figcaption>}
                </figure>
              );
            }
            if (block.type === 'image-half') {
              return (
                <div key={idx} className={styles.halfImageGrid}>
                  {block.images && block.images.map((img, i) => (
                    <img key={i} src={img} alt={`Grid ${i}`} className={styles.image} />
                  ))}
                </div>
              );
            }
            if (block.type === 'image-grid') {
              return (
                <div key={idx} className={styles.twoByTwoGrid}>
                  {block.images && block.images.map((img, i) => (
                    <img key={i} src={img} alt={`Grid ${i}`} className={styles.image} />
                  ))}
                </div>
              );
            }
            return null;
          })}
        </article>

        {/* Published By Section */}
        <div className={styles.publishedBySection}>
          <h3 className={styles.publishedByTitle}>Published By</h3>
          <div className={styles.authorProfile}>
            <img 
              src={blog.authorAvatar} 
              alt={blog.author} 
              className={styles.authorAvatarLg} 
              style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div className={styles.authorDetails}>
              <h4 className={styles.authorNameBold}>{blog.author}</h4>
              <p className={styles.authorRole}>Content Creator</p>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default BlogDetailsPage;