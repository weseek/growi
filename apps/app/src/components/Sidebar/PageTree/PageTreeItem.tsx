import React, {
  useCallback, useState, FC,
} from 'react';

import nodePath from 'path';


import { pathUtils, pagePathUtils } from '@growi/core';
import { useTranslation } from 'next-i18next';
import { useDrag, useDrop } from 'react-dnd';
import { DropdownToggle } from 'reactstrap';

import { bookmark, unbookmark, resumeRenameOperation } from '~/client/services/page-operation';
import { apiv3Put } from '~/client/util/apiv3-client';
import { ValidationTarget } from '~/client/util/input-validator';
import { toastWarning, toastError, toastSuccess } from '~/client/util/toastr';
import { NotAvailableForGuest } from '~/components/NotAvailableForGuest';
import {
  IPageHasId, IPageInfoAll, IPageToDeleteWithMeta, IPageForItem,
} from '~/interfaces/page';
import { useSWRMUTxCurrentUserBookmarks } from '~/stores/bookmark';
import { useSWRMUTxPageInfo } from '~/stores/page';
import { mutatePageTree, useSWRxPageChildren } from '~/stores/page-listing';
import loggerFactory from '~/utils/logger';

import ClosableTextInput from '../../Common/ClosableTextInput';
import { PageItemControl } from '../../Common/Dropdown/PageItemControl';

import { ItemNode } from './ItemNode';
import SimpleItem, { SimpleItemProps, NotDraggableForClosableTextInput, SimpleItemTool } from './SimpleItem';

const logger = loggerFactory('growi:cli:Item');

type PageTreeItemPropsOptional = 'itemRef' | 'itemClass' | 'mainClassName';
type PageTreeItemProps = Omit<SimpleItemProps, PageTreeItemPropsOptional> & {key};

type EllipsisPropsOptional = 'itemNode' | 'targetPathOrId' | 'isOpen' | 'itemRef' | 'itemClass' | 'mainClassName';
type EllipsisProps = Omit<SimpleItemProps, EllipsisPropsOptional> & {page: IPageForItem};

const Ellipsis: FC<EllipsisProps> = (props) => {
  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const { t } = useTranslation();

  const {
    page, onRenamed, onClickDuplicateMenuItem,
    onClickDeleteMenuItem, isEnableActions, isReadOnlyUser,
  } = props;

  const { trigger: mutateCurrentUserBookmarks } = useSWRMUTxCurrentUserBookmarks();
  const { trigger: mutatePageInfo } = useSWRMUTxPageInfo(page._id ?? null);

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

  const pathRecoveryMenuItemClickHandler = async(pageId: string): Promise<void> => {
    try {
      await resumeRenameOperation(pageId);
      toastSuccess(t('page_operation.paths_recovered'));
    }
    catch {
      toastError(t('page_operation.path_recovery_failed'));
    }
  };

  return (
    <>
      {isRenameInputShown ? (
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
      ) : (
        <SimpleItemTool page={page} isEnableActions={false} isReadOnlyUser={false}/>
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
    </>
  );
};

export const PageTreeItem: FC<PageTreeItemProps> = (props) => {
  const getNewPathAfterMoved = (droppedPagePath: string, newParentPagePath: string): string => {
    const pageTitle = nodePath.basename(droppedPagePath);
    return nodePath.join(newParentPagePath, pageTitle);
  };

  const isDroppable = (fromPage?: Partial<IPageHasId>, newParentPage?: Partial<IPageHasId>, printLog = false): boolean => {
    if (fromPage == null || newParentPage == null || fromPage.path == null || newParentPage.path == null) {
      if (printLog) {
        logger.warn('Any of page, page.path or droppedPage.path is null');
      }
      return false;
    }

    const newPathAfterMoved = getNewPathAfterMoved(fromPage.path, newParentPage.path);
    return pagePathUtils.canMoveByPath(fromPage.path, newPathAfterMoved) && !pagePathUtils.isUsersTopPage(newParentPage.path);
  };

  const { t } = useTranslation();

  const {
    itemNode, isOpen: _isOpen = false, onRenamed,
  } = props;

  const { page } = itemNode;
  const [isOpen, setIsOpen] = useState(_isOpen);
  const [shouldHide, setShouldHide] = useState(false);

  const { mutate: mutateChildren } = useSWRxPageChildren(isOpen ? page._id : null);

  const displayDroppedItemByPageId = useCallback((pageId) => {
    const target = document.getElementById(`pagetree-item-${pageId}`);
    if (target == null) {
      return;
    }
    //   // wait 500ms to avoid removing before d-none is set by useDrag end() callback
    setTimeout(() => {
      target.classList.remove('d-none');
    }, 500);
  }, []);

  const [, drag] = useDrag({
    type: 'PAGE_TREE',
    item: { page },
    canDrag: () => {
      if (page.path == null) {
        return false;
      }
      return !pagePathUtils.isUsersProtectedPages(page.path);
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
    if (!isDroppable(droppedPage, page, true)) {
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
      await mutatePageTree();
      await mutateChildren();
      if (onRenamed != null) {
        onRenamed(page.path, newPagePath);
      }
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

  const [{ isOver }, drop] = useDrop<ItemNode, Promise<void>, { isOver: boolean }>(
    () => ({
      accept: 'PAGE_TREE',
      drop: pageItemDropHandler,
      hover: (item, monitor) => {
        // when a drag item is overlapped more than 1 sec, the drop target item will be opened.
        if (monitor.isOver()) {
          setTimeout(() => {
            if (monitor.isOver()) {
              setIsOpen(true);
            }
          }, 600);
        }
      },
      canDrop: (item) => {
        const { page: droppedPage } = item;
        return isDroppable(droppedPage, page);
      },
      collect: monitor => ({
        isOver: monitor.isOver(),
      }),
    }),
    [page],
  );

  const itemRef = (c) => { drag(c); drop(c) };

  const mainClassName = `${isOver ? 'grw-pagetree-is-over' : ''} ${shouldHide ? 'd-none' : ''}`;

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
      itemRef={itemRef}
      itemClass={PageTreeItem}
      mainClassName={mainClassName}
      customComponent={Ellipsis}
    />
  );
};
