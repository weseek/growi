import React, { useState, useCallback } from 'react';

import type { Nullable, IUserHasId } from '@growi/core';
import { pagePathUtils } from '@growi/core/dist/utils';
import { format } from 'date-fns';

import { useOnTemplateButtonClicked } from '~/client/services/use-on-template-button-clicked';
import { toastError } from '~/client/util/toastr';
import { LabelType } from '~/interfaces/template';
import { useCurrentUser, useIsGuestUser } from '~/stores/context';
import { useSWRxCurrentPage } from '~/stores/page';

import { CreateButton } from './CreateButton';
import { DropendMenu } from './DropendMenu';
import { DropendToggle } from './DropendToggle';
import { useOnNewButtonClicked, useOnTodaysButtonClicked } from './hooks';

const generateTodaysPath = (currentUser?: Nullable<IUserHasId>, isGuestUser?: boolean) => {
  if (isGuestUser) {
    return null;
  }

  const now = format(new Date(), 'yyyy/MM/dd');
  const userHomepagePath = pagePathUtils.userHomepagePath(currentUser);
  return `${userHomepagePath}/memo/${now}`;
};

export const PageCreateButton = React.memo((): JSX.Element => {
  const { data: currentPage, isLoading } = useSWRxCurrentPage();
  const { data: currentUser } = useCurrentUser();
  const { data: isGuestUser } = useIsGuestUser();

  const [isHovered, setIsHovered] = useState(false);

  const todaysPath = generateTodaysPath(currentUser, isGuestUser);

  const { onClickHandler: onClickNewButton, isPageCreating: isNewPageCreating } = useOnNewButtonClicked(isLoading, currentPage);
  const { onClickHandler: onClickTodaysButton, isPageCreating: isTodaysPageCreating } = useOnTodaysButtonClicked(todaysPath);
  const { onClickHandler: onClickTemplateButton, isPageCreating: isTemplatePageCreating } = useOnTemplateButtonClicked(currentPage?.path);

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
      { isHovered && (
        <div className="btn-group dropend position-absolute">
          <DropendToggle
            className="dropdown-toggle dropdown-toggle-split"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          />
          <DropendMenu
            onClickCreateNewPageButtonHandler={onClickNewButton}
            onClickCreateTodaysButtonHandler={onClickTodaysButton}
            onClickTemplateButtonHandler={onClickTemplateButtonHandler}
            todaysPath={todaysPath}
          />
        </div>
      )}
    </div>
  );
});
