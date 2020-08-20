import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import Page from './PageList/Page';
import { withUnstatedContainers } from './UnstatedUtils';
import { toastError } from '../util/apiNotification';

import { withLoadingSppiner } from './SuspenseUtils';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

// let retrieveError = null;
const pageDummyData = 0;
const pageDummyDataError = 1;
let pages = pageDummyData;

const PageList = (props) => {
  const { appContainer, pageContainer } = props;
  const { path } = pageContainer.state;

  // const [pages, setPages] = useState(pageDummyData);
  // const [spinnerError, setSpinnerError] = useState(null);

  if (pages === pageDummyDataError) {
    throw new Error('hoge');
  }

  const getPageList = useCallback(async() => {
    const res = await appContainer.apiv3Get('/pages/list', { path });
    pages = res.data.pages;
  }, [appContainer, path]);

  useEffect(() => {
    getPageList();
  }, [getPageList]);


  if (pages === pageDummyData) {
    throw (async() => {
      try {
        await getPageList();
      }
      catch (err) {
        pages = 1;
        toastError(err);
      }
    })();
  }

  return pages.map(page => (
    <li key={page._id}>
      <Page page={page} />
    </li>
  ));


};

const PageListWrapper = withUnstatedContainers(withLoadingSppiner(PageList), [AppContainer, PageContainer]);


PageList.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer),
  pageContainer: PropTypes.instanceOf(PageContainer),
};

export default PageListWrapper;
