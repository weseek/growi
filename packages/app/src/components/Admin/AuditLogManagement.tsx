import React, { FC, useState, useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { AllSupportedActionType } from '~/interfaces/activity';
import { useSWRxActivityList } from '~/stores/activity';

import PaginationWrapper from '../PaginationWrapper';

import { ActivityTable } from './AuditLog/ActivityTable';


type SelectQueryDropdownProps = {
  dropdownLabel: string
  dropdownItemList: string[]
}

const SelectQueryDropdown: FC<SelectQueryDropdownProps> = (props: SelectQueryDropdownProps) => {
  const { t } = useTranslation();
  return (
    <div className="btn-group mr-2 mb-3">
      <div className="dropdown">
        <button className="btn btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown">
          {t(`admin:audit_log_management.${props.dropdownLabel}`)}
        </button>
        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          {
            props.dropdownItemList.map(item => (
              <button
                type="button"
                className="dropdown-item"
              >
                {item}
              </button>
            ))
          }
        </ul>
      </div>
    </div>
  );
};

const SelectQueryDropdownLabel = {
  SELECT_ACTION: 'select_action',
} as const;

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

      { isLoading
        ? (
          <div className="text-muted text-center mb-5">
            <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
          </div>
        )
        : (
          <>
            <SelectQueryDropdown
              dropdownLabel={SelectQueryDropdownLabel.SELECT_ACTION}
              dropdownItemList={AllSupportedActionType}
            />

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
