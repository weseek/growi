import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Page from './PageList/Page';

import { useSWRxPageList } from '~/stores/page';

import PaginationWrapper from './PaginationWrapper';


type Props = {
  path: string,
  liClasses?: string[],
}

const PageList = (props: Props): JSX.Element => {
  const { t } = useTranslation();
  const { path, liClasses } = props;

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

  const liClassesStr = (liClasses ?? ['mb-3']).join(' ');

  const pageList = pagesListData.items.map(page => (
    <li key={page._id} className={liClassesStr}>
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

export default PageList;
