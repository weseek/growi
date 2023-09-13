import React from 'react';

import { useTranslation } from 'next-i18next';
import { DropdownItem } from 'reactstrap';


type CommunicationMenuItemsProps = {
  pageId: string,
  onClickWokflowMenuItem: (pageId: string) => void,
}

export const CommunicationMenuItems = (props: CommunicationMenuItemsProps): JSX.Element => {
  const { t } = useTranslation();

  const { pageId, onClickWokflowMenuItem } = props;

  return (
    // TODO: Add dropdown items for announcements and in-app notifications
    <DropdownItem onClick={() => onClickWokflowMenuItem(pageId)}>
      <i className="fa fa-fw icon-organization grw-page-control-dropdown-icon"></i>
      { t('approval_workflow.approval_workflow') }
    </DropdownItem>
  );
};
