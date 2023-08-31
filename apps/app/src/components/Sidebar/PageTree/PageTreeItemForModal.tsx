import React, {
  useCallback, useState, FC, ReactNode,
} from 'react';

import nodePath from 'path';

import { pathUtils, pagePathUtils } from '@growi/core';
import { useTranslation } from 'next-i18next';
import { useDrag, useDrop } from 'react-dnd';

import { apiv3Put, apiv3Post } from '~/client/util/apiv3-client';
import { ValidationTarget } from '~/client/util/input-validator';
import { toastWarning, toastError, toastSuccess } from '~/client/util/toastr';
import { IPageHasId } from '~/interfaces/page';
import { mutatePageTree, useSWRxPageChildren } from '~/stores/page-listing';
import { usePageTreeDescCountMap } from '~/stores/ui';
import loggerFactory from '~/utils/logger';

import ClosableTextInput from '../../Common/ClosableTextInput';

import { ItemNode } from './ItemNode';
import SimpleItem, { SimpleItemProps } from './SimpleItem';

const logger = loggerFactory('growi:cli:Item');

type NotDraggableProps = {
  children: ReactNode,
};
const NotDraggableForClosableTextInput = (props: NotDraggableProps): JSX.Element => {
  return <div draggable onDragStart={e => e.preventDefault()}>{props.children}</div>;
};

const ChildPageCreateButton = (props) => {
  const { t } = useTranslation();

  const {
    page, isOpen: _isOpen = false, isEnableActions, children,
  } = props;

  const [currentChildren, setCurrentChildren] = useState(children);
  const [isNewPageInputShown, setNewPageInputShown] = useState(false);
  const [isCreating, setCreating] = useState(false);
  const [isOpen, setIsOpen] = useState(_isOpen);

  const { data, mutate: mutateChildren } = useSWRxPageChildren(isOpen ? page._id : null);

  // descendantCount
  const { getDescCount } = usePageTreeDescCountMap();
  const descendantCount = getDescCount(page._id) || page.descendantCount || 0;

  const isChildrenLoaded = currentChildren?.length > 0;
  const hasDescendants = descendantCount > 0 || isChildrenLoaded;

  const onPressEnterForCreateHandler = async(inputText: string) => {
    setNewPageInputShown(false);
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
        <div className="flex-fill">
          <NotDraggableForClosableTextInput>
            <ClosableTextInput
              placeholder={t('Input page name')}
              onClickOutside={() => { setNewPageInputShown(false) }}
              onPressEnter={onPressEnterForCreateHandler}
              validationTarget={ValidationTarget.PAGE}
            />
          </NotDraggableForClosableTextInput>
        </div>
      )}
    </>
  );
};

type Optional = 'itemRef' | 'itemClass' | 'mainClassName';
type PageTreeItemProps = Omit<SimpleItemProps, Optional> & {key};

export const PageTreeItemForModal = (props) => {
  const {
    itemNode, isOpen: _isOpen = false, onRenamed,
  } = props;
  const { page } = itemNode;
  const [isOpen, setIsOpen] = useState(_isOpen);
  const [shouldHide, setShouldHide] = useState(false);
  const { mutate: mutateChildren } = useSWRxPageChildren(isOpen ? page._id : null);

  return (
    <SimpleItem
      key={props.key}
      targetPathOrId={props.targetPathOrId}
      itemNode={props.itemNode}
      isOpen
      isEnableActions={props.isEnableActions}
      isReadOnlyUser={props.isReadOnlyUser}
      onRenamed={props.onRenamed}
      onClickDuplicateMenuItem={props.onClickDuplicateMenuItem}
      onClickDeleteMenuItem={props.onClickDeleteMenuItem}
    />
  );
};
