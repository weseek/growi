
import React from 'react';

import { useTranslation } from 'react-i18next';

import { useIsGuestUser } from '~/stores/context';

import { BookmarkContents } from './Bookmarks/BookmarkContents';

export const Bookmarks = () : JSX.Element => {
  const { t } = useTranslation();
  const { data: isGuestUser } = useIsGuestUser();

  return (
    <div className="px-3">
      <div className="grw-sidebar-content-header">
        <h4 className="mb-0 py-4">{t('Bookmarks')}</h4>
      </div>
      {isGuestUser ? (
        <h4 className="fs-6">
          { t('Not available for guest') }
        </h4>
      ) : (
        <BookmarkContents />
      )}
    </div>
  );
};
