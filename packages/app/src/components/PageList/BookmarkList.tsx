import React from 'react';

import { useTranslation } from 'next-i18next';

import { useSWRxCurrentUserBookmarks } from '~/stores/bookmark';
import loggerFactory from '~/utils/logger';

import { PageListItemS } from './PageListItemS';

const logger = loggerFactory('growi:BookmarkList');

export const BookmarkList = (): JSX.Element => {

  const { t } = useTranslation();
  const { data: currentUserBookmarksData } = useSWRxCurrentUserBookmarks();


  return (
    <div className="bookmarks-list-container">
      {currentUserBookmarksData?.length === 0 ? t('No bookmarks yet') : (
        <>
          <ul className="page-list-ul page-list-ul-flat mb-3">

            {currentUserBookmarksData?.map(page => (
              <li key={`my-bookmarks:${page?._id}`} className="mt-4">
                <PageListItemS page={page} />
              </li>
            ))}

          </ul>
        </>
      )}
    </div>
  );
};
