import React, { useState, useEffect } from 'react';
import { getSubscribers, deleteSubscriber } from '../../../services/api';
import styles from '../ManageBookings/ManageBookings.module.css'; // Reusing similar table styles

const ManageSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const { data } = await getSubscribers();
      setSubscribers(data);
    } catch (err) {
      console.error('Failed to fetch subscribers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscriber?')) {
      try {
        await deleteSubscriber(id);
        fetchSubscribers();
      } catch (err) {
        console.error('Failed to delete subscriber', err);
        alert('Failed to delete subscriber');
      }
    }
  };

  if (loading) return <div className={styles.loading}>Loading subscribers...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Newsletter Subscribers</h2>
      </div>
      
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Email Address</th>
              <th>Subscribed On</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>No subscribers found.</td>
              </tr>
            ) : (
              subscribers.map((sub, index) => (
                <tr key={sub._id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: 'bold' }}>{sub.email}</td>
                  <td>{new Date(sub.createdAt).toLocaleString()}</td>
                  <td>
                    <button 
                      onClick={() => handleDelete(sub._id)}
                      className={styles.deleteBtn}
                      style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageSubscribers;
