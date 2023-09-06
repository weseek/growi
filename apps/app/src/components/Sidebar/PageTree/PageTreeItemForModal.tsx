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
import { NotAvailableForGuest } from '~/components/NotAvailableForGuest';
import { NotAvailableForReadOnlyUser } from '~/components/NotAvailableForReadOnlyUser';
import { IPageHasId } from '~/interfaces/page';
import { mutatePageTree, useSWRxPageChildren } from '~/stores/page-listing';
import { usePageTreeDescCountMap } from '~/stores/ui';
import { useStaticSWR } from '~/stores/use-static-swr';
import loggerFactory from '~/utils/logger';


import ClosableTextInput from '../../Common/ClosableTextInput';

import { ItemNode } from './ItemNode';
// import { SimpleItem, SimpleItemProps } from './SimpleItem';
import SimpleItem, { SimpleItemProps, SimpleItemTool, NotDraggableForClosableTextInput } from './SimpleItem';

const logger = loggerFactory('growi:cli:Item');

const useNewPageInput = (status?) => {
  const initialStatus = { isNewPageInputShown: false };
  const swrResponse = useStaticSWR('childPageCreateTextarea', status, { fallbackData: initialStatus });

  return {
    ...swrResponse,
    open: () => swrResponse.mutate({ isNewPageInputShown: true }),
    close: () => swrResponse.mutate({ isNewPageInputShown: false }),
  };
};

const ChildPageCreateButton = (props) => {
  const {
    page, isOpen: _isOpen = false, isEnableActions, itemNode, children,
  } = props;

  // const { page, children } = itemNode;

  const currentChildren = children;

  // const [currentChildren, setCurrentChildren] = useState(children);
  // const [isNewPageInputShown, setNewPageInputShown] = useState(false);
  const [isOpen, setIsOpen] = useState(_isOpen);

  // const { data, mutate: mutateChildren } = useSWRxPageChildren(isOpen ? page._id : null);

  const {
    open: openNewPageInput,
  } = useNewPageInput();

  // descendantCount
  const { getDescCount } = usePageTreeDescCountMap();
  const descendantCount = getDescCount(page._id) || page.descendantCount || 0;

  const isChildrenLoaded = currentChildren?.length > 0;
  const hasDescendants = descendantCount > 0 || isChildrenLoaded;

  // type NotDraggableProps = {
  //   children: ReactNode,
  // };

  const onClickPlusButton = useCallback(() => {
    // setNewPageInputShown(true);
    openNewPageInput();

    if (hasDescendants) {
      setIsOpen(true);
    }
  }, [hasDescendants]);


  // console.log(!pagePathUtils.isUsersTopPage(page.path ?? ''));

  return (
    <>
      <SimpleItemTool page={page} isEnableActions={false} isReadOnlyUser={false}/>

      {!pagePathUtils.isUsersTopPage(page.path ?? '') && (
        <NotAvailableForGuest>
          <NotAvailableForReadOnlyUser>
            <button
              id='page-create-button-in-page-tree'
              type="button"
              className="border-0 rounded btn btn-page-item-control p-0 grw-visible-on-hover"
              onClick={onClickPlusButton}
            >
              <i className="icon-plus d-block p-0" />
            </button>
          </NotAvailableForReadOnlyUser>
        </NotAvailableForGuest>
      )}
    </>
  );
};

const NewPageInput = (props) => {
  const { t } = useTranslation();

  const {
    page, isOpen: _isOpen = false, isEnableActions, itemNode, children,
  } = props;

  // const { page, children } = itemNode;

  const currentChildren = children;

  // const [currentChildren, setCurrentChildren] = useState(children);
  // const [isNewPageInputShown, setNewPageInputShown] = useState(false);
  const [isCreating, setCreating] = useState(false);
  const [isOpen, setIsOpen] = useState(_isOpen);

  const { data, mutate: mutateChildren } = useSWRxPageChildren(isOpen ? page._id : null);

  const {
    data: newPageInputData,
    close: closeNewPageInput,
  } = useNewPageInput();

  const isNewPageInputShown = newPageInputData?.isNewPageInputShown ?? false;

  // descendantCount
  const { getDescCount } = usePageTreeDescCountMap();
  const descendantCount = getDescCount(page._id) || page.descendantCount || 0;

  const isChildrenLoaded = currentChildren?.length > 0;
  const hasDescendants = descendantCount > 0 || isChildrenLoaded;

  const onPressEnterForCreateHandler = async(inputText: string) => {
    // setNewPageInputShown(false);
    closeNewPageInput();
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

  console.log(isNewPageInputShown);

  return (
    <>
      {isEnableActions && isNewPageInputShown && (
        <div className="flex-fill">
          <NotDraggableForClosableTextInput>
            <ClosableTextInput
              placeholder={t('Input page name')}
              onClickOutside={() => { closeNewPageInput() }}
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
  // const { page } = itemNode;
  // const [isOpen, setIsOpen] = useState(_isOpen);
  // const [shouldHide, setShouldHide] = useState(false);
  // const { mutate: mutateChildren } = useSWRxPageChildren(isOpen ? page._id : null);

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
      customComponentUnderItem={NewPageInput}
      itemClass={PageTreeItemForModal}
      customComponent={ChildPageCreateButton}
    />
  );
};
