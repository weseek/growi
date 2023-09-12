import React from 'react';

import nodePath from 'path';


import { pathUtils, pagePathUtils } from '@growi/core';
import { useTranslation } from 'next-i18next';

import { apiv3Post } from '~/client/util/apiv3-client';
import { ValidationTarget } from '~/client/util/input-validator';
import { toastWarning, toastError, toastSuccess } from '~/client/util/toastr';
import ClosableTextInput from '~/components/Common/ClosableTextInput';
import { useSWRxPageChildren } from '~/stores/page-listing';
import { usePageTreeDescCountMap } from '~/stores/ui';

import { NotDraggableForClosableTextInput } from './SimpleItem';

export const NewPageInput = (props) => {
  const { t } = useTranslation();

  const {
    page, isEnableActions, children, stateHandlers, isNewPageInputShown, setNewPageInputShown,
  } = props;

  const { isOpen, setIsOpen, setCreating } = stateHandlers;

  const currentChildren = children;

  const { mutate: mutateChildren } = useSWRxPageChildren(isOpen ? page._id : null);

  const { getDescCount } = usePageTreeDescCountMap();
  const descendantCount = getDescCount(page._id) || page.descendantCount || 0;

  const isChildrenLoaded = currentChildren?.length > 0;
  const hasDescendants = descendantCount > 0 || isChildrenLoaded;

  const onPressEnterForCreateHandler = async(inputText: string) => {
    setNewPageInputShown(false);
    // closeNewPageInput();
    const parentPath = pathUtils.addTrailingSlash(page.path as string);
    const newPagePath = nodePath.resolve(parentPath, inputText);
    const isCreatable = pagePathUtils.isCreatablePage(newPagePath);

    if (!isCreatable) {
      toastWarning(t('you_can_not_create_page_with_this_name'));
      return;
    }

    try {
      setCreating(true);

      await apiv3Post('/pages/', {
        path: newPagePath,
        body: undefined,
        grant: page.grant,
        grantUserGroupId: page.grantedGroup,
      });

      mutateChildren();

      if (!hasDescendants) {
        setIsOpen(true);
      }

      toastSuccess(t('successfully_saved_the_page'));
    }
    catch (err) {
      toastError(err);
    }
    finally {
      setCreating(false);
    }
  };

  return (
    <>
      {isEnableActions && isNewPageInputShown && (
        <NotDraggableForClosableTextInput>
          <ClosableTextInput
            placeholder={t('Input page name')}
            onClickOutside={() => { setNewPageInputShown(false) }}
            onPressEnter={onPressEnterForCreateHandler}
            validationTarget={ValidationTarget.PAGE}
          />
        </NotDraggableForClosableTextInput>
      )}
    </>
  );
};
