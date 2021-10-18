import React, { useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Page from './PageList/Page';
import { withUnstatedContainers } from './UnstatedUtils';

import AppContainer from '~/client/services/AppContainer';
import PageContainer from '~/client/services/PageContainer';

import { toastError } from '~/client/util/apiNotification';
import { useSWRxPageList } from '~/stores/page';

import PaginationWrapper from './PaginationWrapper';


const PageList = (props) => {
  const { appContainer, pageContainer, t } = props;
  const { path } = pageContainer.state;

  const [activePage, setActivePage] = useState(1);

  const { data: pagesListData, error, mutate } = useSWRxPageList(path, activePage);

  function setPageNumber(selectedPageNumber) {
    setActivePage(selectedPageNumber);
  }


  // TODO: To be implemented in #79549
  if (error != null) {
    // toastError(error, 'Error occurred in PageList');
    // eslint-disable-next-line no-console
    console.log(error, 'Error occurred in PageList');
  }

  if (!pagesListData?.pages) {
    return (
      <div className="wiki">
        <div className="text-muted text-center">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
        </div>
      </div>
    );
  }

  const liClasses = props.liClasses.join(' ');
  const pageList = pagesListData?.pages.map(page => (
    <li key={page._id} className={liClasses}>
      <Page page={page} />
    </li>
  ));
  if (pageList.length === 0) {
    return (
      <div className="mt-2">
        {/* eslint-disable-next-line react/no-danger */}
        <p>{t('custom_navigation.no_page_list')}</p>
      </div>
    );
  }
  if (appContainer.config.disableLinkSharing) {
    return (
      <div className="mt-2">
        {/* eslint-disable-next-line react/no-danger */}
        <p>{t('custom_navigation.link_sharing_is_disabled')}</p>
      </div>
    );
  }

  const totalPages = pagesListData.totalCount ? pagesListData.totalCount : 0;
  const limit = pagesListData.limit ? pagesListData.limit : Infinity;

  return (
    <div className="page-list">
      <ul className="page-list-ul page-list-ul-flat">
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

  liClasses: PropTypes.arrayOf(PropTypes.string),
};
PageList.defaultProps = {
  liClasses: ['mb-3'],
};

export default PageListTranslation;
