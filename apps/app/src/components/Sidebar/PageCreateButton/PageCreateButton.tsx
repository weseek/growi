import React, { useState, useCallback } from 'react';

import type { IUserHasId } from '@growi/core';
import { pagePathUtils } from '@growi/core/dist/utils';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'reactstrap';

import { useCreateTemplatePage } from '~/client/services/use-create-template-page';
import { toastError } from '~/client/util/toastr';
import type { LabelType } from '~/interfaces/template';
import { useCurrentUser } from '~/stores/context';
import { useSWRxCurrentPage } from '~/stores/page';

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

  const [isHovered, setIsHovered] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const todaysPath = currentUser == null
    ? null
    : generateTodaysPath(currentUser, t('create_page_dropdown.todays.memo'));

  const { onClickHandler: onClickNewButton, isPageCreating: isNewPageCreating } = useOnNewButtonClicked(
    currentPage?.path, isLoading,
  );
  // TODO: https://redmine.weseek.co.jp/issues/138806
  const { onClickHandler: onClickTodaysButton, isPageCreating: isTodaysPageCreating } = useOnTodaysButtonClicked(todaysPath);
  // TODO: https://redmine.weseek.co.jp/issues/138805
  const {
    createTemplate,
    isCreating: isTemplatePageCreating, isCreatable: isTemplatePageCreatable,
  } = useCreateTemplatePage();

  const onClickTemplateButtonHandler = useCallback(async(label: LabelType) => {
    try {
      await createTemplate?.(label);
    }
    catch (err) {
      toastError(err);
    }
  }, [createTemplate]);

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
            onClickTemplateButtonHandler={isTemplatePageCreatable ? onClickTemplateButtonHandler : undefined}
            todaysPath={todaysPath}
          />
        </Dropdown>
      )}
    </div>
  );
});
