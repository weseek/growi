import React, { useState, useEffect, useCallback } from 'react';
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

  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [paginationNumbers, setPaginationNumbers] = useState({});
  const [limit, setLimit] = useState(Infinity);

  const getPageList = useCallback(async() => {
    const res = await appContainer.apiv3Get('/pages/list', { path });
    setPages(res.data.pages);
    setIsLoading(true);
  }, [appContainer, path]);

  useEffect(() => {
    getPageList();
  }, [getPageList]);


  if (isLoading === false) {
    return (
      <div className="wiki">
        <div className="text-muted text-center">
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

  const handlePage = 'handlePage';
  const totalPages = 'totalPages';
  const pagingLimit = 'pagingLimit';

  return (
    <div className="page-list-container-create">
      <ul className="page-list-ul page-list-ul-flat mb-3">
        {pageList}
      </ul>
      <PaginationWrapper
        activePage={activePage}
        changePage={handlePage}
        totalItemsCount={totalPages}
        pagingLimit={pagingLimit}
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
