import React from 'react';

import { useTranslation } from 'next-i18next';

import { NotAvailable } from './NotAvailable';


type NotAvailableForNowProps = {
  children: React.ReactElement
}

export const NotAvailableForNow = React.memo(({ children }: NotAvailableForNowProps): React.ReactElement => {
  const { t } = useTranslation();

  const title = t('Not available in this version');

  return (
    <NotAvailable
      isDisabled
      title={title}
      classNamePrefix="grw-not-available-for-now"
    >
      {children}
    </NotAvailable>
  );
});
NotAvailableForNow.displayName = 'NotAvailableForNow';
