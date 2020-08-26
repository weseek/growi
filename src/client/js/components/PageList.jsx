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

  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationNumbers, setPaginationNumbers] = useState({});
  const [limit, setLimit] = useState(Infinity);
  const [offset, setOffset] = useState(0);

  function createdPageList(selectPageNumber) {
    setLimit(appContainer.getConfig().recentCreatedLimit);
    setOffset((selectPageNumber - 1) * limit)
    const getPageList = useCallback(async() => {
    const res = await appContainer.apiv3Get('/pages/list', { path, limit });

      setPages(res.data.pages);
      setIsLoading(true);
      setLimit(limit);
      setTotalPages(res.totalCount);
    }, [appContainer, path, limit]);
  }

  useEffect(() => {
    getPageList();
  }, [getPageList]);


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

  const handlePage = 'handlePage';

  return (
    <div className="page-list-container-create">
      <ul className="page-list-ul page-list-ul-flat mb-3">
        {pageList}
      </ul>
      <PaginationWrapper
        activePage={3}
        changePage={handlePage}
        totalItemsCount={}
        pagingLimit={limit}
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
