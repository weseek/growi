import React, { type JSX } from 'react';

import { useTranslation } from 'next-i18next';

import { useIsReadOnlyUser } from '~/states/context';
import { useIsRomUserAllowedToComment } from '~/states/server-configurations';

import { NotAvailable } from './NotAvailable';

export const NotAvailableForReadOnlyUser: React.FC<{
  children: JSX.Element
}> = React.memo(({ children }) => {
  const { t } = useTranslation();
  const [isReadOnlyUser] = useIsReadOnlyUser();

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
  const [isReadOnlyUser] = useIsReadOnlyUser();

  const [isRomUserAllowedToComment] = useIsRomUserAllowedToComment();

  const isDisabled = !!isReadOnlyUser && !isRomUserAllowedToComment;
  const title = t('page_comment.comment_management_is_not_allowed');

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
