import React, { type ComponentPropsWithoutRef } from 'react';

import styles from './LoadingSpinner.module.scss';

export const LoadingSpinner = ({ className }: ComponentPropsWithoutRef<'span'>): JSX.Element => (
  <span className={`material-symbols-outlined pb-0 ${styles.spinner} ${className}`}>progress_activity</span>
);
