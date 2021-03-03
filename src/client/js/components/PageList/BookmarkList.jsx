import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import loggerFactory from '~/utils/logger';
import { PaginationWrapper } from '~/components/PaginationWrapper';

import { toastError } from '../../util/apiNotification';
import { apiv3Get } from '../../util/apiv3-client';

import Page from './Page';
import { useTranslation } from '~/i18n';

const logger = loggerFactory('growi:BookmarkList');

const BookmarkList = (props) => {
  const { t } = useTranslation();

  const { userId } = props;

  const [pages, setPages] = useState([]);

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
      toastError(error, 'Error occurred in bookmark page list');
    }
  }, [activePage, userId]);

  useEffect(() => {
    getMyBookmarkList();
  }, [getMyBookmarkList]);

  /**
   * generate Elements of Page
   *
   * @param {any} pages Array of pages Model Obj
   *
   */
  const generatePageList = pages.map(page => (
    <li key={`my-bookmarks:${page._id}`} className="mt-4">
      <Page page={page.page} />
    </li>
  ));

  return (
    <div className="bookmarks-list-container">
      {pages.length === 0 ? t('No bookmarks yet') : (
        <>
          <ul className="page-list-ul page-list-ul-flat mb-3">
            {generatePageList}
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

BookmarkList.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default BookmarkList;
