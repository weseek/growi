import React, { useState, useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { Dropdown } from 'reactstrap';

import { useCreateTemplatePage } from '~/client/services/create-page';
import { toastError } from '~/client/util/toastr';

import { CreateButton } from './CreateButton';
import { DropendMenu } from './DropendMenu';
import { DropendToggle } from './DropendToggle';
import { useCreateNewPage, useCreateTodaysMemo } from './hooks';


const useToastrOnError = <P, R>(method?: (param?: P) => Promise<R|undefined>): (param?: P) => Promise<R|undefined> => {
  const { t } = useTranslation('commons');

  return useCallback(async(param) => {
    try {
      return await method?.(param);
    }
    catch (err) {
      toastError(t('toaster.create_failed', { target: 'a page' }));
    }
  }, [method, t]);
};


export const PageCreateButton = React.memo((): JSX.Element => {
  const [isHovered, setIsHovered] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { createNewPage, isCreating: isNewPageCreating } = useCreateNewPage();
  // TODO: https://redmine.weseek.co.jp/issues/138806
  const { createTodaysMemo, isCreating: isTodaysPageCreating, todaysPath } = useCreateTodaysMemo();
  // TODO: https://redmine.weseek.co.jp/issues/138805
  const {
    createTemplate,
    isCreating: isTemplatePageCreating, isCreatable: isTemplatePageCreatable,
  } = useCreateTemplatePage();

  const createNewPageWithToastr = useToastrOnError(createNewPage);
  const createTodaysMemoWithToastr = useToastrOnError(createTodaysMemo);
  const createTemplateWithToastr = useToastrOnError(createTemplate);

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
      className="d-flex flex-row mt-2"
      onMouseEnter={onMouseEnterHandler}
      onMouseLeave={onMouseLeaveHandler}
    >
      <div className="btn-group flex-grow-1">
        <CreateButton
          className="z-2"
          onClick={createNewPageWithToastr}
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
            onClickCreateNewPage={createNewPageWithToastr}
            onClickCreateTodaysMemo={createTodaysMemoWithToastr}
            onClickCreateTemplate={isTemplatePageCreatable ? createTemplateWithToastr : undefined}
            todaysPath={todaysPath}
          />
        </Dropdown>
      )}
    </div>
  );
});
