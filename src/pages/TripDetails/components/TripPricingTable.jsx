import React from 'react';
import styles from './TripPricingTable.module.css';

const TripPricingTable = ({ trip, selectedOptionIndex, selectedSubOptionIndex }) => {
  const options = trip?.packageOptions || [];
  if (!options || options.length === 0) return null;

  const saveAmount = trip?.saveAmount || 0;

  return (
    <div className={styles.sectionBlock}>
      <h2 className={styles.blockTitle}>Package Price Comparison</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.compTable}>
          <thead>
            <tr>
              <th>Package</th>
              <th>Sub Package</th>
              <th>Regular Price</th>
              <th>Discounted Price</th>
            </tr>
          </thead>
          <tbody>
            {options.map((opt, optIdx) => {
              const subs = opt.subOptions && opt.subOptions.length > 0 ? opt.subOptions : [{ name: '-', price: opt.price }];
              
              return subs.map((sub, subIdx) => {
                const isSelected = selectedOptionIndex === optIdx && selectedSubOptionIndex === subIdx;
                const discPrice = Number(sub.price) || Number(opt.price) || 0;
                const origPrice = Number(sub.originalPrice) || Number(opt.originalPrice) || 0;
                const discount = origPrice > discPrice ? origPrice - discPrice : 0;

                return (
                  <tr key={`${optIdx}-${subIdx}`} className={isSelected ? styles.selectedRow : ''}>
                    <td className={styles.packageCol}>
                      <div className={styles.pkgTitle}>{opt.title}</div>
                      <div className={styles.pkgDays}>{opt.days || trip.duration}</div>
                    </td>
                    <td>{sub.name}</td>
                    <td className={styles.regularPriceCol}>
                      {origPrice > 0 ? (
                        <>
                          <div className={styles.strikethrough}>₹ {origPrice.toLocaleString('en-IN')}</div>
                          {discount > 0 && <div className={styles.discountText}>₹ {discount.toLocaleString('en-IN')}/- OFF</div>}
                        </>
                      ) : (
                        <div>-</div>
                      )}
                    </td>
                    <td className={styles.discountPriceCol}>
                      <div className={styles.finalPrice}>₹ {discPrice.toLocaleString()}</div>
                      <div className={styles.perPerson}>per person</div>
                      {isSelected && <div className={styles.selectedBadge}>Selected</div>}
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
      <p className={styles.tableNote}>* All prices are per person and exclude applicable taxes</p>
    </div>
  );
};

export default TripPricingTable;
