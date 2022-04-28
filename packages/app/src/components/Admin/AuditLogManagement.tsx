import React, { FC, useState, useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { useSWRxActivityList } from '~/stores/activity';

import PaginationWrapper from '../PaginationWrapper';

import { ActivityTable } from './AuditLog/ActivityTable';


const PAGING_LIMIT = 10;

export const AuditLogManagement: FC = () => {
  const { t } = useTranslation();

  const [activePage, setActivePage] = useState<number>(1);
  const offset = (activePage - 1) * PAGING_LIMIT;

  const { data: activityListData, error } = useSWRxActivityList(PAGING_LIMIT, offset);
  const activityList = activityListData?.docs != null ? activityListData.docs : [];
  const totalActivityNum = activityListData?.totalDocs != null ? activityListData.totalDocs : 0;
  const isLoading = activityListData === undefined && error == null;

  const setActivePageBySelectedPageNum = useCallback((selectedPageNum: number) => {
    setActivePage(selectedPageNum);
  }, []);

  return (
    <div data-testid="admin-auditlog">
      <h2>{t('AuditLog')}</h2>
      <>
        <ActivityTable activityList={activityList} />
        <PaginationWrapper
          activePage={activePage}
          changePage={setActivePageBySelectedPageNum}
          totalItemsCount={totalActivityNum}
          pagingLimit={PAGING_LIMIT}
          align="center"
          size="sm"
        />
      </>
    </div>
  );
};
