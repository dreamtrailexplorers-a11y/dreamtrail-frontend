import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import BlogCard from './BlogCard';
import { getBlogs } from '../../services/api';
import styles from './BlogSection.module.css';

const BlogSection = () => {
  const [blogsList, setBlogsList] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await getBlogs();
        setBlogsList(data);
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      }
    };
    fetchBlogs();
  }, []);

  if (blogsList.length === 0) return null;

  return (
    <section className={styles.blogSection}>
      <h2 className={styles.sectionTitle}>Blogs</h2>
      <div className={styles.sliderContainer}>
        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          navigation
          breakpoints={{
            640: { slidesPerView: 2 },
            900: { slidesPerView: 3 },
            1200: { slidesPerView: 4 }
          }}
        >
          {blogsList.map((blog) => (
            <SwiperSlide key={blog._id || blog.id}>
              <BlogCard blog={blog} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default BlogSection;
