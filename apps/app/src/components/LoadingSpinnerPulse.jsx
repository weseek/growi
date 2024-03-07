import React from 'react';

import styles from './LoadingSpinnerPulse.module.scss';

export const LoadingSpinnerPulse = () => (
  // If you want to use a large spinner icon, call this component with a larger font size (e.g. <span className="fs-3"><LoadingSpinnerPulse /></span>)
  <div className={`align-bottom ms-1 me-1 ${styles['lds-default']}`}>
    <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
  </div>
);
