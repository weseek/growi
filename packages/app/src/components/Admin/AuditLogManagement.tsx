import React, { FC, useState, useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { useSWRxActivityList } from '~/stores/activity';

import PaginationWrapper from '../PaginationWrapper';

import { ActivityTable } from './AuditLog/ActivityTable';


const PAGING_LIMIT = 10;

export const AuditLogManagement: FC = () => {
  const { t } = useTranslation();

  /*
   * State
   */
  const [activePage, setActivePage] = useState<number>(1);
  const [offset, setOffset] = useState<number>(0);

  /*
    * Fetch
    */
  const { data: activityListData, error } = useSWRxActivityList(PAGING_LIMIT, offset);
  const activityList = activityListData?.docs != null ? activityListData.docs : [];
  const totalActivityNum = activityListData?.totalDocs != null ? activityListData.totalDocs : 0;
  const isLoading = activityListData === undefined && error == null;

  /*
    * Functions
    */
  const setOffsetByPageNumber = useCallback((selectedPageNum: number) => {
    setActivePage(selectedPageNum);
    setOffset((selectedPageNum - 1) * PAGING_LIMIT);
  }, []);

  return (
    <div data-testid="admin-auditlog">
      <h2>{t('AuditLog')}</h2>
      <>
        <ActivityTable activityList={activityList} />
        <PaginationWrapper
          activePage={activePage}
          changePage={setOffsetByPageNumber}
          totalItemsCount={totalActivityNum}
          pagingLimit={PAGING_LIMIT}
          align="center"
          size="sm"
        />
      </>
    </div>
  );
};
