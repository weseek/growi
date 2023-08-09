import React, { useCallback } from 'react';

import nodePath from 'path';

import { pagePathUtils } from '@growi/core';
import { useDrag, useDrop } from 'react-dnd';

import { apiv3Put } from '~/client/util/apiv3-client';
import { toastWarning, toastError } from '~/client/util/toastr';
import { IPageHasId } from '~/interfaces/page';
import { mutatePageTree } from '~/stores/page-listing';
import loggerFactory from '~/utils/logger';

import { ItemNode } from './ItemNode';


const logger = loggerFactory('growi:cli:Item');


export const CreatePageTreeItem = (SimpleItem) => {
  const settings = '';

  return function pageTreeItem() {
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

    return (
      <SimpleItem settings={settings}/>
    );
  };
};
