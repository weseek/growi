import React, {
  useCallback, useState, FC, useEffect,
} from 'react';

import { PageRevisionList } from '~/components/PageAccessory/PageRevisionList';
import { PaginationWrapper } from '~/components/PaginationWrapper';

import { useCurrentPageHistorySWR } from '~/stores/page';

export const PageHistory:FC = () => {
  const [activePage, setActivePage] = useState(1);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [limit, setLimit] = useState(10);

  const { data: paginationResult, error } = useCurrentPageHistorySWR(activePage, limit);

  const handlePage = useCallback(async(selectedPage) => {
    setActivePage(selectedPage);
  }, []);

  useEffect(() => {
    if (paginationResult == null) {
      return;
    }
    setActivePage(paginationResult.page);
    setTotalItemsCount(paginationResult.totalDocs);
    setLimit(paginationResult.limit);
  }, [paginationResult]);

  if (paginationResult == null) {
    return (
      <div className="my-5 text-center">
        <i className="fa fa-lg fa-spinner fa-pulse mx-auto text-muted" />
      </div>
    );
  }

  if (error != null) {
    return (
      <div className="my-5">
        <div className="text-danger">{error}</div>
      </div>
    );
  }

  return (
    <>
      <PageRevisionList />
      <PaginationWrapper
        activePage={activePage}
        changePage={handlePage}
        totalItemsCount={totalItemsCount}
        pagingLimit={limit}
        align="center"
      />
    </>
  );
};
