import React, { type ComponentPropsWithoutRef } from 'react';

import styles from './LoadingSpinnerPulse.module.scss';

export const LoadingSpinnerPulse = ({ className }: ComponentPropsWithoutRef<'div'>): JSX.Element => (
  <div className={`align-bottom ms-1 me-1 ${styles['lds-default']} ${className}`}>
    <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
  </div>
);
