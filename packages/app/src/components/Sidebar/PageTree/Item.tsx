import React, {
  useCallback, useState, FC, useEffect,
} from 'react';
import { DropdownToggle } from 'reactstrap';
import { useTranslation } from 'react-i18next';

import { useDrag, useDrop } from 'react-dnd';

import nodePath from 'path';

import { pathUtils, pagePathUtils } from '@growi/core';

import loggerFactory from '~/utils/logger';

import { toastWarning, toastError, toastSuccess } from '~/client/util/apiNotification';

import { useSWRxPageChildren } from '~/stores/page-listing';
import { apiv3Put, apiv3Post } from '~/client/util/apiv3-client';
import { IPageForPageDuplicateModal } from '~/stores/modal';

import TriangleIcon from '~/components/Icons/TriangleIcon';
import { bookmark, unbookmark } from '~/client/services/page-operation';
import ClosableTextInput, { AlertInfo, AlertType } from '../../Common/ClosableTextInput';
import { PageItemControl } from '../../Common/Dropdown/PageItemControl';
import { ItemNode } from './ItemNode';
import { usePageTreeDescCountMap } from '~/stores/ui';
import {
  IPageHasId, IPageInfoAll, IPageToDeleteWithMeta,
} from '~/interfaces/page';


const logger = loggerFactory('growi:cli:Item');


interface ItemProps {
  isEnableActions: boolean
  itemNode: ItemNode
  targetPathOrId?: string
  isScrolled: boolean,
  isOpen?: boolean
  isEnabledAttachTitleHeader?: boolean
  onRenamed?(): void
  onClickDuplicateMenuItem?(pageToDuplicate: IPageForPageDuplicateModal): void
  onClickDeleteMenuItem?(pageToDelete: IPageToDeleteWithMeta): void
}

// Utility to mark target
const markTarget = (children: ItemNode[], targetPathOrId?: string): void => {
  if (targetPathOrId == null) {
    return;
  }

  children.forEach((node) => {
    if (node.page._id === targetPathOrId || node.page.path === targetPathOrId) {
      node.page.isTarget = true;
    }
    return node;
  });
};


const bookmarkMenuItemClickHandler = async(_pageId: string, _newValue: boolean): Promise<void> => {
  const bookmarkOperation = _newValue ? bookmark : unbookmark;
  await bookmarkOperation(_pageId);
};

/**
 * Return new page path after the droppedPagePath is moved under the newParentPagePath
 * @param droppedPagePath
 * @param newParentPagePath
 * @returns
 */
const getNewPathAfterMoved = (droppedPagePath: string, newParentPagePath: string): string => {
  const pageTitle = nodePath.basename(droppedPagePath);
  return nodePath.join(newParentPagePath, pageTitle);
};

/**
 * Return whether the fromPage could be moved under the newParentPage
 * @param fromPage
 * @param newParentPage
 * @param printLog
 * @returns
 */
const canMoveUnderNewParent = (fromPage?: Partial<IPageHasId>, newParentPage?: Partial<IPageHasId>, printLog = false): boolean => {
  if (fromPage == null || newParentPage == null || fromPage.path == null || newParentPage.path == null) {
    if (printLog) {
      logger.warn('Any of page, page.path or droppedPage.path is null');
    }
    return false;
  }

  const newPathAfterMoved = getNewPathAfterMoved(fromPage.path, newParentPage.path);
  return pagePathUtils.canMoveByPath(fromPage.path, newPathAfterMoved);
};


type ItemCountProps = {
  descendantCount: number
}

const ItemCount: FC<ItemCountProps> = (props:ItemCountProps) => {
  return (
    <>
      <span className="grw-pagetree-count badge badge-pill badge-light text-muted">
        {props.descendantCount}
      </span>
    </>
  );
};

