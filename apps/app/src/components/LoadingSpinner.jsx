import React from 'react';

import styles from './LoadingSpinner.module.scss';

export const LoadingSpinner = () => (
  <span className={`material-symbols-outlined pb-0 ${styles.spinner}`}>progress_activity</span>
);
