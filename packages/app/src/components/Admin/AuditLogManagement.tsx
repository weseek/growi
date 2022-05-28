import React, { FC, useState, useCallback } from 'react';

import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import {
  SupportedActionType, AllSupportedActionType, PageActions, CommentActions,
} from '~/interfaces/activity';
import { useSWRxActivityList } from '~/stores/activity';

import PaginationWrapper from '../PaginationWrapper';

import { ActivityTable } from './AuditLog/ActivityTable';
import { DateRangePicker } from './AuditLog/DateRangePicker';
import { SearchUsernameInput } from './AuditLog/SearchUsernameInput';
import { SelectActionDropdown } from './AuditLog/SelectActionDropdown';


const formatDate = (date: Date | null) => {
  if (date == null) {
    return '';
  }
  return format(new Date(date), 'yyyy/MM/dd');
};

const PAGING_LIMIT = 10;

export const AuditLogManagement: FC = () => {
  const { t } = useTranslation();

  /*
   * State
   */
  const [activePage, setActivePage] = useState<number>(1);
  const offset = (activePage - 1) * PAGING_LIMIT;
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [actionMap, setActionMap] = useState(
    new Map<SupportedActionType, boolean>(AllSupportedActionType.map(action => [action, true])),
  );

  /*
   * Fetch
   */
  const selectedDate = { startDate: formatDate(startDate), endDate: formatDate(endDate) };
  const selectedActionList = Array.from(actionMap.entries()).filter(v => v[1]).map(v => v[0]);
  const searchFilter = { action: selectedActionList, date: selectedDate };

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

  const datePickerChangedHandler = useCallback((dateList: Date[] | null[]) => {
    setActivePage(1);
    setStartDate(dateList[0]);
    setEndDate(dateList[1]);
  }, []);

  const actionCheckboxChangedHandler = useCallback((action: SupportedActionType) => {
    setActivePage(1);
    actionMap.set(action, !actionMap.get(action));
    setActionMap(new Map(actionMap.entries()));
  }, [actionMap, setActionMap]);

  const multipleActionCheckboxChangedHandler = useCallback((actions: SupportedActionType[], isChecked) => {
    setActivePage(1);
    actions.forEach(action => actionMap.set(action, isChecked));
    setActionMap(new Map(actionMap.entries()));
  }, [actionMap, setActionMap]);

  // eslint-disable-next-line max-len
  const activityCounter = `<b>${activityList.length === 0 ? 0 : offset + 1}</b> - <b>${(PAGING_LIMIT * activePage) - (PAGING_LIMIT - activityList.length)}</b> of <b>${totalActivityNum}<b/>`;

  return (
    <div data-testid="admin-auditlog">
      <h2 className="admin-setting-header mb-3">{t('AuditLog')}</h2>

      <SearchUsernameInput />

      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onChangeDatePicker={datePickerChangedHandler}
      />

      <SelectActionDropdown
        dropdownItems={[
          { actionCategory: 'Page', actionNames: PageActions },
          { actionCategory: 'Comment', actionNames: CommentActions },
        ]}
        actionMap={actionMap}
        onChangeAction={actionCheckboxChangedHandler}
        onChangeMultipleAction={multipleActionCheckboxChangedHandler}
      />

      { isLoading
        ? (
          <div className="text-muted text-center mb-5">
            <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
          </div>
        )
        : (
          <>
            <p
              className="ml-2"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: activityCounter }}
            />
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
