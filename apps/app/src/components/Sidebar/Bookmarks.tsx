
import React from 'react';

import { useTranslation } from 'react-i18next';

import { useIsGuestUser } from '~/stores/context';

import { BookmarkContents } from './Bookmarks/BookmarkContents';

export const Bookmarks = () : JSX.Element => {
  const { t } = useTranslation();
  const { data: isGuestUser } = useIsGuestUser();

  return (
    <>
      {/* TODO : #139425 Match the space specification method to others */}
      {/* ref.  https://redmine.weseek.co.jp/issues/139425 */}
      <div className="grw-sidebar-content-header p-3">
        <h4 className="mb-0">{t('Bookmarks')}</h4>
      </div>
      {isGuestUser ? (
        <h4 className="ps-3">
          { t('Not available for guest') }
        </h4>
      ) : (
        <BookmarkContents />
      )}
    </>
  );
};
