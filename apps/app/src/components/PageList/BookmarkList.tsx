import React, { useState, useCallback, useEffect } from 'react';

import { useTranslation } from 'next-i18next';

import { apiv3Get } from '~/client/util/apiv3-client';
import { toastError } from '~/client/util/toastr';
import { MyBookmarkList } from '~/interfaces/bookmark-info';
import loggerFactory from '~/utils/logger';

import PaginationWrapper from '../PaginationWrapper';

import { PageListItemS } from './PageListItemS';

const logger = loggerFactory('growi:BookmarkList');

type BookmarkListProps = {
  userId: string
}

export const BookmarkList = (props: BookmarkListProps): JSX.Element => {
  const { userId } = props;

  const { t } = useTranslation();
  const [pages, setPages] = useState<MyBookmarkList>([]);
  const [activePage, setActivePage] = useState(1);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [pagingLimit, setPagingLimit] = useState(10);

  const setPageNumber = (selectedPageNumber) => {
    setActivePage(selectedPageNumber);
  };

  const getMyBookmarkList = useCallback(async() => {
    const page = activePage;

    try {
      const res = await apiv3Get(`/bookmarks/${userId}`, { page });
      const { paginationResult } = res.data;

      setPages(paginationResult.docs);
      setTotalItemsCount(paginationResult.totalDocs);
      setPagingLimit(paginationResult.limit);
    }
    catch (error) {
      logger.error('failed to fetch data', error);
      toastError(error);
    }
  }, [activePage, userId]);

  useEffect(() => {
    getMyBookmarkList();
  }, [getMyBookmarkList]);

  return (
    <div className="bookmarks-list-container">
      {pages.length === 0 ? t('No bookmarks yet') : (
        <>
          <ul className="page-list-ul page-list-ul-flat mb-3">

            {pages.map(page => (
              <li key={`my-bookmarks:${page._id}`} className="mt-4">
                <PageListItemS page={page.page} />
              </li>
            ))}

          </ul>
          <PaginationWrapper
            activePage={activePage}
            changePage={setPageNumber}
            totalItemsCount={totalItemsCount}
            pagingLimit={pagingLimit}
            align="center"
            size="sm"
          />
        </>
      )}
    </div>
  );
};
