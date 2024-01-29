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
import { useCurrentPagePath, useSWRxCurrentPage } from '~/stores/page';

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

  const { data: currentPagePath, isLoading: isLoadingPagePath } = useCurrentPagePath();
  const { data: currentPage, isLoading } = useSWRxCurrentPage();
  const { data: currentUser } = useCurrentUser();

  const [isHovered, setIsHovered] = useState(false);

  const todaysPath = currentUser == null
    ? null
    : generateTodaysPath(currentUser, t('create_page_dropdown.todays.memo'));

  const { onClickHandler: onClickNewButton, isPageCreating: isNewPageCreating } = useOnNewButtonClicked(
    currentPage?.path, currentPage?.grant, currentPage?.grantedGroups, isLoading,
  );
  // TODO: https://redmine.weseek.co.jp/issues/138806
  const { onClickHandler: onClickTodaysButton, isPageCreating: isTodaysPageCreating } = useOnTodaysButtonClicked(todaysPath);
  // TODO: https://redmine.weseek.co.jp/issues/138805
  const { onClickHandler: onClickTemplateButton, isPageCreating: isTemplatePageCreating } = useOnTemplateButtonClicked(currentPagePath, isLoadingPagePath);

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
  };

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
      <Dropdown
        direction="end"
      >
        <DropendToggle
          // className="dropdown-toggle dropdown-toggle-split"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        />
        <DropendMenu
          onClickCreateNewPageButtonHandler={onClickNewButton}
          onClickCreateTodaysButtonHandler={onClickTodaysButton}
          onClickTemplateButtonHandler={onClickTemplateButtonHandler}
          todaysPath={todaysPath}
        />
      </Dropdown>
    </div>
  );
});
