import React, { useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import Page from './PageList/Page';
import { withUnstatedContainers } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

import PaginationWrapper from './PaginationWrapper';


const PageList = (props) => {
  const { appContainer, pageContainer } = props;
  const { path } = pageContainer.state;
  const [pages, setPages] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(appContainer.getConfig().recentCreatedLimit);
  const [offset, setOffset] = useState(0);

  function setPageNumber(selectedPageNumber) {
    setActivePage(selectedPageNumber);
    setOffset((selectedPageNumber - 1) * limit);
  }

  const updatePageList = useCallback(async() => {
    const res = await appContainer.apiv3Get('/pages/list', { path, limit, offset });

    setPages(res.data.pages);
    setIsLoading(true);
    setTotalPages(res.data.totalCount);
    setLimit(res.data.limit);
    setOffset(res.data.offset);
  }, [appContainer, path, limit, offset]);

  useEffect(() => {
    updatePageList();
  }, [updatePageList]);


  if (isLoading === false) {
    return (
      <div className="wiki">
        <div className="text-muted test-center">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
        </div>
      </div>
    );
  }

  const pageList = pages.map(page => (
    <li key={page._id}>
      <Page page={page} />
    </li>
  ));

  return (
    <div className="page-list-container-create">
      <ul className="page-list-ul page-list-ul-flat mb-3">
        {pageList}
      </ul>
      <div
        className="d-flex justify-content-center"
      >
        <PaginationWrapper
          activePage={activePage}
          changePage={setPageNumber}
          totalItemsCount={totalPages}
          pagingLimit={limit}
        />
      </div>
    </div>
  );


};

const PageListWrapper = withUnstatedContainers(PageList, [AppContainer, PageContainer]);


PageList.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer),
  pageContainer: PropTypes.instanceOf(PageContainer),
};

export default PageListWrapper;
