import React from 'react';

import { useTranslation } from 'next-i18next';

import { useIsReadOnlyUser } from '~/stores-universal/context';
import { useSecuritySettings } from '~/stores/security-setting';

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

export const NotAvailableIfReadOnlyUserNotAllowedToComment: React.FC<{
  children: JSX.Element
}> = React.memo(({ children }) => {
  const { t } = useTranslation();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();

  const { data: securitySettings } = useSecuritySettings();

  if (securitySettings == null) {
    return;
  }

  const isRomUserAllowedToComment = securitySettings.generalSetting.isRomUserAllowedToComment;

  console.log(isRomUserAllowedToComment);

  const isDisabled = !!isReadOnlyUser && !isRomUserAllowedToComment;
  const title = t('Not available for read only user if not allowed to comment');

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
NotAvailableIfReadOnlyUserNotAllowedToComment.displayName = 'NotAvailableIfReadOnlyUserNotAllowedToComment';
