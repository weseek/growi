import React, { type ComponentPropsWithoutRef } from 'react';

export const LoadingSpinner = ({ className = '' }: ComponentPropsWithoutRef<'span'>): JSX.Element => (
  <span className={`material-symbols-outlined pb-0 spinner ${className}`}>progress_activity</span>
);
