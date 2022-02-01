import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import Page from './PageList/Page';
import { withUnstatedContainers } from './UnstatedUtils';

import PageContainer from '~/client/services/PageContainer';

import { useSWRxPageList } from '~/stores/page';

import PaginationWrapper from './PaginationWrapper';


const PageList = (props) => {
  const { t } = useTranslation();
  const { path } = pageContainer.state;

  const [activePage, setActivePage] = useState(1);

  const { data: pagesListData, error: errors } = useSWRxPageList(path, activePage);

  function setPageNumber(selectedPageNumber) {
    setActivePage(selectedPageNumber);
  }

  if (errors != null) {
    return (
      <div className="my-5">
        {/* eslint-disable-next-line react/no-array-index-key */}
        {errors.map((error, index) => <div key={index} className="text-danger">{error.message}</div>)}
      </div>
    );
  }

  if (pagesListData == null) {
    return (
      <div className="wiki">
        <div className="text-muted text-center">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
        </div>
      </div>
    );
  }

  const liClasses = props.liClasses.join(' ');
  const pageList = pagesListData.items.map(page => (
    <li key={page._id} className={liClasses}>
      <Page page={page} />
    </li>
  ));
  if (pageList.length === 0) {
    return (
      <div className="mt-2">
        <p>{t('custom_navigation.no_page_list')}</p>
      </div>
    );
  }

  return (
    <div className="page-list">
      <ul className="page-list-ul page-list-ul-flat">
        {pageList}
      </ul>
      <PaginationWrapper
        activePage={activePage}
        changePage={setPageNumber}
        totalItemsCount={pagesListData.totalCount}
        pagingLimit={pagesListData.limit}
        align="center"
      />
    </div>
  );
};

PageList.propTypes = {
  liClasses: PropTypes.arrayOf(PropTypes.string),
};
PageList.defaultProps = {
  liClasses: ['mb-3'],
};

export default PageList;
