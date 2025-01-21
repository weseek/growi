import React from 'react';

import { useTranslation } from 'react-i18next';
import {
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import { useSWRxUserRelatedGroups } from '~/stores/user';


export const ShareScopeDropdown = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: userRelatedGroups } = useSWRxUserRelatedGroups();

  return (
    <UncontrolledDropdown>
      <DropdownToggle role="button" caret color="secondary" outline className="border-0 ">
        アクセス権限と同じ範囲
      </DropdownToggle>

      <DropdownMenu>
        <DropdownItem>自分がアクセスできるページ</DropdownItem>
        <DropdownItem>グローバル</DropdownItem>
        <DropdownItem>自分が所属てい</DropdownItem>

        { userRelatedGroups != null && userRelatedGroups.relatedGroups.map(group => (
          <DropdownItem>
            { group.item.name }
          </DropdownItem>
        ))}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};
