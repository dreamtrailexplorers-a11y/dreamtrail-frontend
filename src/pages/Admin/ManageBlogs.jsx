import React, { useState, useEffect } from 'react';
import { getBlogs, createBlog, updateBlog, deleteBlog, uploadFile } from '../../services/api';
import styles from './Admin.module.css';

const ManageBlogs = () => {
  const initialForm = {
    title: '', author: '', authorAvatar: '', readTime: '', image: '', excerpt: '', contentBlocks: []
  };
  const [blogs, setBlogs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [showFullForm, setShowFullForm] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    const mainContent = document.getElementById('admin-main-content');
    if (showFullForm) {
      if (mainContent) mainContent.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      if (mainContent) mainContent.style.overflow = 'auto';
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      if (mainContent) mainContent.style.overflow = 'auto';
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [showFullForm]);

  const fetchBlogs = async () => {
    try {
      const { data } = await getBlogs();
      setBlogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUploadMainImage = async (e, fieldName) => {
    const file = e.target.files[0];
    if(!file) return;
    try {
      const res = await uploadFile(file);
      const fullUrl = `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      setFormData({ ...formData, [fieldName]: fullUrl });
    } catch(err) {
      alert('Upload failed');
    }
  };

  const handleUploadBlockImage = async (e, index, field, arrayIndex = null) => {
    const file = e.target.files[0];
    if(!file) return;
    try {
      const res = await uploadFile(file);
      const fullUrl = `${import.meta.env.VITE_BACKEND_URL}${res.data.url}`;
      if (arrayIndex !== null) {
        const updatedBlocks = [...formData.contentBlocks];
        const newImages = [...(updatedBlocks[index].images || ['', ''])];
        newImages[arrayIndex] = fullUrl;
        updatedBlocks[index].images = newImages;
        setFormData({ ...formData, contentBlocks: updatedBlocks });
      } else {
        handleBlockChange(index, field, fullUrl);
      }
    } catch(err) {
      alert('Upload failed');
    }
  };

  const handleBlockChange = (index, field, value) => {
    const updatedBlocks = [...formData.contentBlocks];
    updatedBlocks[index][field] = value;
    setFormData({ ...formData, contentBlocks: updatedBlocks });
  };

  const handleAddBlock = () => {
    setFormData({
      ...formData,
      contentBlocks: [...formData.contentBlocks, { type: 'text', content: '', url: '', caption: '', images: ['', ''] }]
    });
  };

  const handleRemoveBlock = (index) => {
    setFormData({
      ...formData,
      contentBlocks: formData.contentBlocks.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateBlog(editingId, formData);
    } else {
      await createBlog(formData);
    }
    fetchBlogs();
    setFormData(initialForm);
    setEditingId(null);
    setShowFullForm(false);
  };

  const handleEdit = (blog) => {
    setEditingId(blog._id);
    setFormData({
      title: blog.title || '',
      author: blog.author || '',
      authorAvatar: blog.authorAvatar || '',
      readTime: blog.readTime || '',
      image: blog.image || '',
      excerpt: blog.excerpt || '',
      contentBlocks: blog.contentBlocks || []
    });
    setShowFullForm(true);
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure?")) {
      await deleteBlog(id);
      fetchBlogs();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 className={styles.pageHeader} style={{ marginBottom: '0' }}>Manage Blogs</h2>
          <p style={{ color: '#64748b', marginTop: '5px' }}>Create and manage your articles and guides.</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData(initialForm); setShowFullForm(true); }} 
          className={styles.btnPrimary}
        >
          + Add Blog
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {blogs.map(blog => (
          <div key={blog._id} className={styles.card} style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ height: '160px', backgroundColor: '#e2e8f0', backgroundImage: `url(${blog.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              {!blog.image && <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No Image</div>}
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '1.1rem', lineHeight: '1.4' }}>{blog.title}</h4>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                {blog.authorAvatar ? (
                  <img src={blog.authorAvatar} alt="author" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#cbd5e1' }}></div>
                )}
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{blog.author || 'Unknown'} &bull; {blog.readTime || '5 min'}</span>
              </div>
              
              <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#475569', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {blog.excerpt}
              </p>

              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                <button onClick={() => handleEdit(blog)} className={styles.btnSecondary} style={{ flex: 1 }}>Edit</button>
                <button onClick={() => handleDelete(blog._id)} className={styles.btnDanger} style={{ flex: 1 }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {blogs.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#64748b' }}>No Blogs found. Click "Add Blog" to write your first post.</p>
          </div>
        )}
      </div>

      {showFullForm && (
        <div className={styles.modalOverlay} onClick={() => { setShowFullForm(false); setEditingId(null); }} style={{ padding: '20px', zIndex: 1100 }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '100%', maxHeight: '95vh', overflowY: 'auto', padding: 0 }}>
            {/* Modal Header */}
            <div style={{ position: 'sticky', top: 0, backgroundColor: '#ffffff', zIndex: 10, padding: '20px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px 16px 0 0' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>
                {editingId ? `Edit Blog` : 'Create New Blog'}
              </h3>
              <button onClick={() => setShowFullForm(false)} className={styles.btnDanger} style={{ padding: '6px 16px' }}>Close</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '30px', backgroundColor: '#f8fafc' }}>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Title</label>
                    <input name="title" value={formData.title} onChange={handleChange} placeholder="Blog Title" required className={styles.inputField} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Author</label>
                    <input name="author" value={formData.author} onChange={handleChange} placeholder="Author Name" required className={styles.inputField} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Author Avatar URL</label>
                    <div className={styles.responsiveFlexRow}>
                      <label style={{ cursor: 'pointer', background: '#3498db', color: 'white', padding: '8px 15px', borderRadius: '8px', fontSize: '0.9rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                        Upload
                        <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleUploadMainImage(e, 'authorAvatar')} />
                      </label>
                      <input name="authorAvatar" value={formData.authorAvatar} onChange={handleChange} placeholder="Author Avatar URL" className={styles.inputField} style={{ flex: 1, backgroundColor: '#ffffff' }} />
                    </div>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Read Time</label>
                    <input name="readTime" value={formData.readTime} onChange={handleChange} placeholder="Read Time (e.g. 5 min read)" required className={styles.inputField} />
                  </div>
                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.inputLabel}>Main Image URL</label>
                    <div className={styles.responsiveFlexRow}>
                      <label style={{ cursor: 'pointer', background: '#3498db', color: 'white', padding: '8px 15px', borderRadius: '8px', fontSize: '0.9rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                        Upload
                        <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleUploadMainImage(e, 'image')} />
                      </label>
                      <input name="image" value={formData.image} onChange={handleChange} placeholder="Main Cover Image URL" required className={styles.inputField} style={{ flex: 1, backgroundColor: '#ffffff' }} />
                    </div>
                  </div>
                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.inputLabel}>Excerpt</label>
                    <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} placeholder="Short summary" required className={styles.textareaField} />
                  </div>
                </div>

                <div className={styles.card} style={{ marginTop: '20px', padding: '20px' }}>
                  <h4 className={styles.cardTitle} style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Content Blocks</h4>
                  {formData.contentBlocks.map((block, index) => (
                    <div key={index} style={{ border: '1px dashed #cbd5e1', padding: '20px', marginBottom: '20px', borderRadius: '12px', background: '#ffffff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                        <strong style={{ color: '#475569' }}>Block {index + 1} - {block.type}</strong>
                        <button type="button" onClick={() => handleRemoveBlock(index)} className={styles.btnDanger} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Remove</button>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <select 
                          value={block.type} 
                          onChange={(e) => handleBlockChange(index, 'type', e.target.value)}
                          className={styles.inputField}
                        >
                          <option value="text">Text Paragraph</option>
                          <option value="image-full">Full Width Image</option>
                          <option value="image-half">Two Half Images</option>
                        </select>

                        {block.type === 'text' && (
                          <textarea 
                            value={block.content || ''} 
                            onChange={(e) => handleBlockChange(index, 'content', e.target.value)} 
                            placeholder="Enter text content here..." 
                            className={styles.textareaField}
                            style={{ minHeight: '150px' }}
                          />
                        )}

                        {block.type === 'image-full' && (
                          <>
                            <div className={styles.responsiveFlexRow}>
                              <label style={{ cursor: 'pointer', background: '#3498db', color: 'white', padding: '8px 15px', borderRadius: '8px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                                Upload
                                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleUploadBlockImage(e, index, 'url')} />
                              </label>
                              <input 
                                value={block.url || ''} 
                                onChange={(e) => handleBlockChange(index, 'url', e.target.value)} 
                                placeholder="Image URL" 
                                className={styles.inputField}
                                style={{ flex: 1, backgroundColor: '#f9f9f9' }}
                              />
                            </div>
                            <input 
                              value={block.caption || ''} 
                              onChange={(e) => handleBlockChange(index, 'caption', e.target.value)} 
                              placeholder="Image Caption (Optional)" 
                              className={styles.inputField}
                            />
                          </>
                        )}

                        {block.type === 'image-half' && (
                          <>
                            <div className={styles.responsiveFlexRow}>
                              <label style={{ cursor: 'pointer', background: '#3498db', color: 'white', padding: '8px 15px', borderRadius: '8px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                                Upload 1
                                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleUploadBlockImage(e, index, 'images', 0)} />
                              </label>
                              <input 
                                value={block.images?.[0] || ''} 
                                onChange={(e) => {
                                  const newImages = [...(block.images || ['', ''])];
                                  newImages[0] = e.target.value;
                                  handleBlockChange(index, 'images', newImages);
                                }} 
                                placeholder="First Image URL" 
                                className={styles.inputField}
                                style={{ flex: 1, backgroundColor: '#f9f9f9' }}
                              />
                            </div>
                            <div className={styles.responsiveFlexRow}>
                              <label style={{ cursor: 'pointer', background: '#3498db', color: 'white', padding: '8px 15px', borderRadius: '8px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                                Upload 2
                                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleUploadBlockImage(e, index, 'images', 1)} />
                              </label>
                              <input 
                                value={block.images?.[1] || ''} 
                                onChange={(e) => {
                                  const newImages = [...(block.images || ['', ''])];
                                  newImages[1] = e.target.value;
                                  handleBlockChange(index, 'images', newImages);
                                }} 
                                placeholder="Second Image URL" 
                                className={styles.inputField}
                                style={{ flex: 1, backgroundColor: '#f9f9f9' }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddBlock} className={styles.btnSecondary} style={{ width: '100%' }}>+ Add Content Block</button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                  <button type="button" onClick={() => { setShowFullForm(false); setEditingId(null); }} className={styles.btnSecondary}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
                    {editingId ? 'Save Changes' : 'Publish Blog'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBlogs;
