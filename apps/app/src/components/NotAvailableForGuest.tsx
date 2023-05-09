import React from 'react';

import { useTranslation } from 'next-i18next';

import { useIsGuestUser, useIsReadOnlyUser } from '~/stores/context';

import { NotAvailable } from './NotAvailable';


type NotAvailableForGuestProps = {
  children: JSX.Element
}

// TODO: Update NotAvailableForGuest to be used even when isReadOnlyUser
// https://redmine.weseek.co.jp/issues/121331
export const NotAvailableForGuest = React.memo(({ children }: NotAvailableForGuestProps): JSX.Element => {
  const { t } = useTranslation();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();

  const isDisabled = !!isGuestUser || !!isReadOnlyUser;
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
