import React, { FC, useState, useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import {
  SupportedActionType, AllSupportedActionType, PageActions, CommentActions,
} from '~/interfaces/activity';
import { useSWRxActivityList } from '~/stores/activity';

import PaginationWrapper from '../PaginationWrapper';

import { ActivityTable } from './AuditLog/ActivityTable';
import { SelectActionDropdown } from './AuditLog/SelectActionDropdown';

const PAGING_LIMIT = 10;

export const AuditLogManagement: FC = () => {
  const { t } = useTranslation();

  /*
   * State
   */
  const [activePage, setActivePage] = useState<number>(1);
  const offset = (activePage - 1) * PAGING_LIMIT;
  const [actionMap, setActionMap] = useState(
    new Map<SupportedActionType, boolean>(AllSupportedActionType.map(action => [action, true])),
  );

  /*
   * Fetch
   */
  const selectedActionList = Array.from(actionMap.entries()).filter(v => v[1]).map(v => v[0]);
  const searchFilter = { action: selectedActionList };

  const { data: activityListData, error } = useSWRxActivityList(PAGING_LIMIT, offset, searchFilter);
  const activityList = activityListData?.docs != null ? activityListData.docs : [];
  const totalActivityNum = activityListData?.totalDocs != null ? activityListData.totalDocs : 0;
  const isLoading = activityListData === undefined && error == null;

  /*
   * Functions
   */
  const setActivePageHandler = useCallback((selectedPageNum: number) => {
    setActivePage(selectedPageNum);
  }, []);

  const selectActionCheckboxChangedHandler = useCallback((action: SupportedActionType) => {
    setActivePage(1);
    actionMap.set(action, !actionMap.get(action));
    setActionMap(new Map(actionMap.entries()));
  }, [actionMap, setActionMap]);

  const selectMultipleActionCheckboxChangedHandler = useCallback((actions: SupportedActionType[], isChecked) => {
    setActivePage(1);
    actions.forEach(action => actionMap.set(action, isChecked));
    setActionMap(new Map(actionMap.entries()));
  }, [actionMap, setActionMap]);

  return (
    <div data-testid="admin-auditlog">
      <h2>{t('AuditLog')}</h2>

      <SelectActionDropdown
        dropdownItems={[
          { actionCategory: 'Page', actionNames: PageActions },
          { actionCategory: 'Comment', actionNames: CommentActions },
        ]}
        actionMap={actionMap}
        onSelectAction={selectActionCheckboxChangedHandler}
        onSelectMultipleAction={selectMultipleActionCheckboxChangedHandler}
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
              changePage={setActivePageHandler}
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
