import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

const DynamicCustomPage = () => {
  const { slug } = useParams();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/custom-pages/${slug}`);
        setPageData(res.data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Page not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '100px 20px', textAlign: 'center', minHeight: '60vh' }}>
          <h2>Loading...</h2>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !pageData) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '100px 20px', textAlign: 'center', minHeight: '60vh' }}>
          <h2>404 - Page Not Found</h2>
          <p>The page you are looking for does not exist.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: '120px 20px 60px', maxWidth: '1000px', margin: '0 auto', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '40px', color: '#1e293b', textAlign: 'center' }}>
          {pageData.title}
        </h1>

        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {pageData.blocks && pageData.blocks.map((block, idx) => {
            switch (block.type) {
              case 'text':
                return (
                  <div key={idx} style={{ color: '#475569', lineHeight: '1.8', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                    {block.content}
                  </div>
                );
              
              case 'full-image':
                return (
                  <div key={idx} style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <img 
                      src={block.imageUrl1?.startsWith('http') ? block.imageUrl1 : `${import.meta.env.VITE_BACKEND_URL}${block.imageUrl1}`} 
                      alt="Full Width" 
                      style={{ width: '100%', height: 'auto', display: 'block' }} 
                    />
                  </div>
                );

              case 'half-images':
                return (
                  <div key={idx} style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 300px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                      <img 
                        src={block.imageUrl1?.startsWith('http') ? block.imageUrl1 : `${import.meta.env.VITE_BACKEND_URL}${block.imageUrl1}`} 
                        alt="Half 1" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                      />
                    </div>
                    <div style={{ flex: '1 1 300px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                      <img 
                        src={block.imageUrl2?.startsWith('http') ? block.imageUrl2 : `${import.meta.env.VITE_BACKEND_URL}${block.imageUrl2}`} 
                        alt="Half 2" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                      />
                    </div>
                  </div>
                );

              case 'point-title-text':
                return (
                  <div key={idx} style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
                    <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginBottom: '15px' }}>{block.title}</h3>
                    <div style={{ color: '#475569', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                      {block.content}
                    </div>
                  </div>
                );

              default:
                return null;
            }
          })}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DynamicCustomPage;
