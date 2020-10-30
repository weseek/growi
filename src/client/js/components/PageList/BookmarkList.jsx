import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';
import { withUnstatedContainers } from '../UnstatedUtils';


import AppContainer from '../../services/AppContainer';
import { toastError } from '../../util/apiNotification';

import PaginationWrapper from '../PaginationWrapper';

import Page from './Page';

const logger = loggerFactory('growi:BookmarkList');

const BookmarkList = (props) => {
  const { t, appContainer, userId } = props;

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
      const res = await appContainer.apiv3Get(`/bookmarks/${userId}`, { page });
      const { paginationResult } = res.data;

      setPages(paginationResult.docs);
      setTotalItemsCount(paginationResult.totalDocs);
      setPagingLimit(paginationResult.limit);
    }
    catch (error) {
      logger.error('failed to fetch data', error);
      toastError(error, 'Error occurred in bookmark page list');
    }
  }, [appContainer, activePage, userId]);

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
    <li key={`my-bookmarks:${page._id}`}>
      <Page page={page.page} />
    </li>
  ));

  return (
    <div className="page-list-container-create">
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

/**
 * Wrapper component for using unstated
 */
const BookmarkListWrapper = withUnstatedContainers(BookmarkList, [AppContainer]);

BookmarkList.propTypes = {
  t: PropTypes.func.isRequired,
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  userId: PropTypes.string.isRequired,
};

export default withTranslation()(BookmarkListWrapper);
