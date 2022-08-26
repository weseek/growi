import React, { useState, useEffect, useCallback } from 'react';

import { toastError } from '~/client/util/apiNotification';
import { apiv3Get } from '~/client/util/apiv3-client';
import loggerFactory from '~/utils/logger';

import PageListItemS from '../PageList/PageListItemS';
import PaginationWrapper from '../PaginationWrapper';

const logger = loggerFactory('growi:RecentCreated');

type RecentCreatedProps = {
  userId: string,
}

export const RecentCreated = (props: RecentCreatedProps): JSX.Element => {
  const { userId } = props;

  const [pages, setPages] = useState<any>([]);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pagingLimit, setPagingLimit] = useState(10);

  const getMyRecentCreatedList = useCallback(async() => {
    const page = activePage;

    try {
      const res = await apiv3Get(`/users/${userId}/recent`, { page });
      const { totalCount, pages, limit } = res.data;

      setPages(pages);
      setTotalPages(totalCount);
      setPagingLimit(limit);
    }
    catch (error) {
      logger.error('failed to fetch data', error);
      toastError(error, 'Error occurred in bookmark page list');
    }
  }, [activePage, userId]);

  useEffect(() => {
    getMyRecentCreatedList();
  }, [getMyRecentCreatedList]);

  return (
    <div className="page-list-container-create">
      <ul className="page-list-ul page-list-ul-flat mb-3">

        {pages.map(page => (
          <li key={`recent-created:list-view:${page._id}`} className="mt-4">
            <PageListItemS page={page.page} />
          </li>
        ))}

      </ul>
      <PaginationWrapper
        activePage={activePage}
        changePage={setActivePage}
        totalItemsCount={totalPages}
        pagingLimit={pagingLimit}
        align="center"
        size="sm"
      />
    </div>
  );

};
