
import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { toastError } from '~/client/util/apiNotification';
import { apiv3Get } from '~/client/util/apiv3-client';
import { IPageHasId } from '~/interfaces/page';
import { useCurrentUser, useIsGuestUser } from '~/stores/context';
import loggerFactory from '~/utils/logger';

import BookmarkItem from './Bookmarks/BookmarkItem';

const logger = loggerFactory('growi:BookmarkList');
// TODO: Remove pagination and apply  scrolling (not infinity)
const ACTIVE_PAGE = 1;

const Bookmarks = () : JSX.Element => {
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const { data: isGuestUser } = useIsGuestUser();
  const [pages, setPages] = useState<IPageHasId[]>([]);
  const page = ACTIVE_PAGE;

  const getMyBookmarkList = useCallback(async() => {
    try {
      const res = await apiv3Get(`/bookmarks/${currentUser?._id}`, { page });
      const { paginationResult } = res.data;
      setPages(paginationResult.docs.map((page) => {
        return {
          ...page.page,
        };
      }));
    }
    catch (error) {
      logger.error('failed to fetch data', error);
      toastError(error, 'Error occurred in bookmark page list');
    }
  }, [currentUser, page]);

  useEffect(() => {
    getMyBookmarkList();
  }, [getMyBookmarkList]);

  const generateBookmarkList = () => {
    return (
      <ul className="grw-bookmarks-list list-group p-3">
        <div className="grw-bookmarks-item-container">
          { pages.map((page) => {
            return (
              <BookmarkItem key={page._id} page={page} refreshBookmarkList={getMyBookmarkList} />
            );
          })}
        </div>
      </ul>
    );
  };

  const renderBookmarksItem = () => {
    if (pages?.length === 0) {
      return (
        <h3 className="pl-3">
          { t('No bookmarks yet') }
        </h3>
      );
    }
    return generateBookmarkList();
  };

  return (
    <>
      <div className="grw-sidebar-content-header p-3">
        <h3 className="mb-0">{t('Bookmarks')}</h3>
      </div>
      { isGuestUser
        ? (
          <h3 className="pl-3">
            { t('Not available for guest') }
          </h3>
        ) : renderBookmarksItem()
      }

    </>
  );

};

export default Bookmarks;
