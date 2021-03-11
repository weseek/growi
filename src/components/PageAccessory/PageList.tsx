import React, {
  useEffect, useCallback, useState, VFC,
} from 'react';

import { PaginationWrapper } from '~/components/PaginationWrapper';

import { apiv3Get } from '../../client/js/util/apiv3-client';

import Page from '../../client/js/components/PageList/Page';
import { Page as IPage } from '~/interfaces/page';

import { useCurrentPageSWR } from '~/stores/page';
import { useTranslation } from '~/i18n';

type Props ={
  liClasses?: string[],
}

export const PageList:VFC<Props> = (props:Props) => {
  const { t } = useTranslation();

  const { data: currentPage } = useCurrentPageSWR();

  const { liClasses = ['mb-3'] } = props;
  const [pages, setPages] = useState<IPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(Infinity);

  function setPageNumber(selectedPageNumber) {
    setActivePage(selectedPageNumber);
  }

  const updatePageList = useCallback(async() => {
    const page = activePage;
    const res = await apiv3Get('/pages/list', { path: currentPage?.path, page });

    setPages(res.data.pages);
    setIsLoading(false);
    setTotalPages(res.data.totalCount);
    setLimit(res.data.limit);
  }, [currentPage?.path, activePage]);

  useEffect(() => {
    updatePageList();
  }, [updatePageList]);


  if (isLoading) {
    return (
      <div className="wiki">
        <div className="text-muted text-center">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
        </div>
      </div>
    );
  }


  const pageList = pages.map(page => (
    <li key={page._id} className={liClasses.join(' ')}>
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
