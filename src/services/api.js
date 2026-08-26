import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const getDestinations = (type) => api.get(`/destinations${type ? `?type=${type}` : ''}`);
export const createDestination = (data) => api.post('/destinations', data);
export const updateDestination = (id, data) => api.put(`/destinations/${id}`, data);
export const deleteDestination = (id) => api.delete(`/destinations/${id}`);

export const getTrips = () => api.get('/trips');
export const getTrip = (id) => api.get(`/trips/${id}`);
export const createTrip = (data) => api.post('/trips', data);
export const updateTrip = (id, data) => api.put(`/trips/${id}`, data);
export const deleteTrip = (id) => api.delete(`/trips/${id}`);

export const getBlogs = () => api.get('/blogs');
export const createBlog = (data) => api.post('/blogs', data);
export const updateBlog = (id, data) => api.put(`/blogs/${id}`, data);
export const deleteBlog = (id) => api.delete(`/blogs/${id}`);

export const getReviews = () => api.get('/reviews');
export const createReview = (data) => api.post('/reviews', data);
export const updateReview = (id, data) => api.put(`/reviews/${id}`, data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

export const getNavLinks = () => api.get('/navlinks');
export const createNavLink = (data) => api.post('/navlinks', data);
export const updateNavLink = (id, data) => api.put(`/navlinks/${id}`, data);
export const deleteNavLink = (id) => api.delete(`/navlinks/${id}`);

export const getSiteSettings = () => api.get('/settings');
export const updateSiteSettings = (data) => api.put('/settings', data);

export const submitEnquiry = (data) => api.post('/enquiries', data);
export const getEnquiries = () => api.get('/enquiries');
export const deleteEnquiry = (id) => api.delete(`/enquiries/${id}`);

export const getCreatorTrips = () => api.get('/creator-trips');
export const getCreatorTrip = (id) => api.get(`/creator-trips/${id}`);
export const createCreatorTrip = (data) => api.post('/creator-trips', data);
export const updateCreatorTrip = (id, data) => api.put(`/creator-trips/${id}`, data);
export const deleteCreatorTrip = (id) => api.delete(`/creator-trips/${id}`);

export const createPaymentOrder = (data) => api.post('/payment/create-order', data);
export const verifyPayment = (data) => api.post('/payment/verify', data);

export const getAttractions = () => api.get('/attractions');
export const getAttractionById = (id) => api.get(`/attractions/${id}`);
export const getAttractionsByDestination = (destination) => api.get(`/attractions/destination/${destination}`);
export const getAttractionBySlug = (slug) => api.get(`/attractions/slug/${slug}`);
export const createAttraction = (data) => api.post('/attractions', data);
export const updateAttraction = (id, data) => api.put(`/attractions/${id}`, data);
export const deleteAttraction = (id) => api.delete(`/attractions/${id}`);

// Subscribers
export const addSubscriber = (email) => api.post('/subscribers', { email });
export const getSubscribers = () => api.get('/subscribers');
export const deleteSubscriber = (id) => api.delete(`/subscribers/${id}`);

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export default api;
