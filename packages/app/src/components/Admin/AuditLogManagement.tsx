import React, { FC, useState, useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import {
  SUPPORTED_TARGET_MODEL_TYPE, SupportedActionType, AllSupportedPageAction, AllSupportedCommentAction, AllSupportedActionType,
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

  const [checkedItems, setCheckedItems] = useState(
    new Map<SupportedActionType, boolean>(AllSupportedActionType.map(action => [action, true])),
  );

  /*
   * Fetch
   */
  const query = {
    action: ['PAGE_LIKE'],
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

  const checkActionNameHandler = useCallback((action: SupportedActionType) => {
    setCheckedItems(new Map(checkedItems.set(action, !checkedItems.get(action))));
  }, [checkedItems, setCheckedItems]);

  return (
    <div data-testid="admin-auditlog">
      <h2>{t('AuditLog')}</h2>

      <SelectActionDropdown
        dropdownItems={[
          {
            targetModelName: SUPPORTED_TARGET_MODEL_TYPE.MODEL_PAGE,
            actionNames: AllSupportedPageAction,
            checkedItems,
            onCheckItem: checkActionNameHandler,
          },
          {
            targetModelName: SUPPORTED_TARGET_MODEL_TYPE.MODEL_COMMENT,
            actionNames: AllSupportedCommentAction,
            checkedItems,
            onCheckItem: checkActionNameHandler,
          },
        ]}
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
