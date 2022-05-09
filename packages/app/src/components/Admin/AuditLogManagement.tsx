import React, { FC, useState, useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { AllSupportedActionType } from '~/interfaces/activity';
import { useSWRxActivityList } from '~/stores/activity';

import PaginationWrapper from '../PaginationWrapper';

import { ActivityTable } from './AuditLog/ActivityTable';
import { SelectQueryItemsDropdown } from './AuditLog/SelectQueryItemsDropdown';


const PAGING_LIMIT = 10;

export const AuditLogManagement: FC = () => {
  const { t } = useTranslation();

  /*
   * State
   */
  const [activePage, setActivePage] = useState<number>(1);
  const offset = (activePage - 1) * PAGING_LIMIT;
  const [actionNames, setActionNames] = useState<string[] | undefined>(undefined);

  /*
   * Fetch
   */
  const query = {
    action: actionNames,
  };
  const { data: activityListData, error } = useSWRxActivityList(PAGING_LIMIT, offset, query);
  const activityList = activityListData?.docs != null ? activityListData.docs : [];
  const totalActivityNum = activityListData?.totalDocs != null ? activityListData.totalDocs : 0;
  const isLoading = activityListData === undefined && error == null;

  /*
   * Functions
   */
  const setActivePageBySelectedPageNum = useCallback((selectedPageNum: number) => {
    setActivePage(selectedPageNum);
  }, []);

  const checkActionNameHandler = useCallback((checkedItems: string[]) => {
    setActivePage(1);
    setActionNames(checkedItems.length === 0 ? undefined : checkedItems);
  }, []);

  return (
    <div data-testid="admin-auditlog">
      <h2>{t('AuditLog')}</h2>

      <SelectQueryItemsDropdown
        dropdownLabel="select_action"
        dropdownItemList={AllSupportedActionType}
        onCheckItem={checkActionNameHandler}
      />

      { isLoading
        ? (
          <div className="text-muted text-center mb-5">
            <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
          </div>
        )
        : (
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
        )
      }
    </div>
  );
};