const Item: FC<ItemProps> = (props: ItemProps) => {
  const { t } = useTranslation();
  const {
    itemNode, targetPathOrId, isOpen: _isOpen = false, isEnabledAttachTitleHeader,
    onRenamed, onClickDuplicateMenuItem, onClickDeleteMenuItem, isEnableActions,
  } = props;

  const { page, children } = itemNode;

  const [currentChildren, setCurrentChildren] = useState(children);
  const [isOpen, setIsOpen] = useState(_isOpen);
  const [isNewPageInputShown, setNewPageInputShown] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);
  const [isRenameInputShown, setRenameInputShown] = useState(false);

  const { data, mutate: mutateChildren } = useSWRxPageChildren(isOpen ? page._id : null);

  // descendantCount
  const { getDescCount } = usePageTreeDescCountMap();
  const descendantCount = getDescCount(page._id) || page.descendantCount || 0;


  // hasDescendants flag
  const isChildrenLoaded = currentChildren?.length > 0;
  const hasDescendants = descendantCount > 0 || isChildrenLoaded;

  // to re-show hidden item when useDrag end() callback
  const displayDroppedItemByPageId = useCallback((pageId) => {
    const target = document.getElementById(`pagetree-item-${pageId}`);
    if (target == null) {
      return;
    }

    // wait 500ms to avoid removing before d-none is set by useDrag end() callback
    setTimeout(() => {
      target.classList.remove('d-none');
    }, 500);
  }, []);

  const [, drag] = useDrag({
    type: 'PAGE_TREE',
    item: { page },
    canDrag: () => {
      const isDraggable = !pagePathUtils.isUserPage(page.path || '/');
      return isDraggable;
    },
    end: (item, monitor) => {
      // in order to set d-none to dropped Item
      const dropResult = monitor.getDropResult();
      if (dropResult != null) {
        setShouldHide(true);
      }
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
      canDrag: monitor.canDrag(),
    }),
  });

  const pageItemDropHandler = async(item: ItemNode) => {
    const { page: droppedPage } = item;

    if (!canMoveUnderNewParent(droppedPage, page, true)) {
      return;
    }

    if (droppedPage.path == null || page.path == null) {
      return;
    }

    const newPagePath = getNewPathAfterMoved(droppedPage.path, page.path);

    try {
      await apiv3Put('/pages/rename', {
        pageId: droppedPage._id,
        revisionId: droppedPage.revision,
        newPagePath,
        isRenameRedirect: false,
        updateMetadata: true,
      });

      await mutateChildren();

      // force open
      setIsOpen(true);
    }
    catch (err) {
      // display the dropped item
      displayDroppedItemByPageId(droppedPage._id);

      if (err.code === 'operation__blocked') {
        toastWarning(t('pagetree.you_cannot_move_this_page_now'));
      }
      else {
        toastError(t('pagetree.something_went_wrong_with_moving_page'));
      }
    }
  };

  const [{ isOver }, drop] = useDrop<ItemNode, Promise<void>, { isOver: boolean }>(() => ({
    accept: 'PAGE_TREE',
    drop: pageItemDropHandler,
    hover: (item, monitor) => {
      // when a drag item is overlapped more than 1 sec, the drop target item will be opened.
      if (monitor.isOver()) {
        setTimeout(() => {
          if (monitor.isOver()) {
            setIsOpen(true);
          }
        }, 1000);
      }
    },
    canDrop: (item) => {
      const { page: droppedPage } = item;
      return canMoveUnderNewParent(droppedPage, page);
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  }));

  const hasChildren = useCallback((): boolean => {
    return currentChildren != null && currentChildren.length > 0;
  }, [currentChildren]);

  const onClickLoadChildren = useCallback(async() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const onClickPlusButton = useCallback(() => {
    setNewPageInputShown(true);
  }, []);

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
        onRenamed();
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

    if (page._id == null || page.revision == null || page.path == null) {
      throw Error('Any of _id, revision, and path must not be null.');
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
    const newPagePath = `${parentPath}${inputText}`;
    const isCreatable = pagePathUtils.isCreatablePage(newPagePath);

    if (!isCreatable) {
      toastWarning(t('you_can_not_create_page_with_this_name'));
      return;
    }

    let initBody = '';
    if (isEnabledAttachTitleHeader) {
      const pageTitle = pathUtils.addHeadingSlash(nodePath.basename(newPagePath));
      initBody = pathUtils.attachTitleHeader(pageTitle);
    }

    try {
      await apiv3Post('/pages/', {
        path: newPagePath,
        body: initBody,
        grant: page.grant,
        grantUserGroupId: page.grantedGroup,
        createFromPageTree: true,
      });
      mutateChildren();
      toastSuccess(t('successfully_saved_the_page'));
    }
    catch (err) {
      toastError(err);
    }
  };

  const inputValidator = (title: string | null): AlertInfo | null => {
    if (title == null || title === '' || title.trim() === '') {
      return {
        type: AlertType.WARNING,
        message: t('form_validation.title_required'),
      };
    }

    if (title.includes('/')) {
      return {
        type: AlertType.WARNING,
        message: t('form_validation.slashed_are_not_yet_supported'),
      };
    }

    return null;
  };


  useEffect(() => {
    if (!props.isScrolled && page.isTarget) {
      document.dispatchEvent(new CustomEvent('targetItemRendered'));
    }
  }, [props.isScrolled, page.isTarget]);

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

  return (
    <div
      id={`pagetree-item-${page._id}`}
      className={`grw-pagetree-item-container ${isOver ? 'grw-pagetree-is-over' : ''}
    ${shouldHide ? 'd-none' : ''}`}
    >
      <li
        ref={(c) => { drag(c); drop(c) }}
        className={`list-group-item list-group-item-action border-0 py-0 pr-3 d-flex align-items-center ${page.isTarget ? 'grw-pagetree-is-target' : ''}`}
        id={page.isTarget ? 'grw-pagetree-is-target' : `grw-pagetree-list-${page._id}`}
      >
        <div className="grw-triangle-container d-flex justify-content-center">
          {hasDescendants && (
            <button
              type="button"
              className={`grw-pagetree-button btn ${isOpen ? 'grw-pagetree-open' : ''}`}
              onClick={onClickLoadChildren}
            >
              <div className="grw-triangle-icon d-flex justify-content-center">
                <TriangleIcon />
              </div>
            </button>
          )}
        </div>
        { isRenameInputShown && (
          <ClosableTextInput
            isShown
            value={nodePath.basename(page.path ?? '')}
            placeholder={t('Input page name')}
            onClickOutside={() => { setRenameInputShown(false) }}
            onPressEnter={onPressEnterForRenameHandler}
            inputValidator={inputValidator}
          />
        )}
        { !isRenameInputShown && (
          <a href={`/${page._id}`} className="grw-pagetree-title-anchor flex-grow-1">
            <p className={`text-truncate m-auto ${page.isEmpty && 'text-muted'}`}>{nodePath.basename(page.path ?? '') || '/'}</p>
          </a>
        )}
        {(descendantCount > 0) && (
          <div className="grw-pagetree-count-wrapper">
            <ItemCount descendantCount={descendantCount} />
          </div>
        )}
        <div className="grw-pagetree-control d-flex">
          <PageItemControl
            pageId={page._id}
            isEnableActions={isEnableActions}
            onClickBookmarkMenuItem={bookmarkMenuItemClickHandler}
            onClickDuplicateMenuItem={duplicateMenuItemClickHandler}
            onClickRenameMenuItem={renameMenuItemClickHandler}
            onClickDeleteMenuItem={deleteMenuItemClickHandler}
          >
            {/* pass the color property to reactstrap dropdownToggle props. https://6-4-0--reactstrap.netlify.app/components/dropdowns/  */}
            <DropdownToggle color="transparent" className="border-0 rounded btn-page-item-control p-0 grw-visible-on-hover mr-1">
              <i className="icon-options fa fa-rotate-90 text-muted p-1"></i>
            </DropdownToggle>
          </PageItemControl>
          <button
            type="button"
            className="border-0 rounded btn btn-page-item-control p-0 grw-visible-on-hover"
            onClick={onClickPlusButton}
          >
            <i className="icon-plus text-muted d-block p-0" />
          </button>
        </div>
      </li>

      {isEnableActions && (
        <ClosableTextInput
          isShown={isNewPageInputShown}
          placeholder={t('Input page name')}
          onClickOutside={() => { setNewPageInputShown(false) }}
          onPressEnter={onPressEnterForCreateHandler}
          inputValidator={inputValidator}
        />
      )}
      {
        isOpen && hasChildren() && currentChildren.map(node => (
          <div key={node.page._id} className="grw-pagetree-item-children">
            <Item
              isEnableActions={isEnableActions}
              itemNode={node}
              isOpen={false}
              isScrolled={props.isScrolled}
              targetPathOrId={targetPathOrId}
              isEnabledAttachTitleHeader={isEnabledAttachTitleHeader}
              onRenamed={onRenamed}
              onClickDuplicateMenuItem={onClickDuplicateMenuItem}
              onClickDeleteMenuItem={onClickDeleteMenuItem}
            />
          </div>
        ))
      }
    </div>
  );

};

export default Item;
