import React from 'react';

import { useTranslation } from 'next-i18next';

import { useIsReadOnlyUser } from '~/stores/context';

import { NotAvailable } from './NotAvailable';

export const NotAvailableForReadOnlyUser: React.FC<{
  children: JSX.Element
}> = React.memo(({ children }) => {
  const { t } = useTranslation();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();

  const isDisabled = !!isReadOnlyUser;
  const title = t('Not available for read only user');

  return (
    <NotAvailable
      isDisabled={isDisabled}
      title={title}
      classNamePrefix="grw-not-available-for-read-only-user"
    >
      {children}
    </NotAvailable>
  );
});
NotAvailableForReadOnlyUser.displayName = 'NotAvailableForReadOnlyUser';
