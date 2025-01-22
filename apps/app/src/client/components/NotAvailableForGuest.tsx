import React from 'react';

import { useTranslation } from 'next-i18next';

import { useIsGuestUser } from '~/stores-universal/context';

import { NotAvailable } from './NotAvailable';

type NotAvailableForGuestProps = {
  children: React.ReactElement
}

export const NotAvailableForGuest = React.memo(({ children }: NotAvailableForGuestProps): React.ReactElement => {
  const { t } = useTranslation();
  const { data: isGuestUser } = useIsGuestUser();

  const isDisabled = !!isGuestUser;
  const title = t('Not available for guest');

  return (
    <NotAvailable
      isDisabled={isDisabled}
      title={title}
      classNamePrefix="grw-not-available-for-guest"
    >
      {children}
    </NotAvailable>
  );
});
NotAvailableForGuest.displayName = 'NotAvailableForGuest';
