import React from 'react';
import styles from './Admin.module.css';
import ManagePackages from './ManagePackages';

const ManageAllPackages = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 className={styles.pageHeader} style={{ margin: 0, border: 'none', padding: 0 }}>All Packages</h2>
      </div>
      <ManagePackages hideBasicForm={true} />
    </div>
  );
};

export default ManageAllPackages;
