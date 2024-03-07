import React from 'react';

import styles from './LoadingSpinnerPulse.module.scss';

export const LoadingSpinnerPulse = () => (
  <div className={`align-bottom ms-1 me-1 ${styles['lds-default']}`}>
    <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
  </div>
);
