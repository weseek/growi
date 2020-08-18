import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Page from './PageList/Page';
import { withUnstatedContainers } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

const PageList = (props) => {
  const { appContainer, pageContainer } = props;
  const { path } = pageContainer.state;

  const [page, setPage] = useState({});

  async function getPageList() {
    console.log('hoge');
    // const res = await appContainer.apiv3Get('/pages/list', path);
    // setPage(res);
  }

  useEffect(() => {
    getPageList();
  }, []);


  return (
    <span>hoge</span>
  // <Page page={page} />
  );
};

const PageListWrapper = withUnstatedContainers(PageList, [AppContainer, PageContainer]);


PageList.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer),
  pageContainer: PropTypes.instanceOf(PageContainer),
};

export default PageListWrapper;
