import React, {
  useCallback, useState, FC, useEffect, ReactNode,
} from 'react';

import nodePath from 'path';

import {
  pathUtils, pagePathUtils, Nullable,
} from '@growi/core';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { UncontrolledTooltip, DropdownToggle } from 'reactstrap';

import { bookmark, unbookmark, resumeRenameOperation } from '~/client/services/page-operation';
import { apiv3Put, apiv3Post } from '~/client/util/apiv3-client';
import { ValidationTarget } from '~/client/util/input-validator';
import { toastWarning, toastError, toastSuccess } from '~/client/util/toastr';
import { TriangleIcon } from '~/components/Icons/TriangleIcon';
import { NotAvailableForGuest } from '~/components/NotAvailableForGuest';
import { NotAvailableForReadOnlyUser } from '~/components/NotAvailableForReadOnlyUser';
import {
  IPageInfoAll, IPageToDeleteWithMeta,
} from '~/interfaces/page';
import { useSWRMUTxCurrentUserBookmarks } from '~/stores/bookmark';
import { IPageForPageDuplicateModal } from '~/stores/modal';
import { useSWRMUTxPageInfo } from '~/stores/page';
import { useSWRxPageChildren } from '~/stores/page-listing';
import { usePageTreeDescCountMap } from '~/stores/ui';
import { shouldRecoverPagePaths } from '~/utils/page-operation';

import ClosableTextInput from '../../Common/ClosableTextInput';
import CountBadge from '../../Common/CountBadge';
import { PageItemControl } from '../../Common/Dropdown/PageItemControl';

import { ItemNode } from './ItemNode';


interface ItemProps {
  isEnableActions: boolean
  isReadOnlyUser: boolean
  itemNode: ItemNode
  targetPathOrId?: Nullable<string>
  isOpen?: boolean
  onRenamed?(fromPath: string | undefined, toPath: string): void
  onClickDuplicateMenuItem?(pageToDuplicate: IPageForPageDuplicateModal): void
  onClickDeleteMenuItem?(pageToDelete: IPageToDeleteWithMeta): void
  itemRef?
  itemClass?: React.FunctionComponent<ItemProps>
  mainClassName?: string
}

// Utility to mark target
const markTarget = (children: ItemNode[], targetPathOrId?: Nullable<string>): void => {
  if (targetPathOrId == null) {
    return;
  }

  children.forEach((node) => {
    if (node.page._id === targetPathOrId || node.page.path === targetPathOrId) {
      node.page.isTarget = true;
    }
    else {
      node.page.isTarget = false;
    }
    return node;
  });
};

/**
 * Return new page path after the droppedPagePath is moved under the newParentPagePath
 * @param droppedPagePath
 * @param newParentPagePath
 * @returns
 */

/**
 * Return whether the fromPage could be moved under the newParentPage
 * @param fromPage
 * @param newParentPage
 * @param printLog
 * @returns
 */

// Component wrapper to make a child element not draggable
// https://github.com/react-dnd/react-dnd/issues/335
type NotDraggableProps = {
  children: ReactNode,
};
const NotDraggableForClosableTextInput = (props: NotDraggableProps): JSX.Element => {
  return <div draggable onDragStart={e => e.preventDefault()}>{props.children}</div>;
};


