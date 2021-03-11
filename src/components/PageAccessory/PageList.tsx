import React, {
  useEffect, useCallback, useState, VFC,
} from 'react';

import { PaginationWrapper } from '~/components/PaginationWrapper';

import Page from '../../client/js/components/PageList/Page';
import { Page as IPage } from '~/interfaces/page';

import { useCurrentPageList } from '~/stores/page';
import { useTranslation } from '~/i18n';

type Props = {
  liClasses?: string[],
}

export const PageList:VFC<Props> = (props:Props) => {
  const { t } = useTranslation();

  const { liClasses = ['mb-3'] } = props;
  const [pages, setPages] = useState<IPage[]>([]);

  const [activePage, setActivePage] = useState(1);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [limit, setLimit] = useState(Infinity);

  const { data: paginationResult } = useCurrentPageList(activePage);

  const handlePage = useCallback(async(selectedPage) => {
    setActivePage(selectedPage);
  }, []);

  useEffect(() => {
    if (paginationResult == null) {
      return;
    }
    setTotalItemsCount(paginationResult.totalCount);
    setLimit(paginationResult.limit);
    setPages(paginationResult.pages);
  }, [paginationResult]);

  if (paginationResult == null) {
    return (
      <div className="wiki">
        <div className="text-muted text-center">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
        </div>
      </div>
    );
  }

  if (pages.length === 0) {
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
        {pages.map(page => (
          <li key={page._id} className={liClasses.join(' ')}>
            <Page page={page} />
          </li>
        ))}
      </ul>
      <PaginationWrapper
        activePage={activePage}
        changePage={handlePage}
        totalItemsCount={totalItemsCount}
        pagingLimit={limit}
        align="center"
      />
    </div>
  );

};
