
import React from 'react';

import { useTranslation } from 'react-i18next';

import { useIsGuestUser } from '~/stores/context';

import { BookmarkContents } from './Bookmarks/BookmarkContents';

export const Bookmarks = () : JSX.Element => {
  const { t } = useTranslation();
  const { data: isGuestUser } = useIsGuestUser();

  return (
    <>
      <div className="grw-sidebar-content-header p-3">
        <h3 className="mb-0">{t('Bookmarks')}</h3>
      </div>
      {isGuestUser ? (
        <h4 className="pl-3">
          { t('Not available for guest') }
        </h4>
      ) : (
        <BookmarkContents />
      )}
    </>
  );
};
