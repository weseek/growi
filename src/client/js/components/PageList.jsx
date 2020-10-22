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
  const [isLoading, setIsLoading] = useState(true);

  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(null);

  function setPageNumber(selectedPageNumber) {
    setActivePage(selectedPageNumber);
  }

  const updatePageList = useCallback(async() => {
    const page = activePage;
    const res = await appContainer.apiv3Get('/pages/list', { path, page });

    setPages(res.data.pages);
    setIsLoading(false);
    setTotalPages(res.data.totalCount);
    setLimit(res.data.limit);
  }, [appContainer, path, activePage]);

  useEffect(() => {
    updatePageList();
  }, [updatePageList]);


  if (isLoading) {
    return (
      <div className="wiki">
        <div className="text-muted test-center">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
        </div>
      </div>
    );
  }

  const pageList = pages.map(page => (
    <li key={page._id} className="mb-3">
      <Page page={page} />
    </li>
  ));

  return (
    <div className="page-list-container-create">
      <ul className="page-list-ul page-list-ul-flat ml-n4">
        {pageList}
      </ul>
      <PaginationWrapper
        activePage={activePage}
        changePage={setPageNumber}
        totalItemsCount={totalPages}
        pagingLimit={limit}
        align="center"
      />
    </div>
  );


};

const PageListWrapper = withUnstatedContainers(PageList, [AppContainer, PageContainer]);


PageList.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer),
  pageContainer: PropTypes.instanceOf(PageContainer),
};

export default PageListWrapper;
