import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import Page from './PageList/Page';
import { withUnstatedContainers } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

const PageList = (props) => {
  const { appContainer, pageContainer } = props;
  const { path } = pageContainer.state;

  const [pages, setPages] = useState(null);

  const getPageList = useCallback(async() => {
    const res = await appContainer.apiv3Get('/pages/list', { path });
    setPages(res.data.pages);
  }, [appContainer, path]);

  useEffect(() => {
    getPageList();
  }, [getPageList]);


  if (pages == null) {
    return null;
  }

  return pages.map(page => (
    <li key={page._id}>
      <Page page={page} />
    </li>
  ));


};

const PageListWrapper = withUnstatedContainers(PageList, [AppContainer, PageContainer]);


PageList.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer),
  pageContainer: PropTypes.instanceOf(PageContainer),
};

export default PageListWrapper;
