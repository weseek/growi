import React, { FC, useState, useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { AllSupportedActionType } from '~/interfaces/activity';
import { useSWRxActivityList } from '~/stores/activity';

import PaginationWrapper from '../PaginationWrapper';

import { ActivityTable } from './AuditLog/ActivityTable';


const SelectQueryDropdownLabel = {
  SELECT_ACTION: 'select_action',
} as const;

const allSelectQueryDropdownLabel = Object.values(SelectQueryDropdownLabel);

type SelectQueryDropdownProps = {
  dropdownLabel: typeof allSelectQueryDropdownLabel[keyof typeof allSelectQueryDropdownLabel];
  dropdownItemList: string[]
  setQueryHandler: (query: string) => void
}

const SelectQueryDropdown: FC<SelectQueryDropdownProps> = (props: SelectQueryDropdownProps) => {
  const { t } = useTranslation();

  const { dropdownLabel, dropdownItemList, setQueryHandler } = props;

  const [selectedItem, setSelectedItem] = useState('');

  const onClickItemButton = useCallback((item) => {
    if (setQueryHandler == null) {
      return;
    }
    setQueryHandler(item);
    setSelectedItem(item);
  }, [setQueryHandler, setSelectedItem]);

  return (
    <div className="btn-group mr-2 mb-3">
      <div className="dropdown">
        <button className="btn btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown">
          {selectedItem !== '' ? selectedItem : t(`admin:audit_log_management.${dropdownLabel}`)}
        </button>
        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          {
            dropdownItemList.map(item => (
              <button
                key={item}
                type="button"
                className="dropdown-item"
                onClick={() => onClickItemButton(item)}
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

const PAGING_LIMIT = 10;

export const AuditLogManagement: FC = () => {
  const { t } = useTranslation();

  const [activePage, setActivePage] = useState<number>(1);
  const offset = (activePage - 1) * PAGING_LIMIT;
  const [actionQuery, setActionQuery] = useState('');

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
              setQueryHandler={setActionQuery}
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
