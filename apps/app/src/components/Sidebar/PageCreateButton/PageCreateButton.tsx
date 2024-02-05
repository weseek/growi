import React, { useState, useCallback } from 'react';

import type { IUserHasId } from '@growi/core';
import { pagePathUtils } from '@growi/core/dist/utils';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'reactstrap';

import { useOnTemplateButtonClicked } from '~/client/services/use-on-template-button-clicked';
import { toastError } from '~/client/util/toastr';
import { LabelType } from '~/interfaces/template';
import { useCurrentUser } from '~/stores/context';
import { useSWRxCurrentPage, useSWRxNearestParentGrant } from '~/stores/page';

import { CreateButton } from './CreateButton';
import { DropendMenu } from './DropendMenu';
import { DropendToggle } from './DropendToggle';
import { useOnNewButtonClicked, useOnTodaysButtonClicked } from './hooks';


const generateTodaysPath = (currentUser: IUserHasId, parentDirName: string) => {
  const now = format(new Date(), 'yyyy/MM/dd');
  const userHomepagePath = pagePathUtils.userHomepagePath(currentUser);
  return `${userHomepagePath}/${parentDirName}/${now}`;
};

export const PageCreateButton = React.memo((): JSX.Element => {
  const { t } = useTranslation('commons');

  const { data: currentPage, isLoading } = useSWRxCurrentPage();
  const { data: currentUser } = useCurrentUser();
  const { data: parentGrantData } = useSWRxNearestParentGrant(currentPage?.path ?? '/');

  const [isHovered, setIsHovered] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const todaysPath = currentUser == null
    ? null
    : generateTodaysPath(currentUser, t('create_page_dropdown.todays.memo'));

  const { onClickHandler: onClickNewButton, isPageCreating: isNewPageCreating } = useOnNewButtonClicked(
    currentPage?.path, currentPage?.grant, currentPage?.grantedGroups, isLoading,
  );
  const { onClickHandler: onClickTodaysButton, isPageCreating: isTodaysPageCreating } = useOnTodaysButtonClicked(todaysPath);
  const { onClickHandler: onClickTemplateButton, isPageCreating: isTemplatePageCreating } = useOnTemplateButtonClicked(
    currentPage?.path, isLoading, parentGrantData?.grant, parentGrantData?.grantedGroups,
  );

  const onClickTemplateButtonHandler = useCallback(async(label: LabelType) => {
    try {
      await onClickTemplateButton(label);
    }
    catch (err) {
      toastError(err);
    }
  }, [onClickTemplateButton]);

  const onMouseEnterHandler = () => {
    setIsHovered(true);
  };

  const onMouseLeaveHandler = () => {
    setIsHovered(false);
    setDropdownOpen(false);
  };

  const toggle = () => setDropdownOpen(!dropdownOpen);

  return (
    <div
      className="d-flex flex-row"
      onMouseEnter={onMouseEnterHandler}
      onMouseLeave={onMouseLeaveHandler}
    >
      <div className="btn-group flex-grow-1">
        <CreateButton
          className="z-2"
          onClick={onClickNewButton}
          disabled={isNewPageCreating || isTodaysPageCreating || isTemplatePageCreating}
        />
      </div>
      { isHovered && (
        <Dropdown
          isOpen={dropdownOpen}
          toggle={toggle}
          direction="end"
          className="position-absolute"
        >
          <DropendToggle />
          <DropendMenu
            onClickCreateNewPageButtonHandler={onClickNewButton}
            onClickCreateTodaysButtonHandler={onClickTodaysButton}
            onClickTemplateButtonHandler={onClickTemplateButtonHandler}
            todaysPath={todaysPath}
          />
        </Dropdown>
      )}
    </div>
  );
});
