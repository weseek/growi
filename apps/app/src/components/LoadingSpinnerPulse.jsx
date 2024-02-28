import React from 'react';

import styles from './LoadingSpinnerPulse.module.scss';

export const LoadingSpinnerPulse = () => (
  <div className={`${styles['lds-default']}`}>
    <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
  </div>
);