const SimpleItem: FC<ItemProps> = (props: ItemProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  const {
    itemNode, targetPathOrId, isOpen: _isOpen = false,
    onRenamed, onClickDuplicateMenuItem, onClickDeleteMenuItem, isEnableActions, isReadOnlyUser,
    itemRef, itemClass, mainClassName,
  } = props;

  const { page, children } = itemNode;

  const [currentChildren, setCurrentChildren] = useState(children);
  const [isOpen, setIsOpen] = useState(_isOpen);
  const [isNewPageInputShown, setNewPageInputShown] = useState(false);
  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const [isCreating, setCreating] = useState(false);

  const { data, mutate: mutateChildren } = useSWRxPageChildren(isOpen ? page._id : null);
  const { trigger: mutateCurrentUserBookmarks } = useSWRMUTxCurrentUserBookmarks();
  const { trigger: mutatePageInfo } = useSWRMUTxPageInfo(page._id ?? null);

  // descendantCount
  const { getDescCount } = usePageTreeDescCountMap();
  const descendantCount = getDescCount(page._id) || page.descendantCount || 0;


  // hasDescendants flag
  const isChildrenLoaded = currentChildren?.length > 0;
  const hasDescendants = descendantCount > 0 || isChildrenLoaded;

  const hasChildren = useCallback((): boolean => {
    return currentChildren != null && currentChildren.length > 0;
  }, [currentChildren]);

  const onClickLoadChildren = useCallback(async() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const onClickPlusButton = useCallback(() => {
    setNewPageInputShown(true);

    if (hasDescendants) {
      setIsOpen(true);
    }
  }, [hasDescendants]);

  const bookmarkMenuItemClickHandler = async(_pageId: string, _newValue: boolean): Promise<void> => {
    const bookmarkOperation = _newValue ? bookmark : unbookmark;
    await bookmarkOperation(_pageId);
    mutateCurrentUserBookmarks();
    mutatePageInfo();
  };

  const duplicateMenuItemClickHandler = useCallback((): void => {
    if (onClickDuplicateMenuItem == null) {
      return;
    }

    const { _id: pageId, path } = page;

    if (pageId == null || path == null) {
      throw Error('Any of _id and path must not be null.');
    }

    const pageToDuplicate = { pageId, path };

    onClickDuplicateMenuItem(pageToDuplicate);
  }, [onClickDuplicateMenuItem, page]);

  const renameMenuItemClickHandler = useCallback(() => {
    setRenameInputShown(true);
  }, []);

  const onPressEnterForRenameHandler = async(inputText: string) => {
    const parentPath = pathUtils.addTrailingSlash(nodePath.dirname(page.path ?? ''));
    const newPagePath = nodePath.resolve(parentPath, inputText);

    if (newPagePath === page.path) {
      setRenameInputShown(false);
      return;
    }

    try {
      setRenameInputShown(false);
      await apiv3Put('/pages/rename', {
        pageId: page._id,
        revisionId: page.revision,
        newPagePath,
      });

      if (onRenamed != null) {
        onRenamed(page.path, newPagePath);
      }

      toastSuccess(t('renamed_pages', { path: page.path }));
    }
    catch (err) {
      setRenameInputShown(true);
      toastError(err);
    }
  };

  const deleteMenuItemClickHandler = useCallback(async(_pageId: string, pageInfo: IPageInfoAll | undefined): Promise<void> => {
    if (onClickDeleteMenuItem == null) {
      return;
    }

    if (page._id == null || page.path == null) {
      throw Error('_id and path must not be null.');
    }

    const pageToDelete: IPageToDeleteWithMeta = {
      data: {
        _id: page._id,
        revision: page.revision as string,
        path: page.path,
      },
      meta: pageInfo,
    };

    onClickDeleteMenuItem(pageToDelete);
  }, [onClickDeleteMenuItem, page]);

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


  /**
   * Users do not need to know if all pages have been renamed.
   * Make resuming rename operation appears to be working fine to allow users for a seamless operation.
   */
  const pathRecoveryMenuItemClickHandler = async(pageId: string): Promise<void> => {
    try {
      await resumeRenameOperation(pageId);
      toastSuccess(t('page_operation.paths_recovered'));
    }
    catch {
      toastError(t('page_operation.path_recovery_failed'));
    }
  };

  const pageTreeItemClickHandler = (e) => {
    e.preventDefault();

    if (page.path == null || page._id == null) {
      return;
    }

    const link = pathUtils.returnPathForURL(page.path, page._id);

    router.push(link);
  };

  // didMount
  useEffect(() => {
    if (hasChildren()) setIsOpen(true);
  }, [hasChildren]);

  /*
   * Make sure itemNode.children and currentChildren are synced
   */
  useEffect(() => {
    if (children.length > currentChildren.length) {
      markTarget(children, targetPathOrId);
      setCurrentChildren(children);
    }
  }, [children, currentChildren.length, targetPathOrId]);

  /*
   * When swr fetch succeeded
   */
  useEffect(() => {
    if (isOpen && data != null) {
      const newChildren = ItemNode.generateNodesFromPages(data.children);
      markTarget(newChildren, targetPathOrId);
      setCurrentChildren(newChildren);
    }
  }, [data, isOpen, targetPathOrId]);

  // Rename process
  // Icon that draw attention from users for some actions
  const shouldShowAttentionIcon = page.processData != null ? shouldRecoverPagePaths(page.processData) : false;
  const pageName = nodePath.basename(page.path ?? '') || '/';

  const ItemClassFixed = itemClass ?? SimpleItem;

  const commonProps = {
    isEnableActions,
    isReadOnlyUser,
    isOpen: false,
    targetPathOrId,
    onRenamed,
    onClickDuplicateMenuItem,
    onClickDeleteMenuItem,
  };

  return (
    <div
      id={`pagetree-item-${page._id}`}
      data-testid="grw-pagetree-item-container"
      className={`grw-pagetree-item-container ${mainClassName}`}
    >
      <li
        ref={itemRef}
        className={`list-group-item list-group-item-action border-0 py-0 pr-3 d-flex align-items-center
        ${page.isTarget ? 'grw-pagetree-current-page-item' : ''}`}
        id={page.isTarget ? 'grw-pagetree-current-page-item' : `grw-pagetree-list-${page._id}`}
      >
        <div className="grw-triangle-container d-flex justify-content-center">
          {hasDescendants && (
            <button
              type="button"
              className={`grw-pagetree-triangle-btn btn ${isOpen ? 'grw-pagetree-open' : ''}`}
              onClick={onClickLoadChildren}
            >
              <div className="d-flex justify-content-center">
                <TriangleIcon />
              </div>
            </button>
          )}
        </div>
        {isRenameInputShown
          ? (
            <div className="flex-fill">
              <NotDraggableForClosableTextInput>
                <ClosableTextInput
                  value={nodePath.basename(page.path ?? '')}
                  placeholder={t('Input page name')}
                  onClickOutside={() => { setRenameInputShown(false) }}
                  onPressEnter={onPressEnterForRenameHandler}
                  validationTarget={ValidationTarget.PAGE}
                />
              </NotDraggableForClosableTextInput>
            </div>
          )
          : (
            <>
              {shouldShowAttentionIcon && (
                <>
                  <i id="path-recovery" className="fa fa-warning mr-2 text-warning"></i>
                  <UncontrolledTooltip placement="top" target="path-recovery" fade={false}>
                    {t('tooltip.operation.attention.rename')}
                  </UncontrolledTooltip>
                </>
              )}
              {page != null && page.path != null && page._id != null && (
                <div className="grw-pagetree-title-anchor flex-grow-1">
                  <p onClick={pageTreeItemClickHandler} className={`text-truncate m-auto ${page.isEmpty && 'grw-sidebar-text-muted'}`}>{pageName}</p>
                </div>
              )}
            </>
          )}
        {descendantCount > 0 && !isRenameInputShown && (
          <div className="grw-pagetree-count-wrapper">
            <CountBadge count={descendantCount} />
          </div>
        )}
        <NotAvailableForGuest>
          <div className="grw-pagetree-control d-flex">
            <PageItemControl
              pageId={page._id}
              isEnableActions={isEnableActions}
              isReadOnlyUser={isReadOnlyUser}
              onClickBookmarkMenuItem={bookmarkMenuItemClickHandler}
              onClickDuplicateMenuItem={duplicateMenuItemClickHandler}
              onClickRenameMenuItem={renameMenuItemClickHandler}
              onClickDeleteMenuItem={deleteMenuItemClickHandler}
              onClickPathRecoveryMenuItem={pathRecoveryMenuItemClickHandler}
              isInstantRename
              // Todo: It is wanted to find a better way to pass operationProcessData to PageItemControl
              operationProcessData={page.processData}
            >
              {/* pass the color property to reactstrap dropdownToggle props. https://6-4-0--reactstrap.netlify.app/components/dropdowns/  */}
              <DropdownToggle color="transparent" className="border-0 rounded btn-page-item-control p-0 grw-visible-on-hover mr-1">
                <i id='option-button-in-page-tree' className="icon-options fa fa-rotate-90 p-1"></i>
              </DropdownToggle>
            </PageItemControl>
          </div>
        </NotAvailableForGuest>

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
      </li>

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
      {
        isOpen && hasChildren() && currentChildren.map((node, index) => (
          <div key={node.page._id} className="grw-pagetree-item-children">
            {
              <ItemClassFixed itemNode={node} {...commonProps} />
            }
            {isCreating && (currentChildren.length - 1 === index) && (
              <div className="text-muted text-center">
                <i className="fa fa-spinner fa-pulse mr-1"></i>
              </div>
            )}
          </div>
        ))
      }
    </div>
  );

};

export default SimpleItem;
