import React, { useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Page from './PageList/Page';
import { withUnstatedContainers } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

import PaginationWrapper from './PaginationWrapper';


const PageList = (props) => {
  const { appContainer, pageContainer, t } = props;
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
    <li key={page._id} className="mb-3">
      <Page page={page} />
    </li>
  ));
  if (pageList.length === 0) {
    return (
      <div className="mt-2">
        {/* eslint-disable-next-line react/no-danger */}
        <p dangerouslySetInnerHTML={{ __html: t('custom_navigation.no_page_list', { path }) }} />
      </div>
    );
  }

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

const PageListTranslation = withTranslation()(PageListWrapper);


PageList.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer),
  pageContainer: PropTypes.instanceOf(PageContainer),
};

export default PageListTranslation;
