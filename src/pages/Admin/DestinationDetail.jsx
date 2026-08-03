import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDestinations, getTrips } from '../../services/api';
import styles from './Admin.module.css';

const DestinationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: destData } = await getDestinations();
      const dest = destData.find((d) => d._id === id);
      setDestination(dest);

      const { data: tripData } = await getTrips();
      const filtered = tripData.filter((t) => t.destination === (dest?.name || ''));
      setPackages(filtered);
    };
    fetchData();
  }, [id]);

  if (!destination) return <div>Loading destination...</div>;

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Destination: {destination.name}</h3>
      <p>{destination.aboutText}</p>
      <button
        onClick={() => navigate(`/admin/create-package?dest=${destination.name}`)}
        style={{ background: '#3498db', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginBottom: '15px' }}
      >
        Create Package
      </button>
      <h4 className={styles.cardTitle}>Packages for {destination.name}</h4>
      {packages.length === 0 ? (
        <p>No packages yet.</p>
      ) : (
        packages.map((pkg) => (
          <div key={pkg._id} className={styles.listItem} style={{ marginBottom: '10px' }}>
            <div className={styles.listItemTitle}>{pkg.title}</div>
            <div className={styles.actionBtns}>
              <button
                onClick={() => navigate(`/admin/trips?dest=${destination.name}`)}
                style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Fill Details
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DestinationDetail;
