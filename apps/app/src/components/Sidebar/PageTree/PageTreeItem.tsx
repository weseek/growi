import React, {
  useCallback, useState, FC, useEffect, ReactNode, useMemo, useRef, createContext, useContext,
} from 'react';

import nodePath from 'path';

import {
  pathUtils, pagePathUtils, Nullable,
} from '@growi/core';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDrag, useDrop } from 'react-dnd';
import { UncontrolledTooltip, DropdownToggle } from 'reactstrap';

import { bookmark, unbookmark, resumeRenameOperation } from '~/client/services/page-operation';
import { apiv3Put, apiv3Post } from '~/client/util/apiv3-client';
import { ValidationTarget } from '~/client/util/input-validator';
import { toastWarning, toastError, toastSuccess } from '~/client/util/toastr';
import { TriangleIcon } from '~/components/Icons/TriangleIcon';
import { NotAvailableForGuest } from '~/components/NotAvailableForGuest';
import { NotAvailableForReadOnlyUser } from '~/components/NotAvailableForReadOnlyUser';
import {
  IPageHasId, IPageInfoAll, IPageToDeleteWithMeta,
} from '~/interfaces/page';
import { useSWRMUTxCurrentUserBookmarks } from '~/stores/bookmark';
import { IPageForPageDuplicateModal } from '~/stores/modal';
import { useSWRMUTxPageInfo } from '~/stores/page';
import { mutatePageTree, useSWRxPageChildren } from '~/stores/page-listing';
import { usePageTreeDescCountMap } from '~/stores/ui';
import loggerFactory from '~/utils/logger';
import { shouldRecoverPagePaths } from '~/utils/page-operation';

import ClosableTextInput from '../../Common/ClosableTextInput';
import CountBadge from '../../Common/CountBadge';
import { PageItemControl } from '../../Common/Dropdown/PageItemControl';

import { ItemNode } from './ItemNode';
import SimpleItem from './SimpleItem';


const logger = loggerFactory('growi:cli:Item');


// export const CreatePageTreeItem = () => {
//   const getNewPathAfterMoved = (droppedPagePath: string, newParentPagePath: string): string => {
//     const pageTitle = nodePath.basename(droppedPagePath);
//     return nodePath.join(newParentPagePath, pageTitle);
//   };

//   const isDroppable = (fromPage?: Partial<IPageHasId>, newParentPage?: Partial<IPageHasId>, printLog = false): boolean => {
//     if (fromPage == null || newParentPage == null || fromPage.path == null || newParentPage.path == null) {
//       if (printLog) {
//         logger.warn('Any of page, page.path or droppedPage.path is null');
//       }
//       return false;
//     }

//     const newPathAfterMoved = getNewPathAfterMoved(fromPage.path, newParentPage.path);
//     return pagePathUtils.canMoveByPath(fromPage.path, newPathAfterMoved) && !pagePathUtils.isUsersTopPage(newParentPage.path);
//   };

//   return function usePageTreeItem(props) {
//     const { t } = useTranslation();
//     const router = useRouter();

//     const {
//       itemNode, targetPathOrId, isOpen: _isOpen = false,
//       onRenamed, onClickDuplicateMenuItem, onClickDeleteMenuItem, isEnableActions, isReadOnlyUser,
//     } = props;

//     const { page, children } = itemNode;

//     const [currentChildren, setCurrentChildren] = useState(children);
//     const [isOpen, setIsOpen] = useState(_isOpen);
//     const [isNewPageInputShown, setNewPageInputShown] = useState(false);
//     const [shouldHide, setShouldHide] = useState(false);
//     const [isRenameInputShown, setRenameInputShown] = useState(false);
//     const [isCreating, setCreating] = useState(false);

//     const { data, mutate: mutateChildren } = useSWRxPageChildren(isOpen ? page._id : null);
//     const { trigger: mutateCurrentUserBookmarks } = useSWRMUTxCurrentUserBookmarks();
//     const { trigger: mutatePageInfo } = useSWRMUTxPageInfo(page._id ?? null);

//     // descendantCount
//     const { getDescCount } = usePageTreeDescCountMap();
//     const descendantCount = getDescCount(page._id) || page.descendantCount || 0;


//     // hasDescendants flag
//     const isChildrenLoaded = currentChildren?.length > 0;
//     const hasDescendants = descendantCount > 0 || isChildrenLoaded;

//     // to re-show hidden item when useDrag end() callback
//     const displayDroppedItemByPageId = useCallback((pageId) => {
//       const target = document.getElementById(`pagetree-item-${pageId}`);
//       if (target == null) {
//         return;
//       }

//       //   // wait 500ms to avoid removing before d-none is set by useDrag end() callback
//       setTimeout(() => {
//         target.classList.remove('d-none');
//       }, 500);
//     }, []);

//     const [, drag] = useDrag({
//       type: 'PAGE_TREE',
//       item: { page },
//       canDrag: () => {
//         if (page.path == null) {
//           return false;
//         }
//         return !pagePathUtils.isUsersProtectedPages(page.path);
//       },
//       end: (item, monitor) => {
//         // in order to set d-none to dropped Item
//         const dropResult = monitor.getDropResult();
//         if (dropResult != null) {
//           setShouldHide(true);
//         }
//       },
//       collect: monitor => ({
//         isDragging: monitor.isDragging(),
//         canDrag: monitor.canDrag(),
//       }),
//     });

//     const pageItemDropHandler = async(item: ItemNode) => {
//       const { page: droppedPage } = item;

//       if (!isDroppable(droppedPage, page, true)) {
//         return;
//       }

//       if (droppedPage.path == null || page.path == null) {
//         return;
//       }

//       const newPagePath = getNewPathAfterMoved(droppedPage.path, page.path);

//       try {
//         await apiv3Put('/pages/rename', {
//           pageId: droppedPage._id,
//           revisionId: droppedPage.revision,
//           newPagePath,
//           isRenameRedirect: false,
//           updateMetadata: true,
//         });

//         await mutatePageTree();
//         await mutateChildren();

//         if (onRenamed != null) {
//           onRenamed(page.path, newPagePath);
//         }

//         // force open
//         setIsOpen(true);
//       }
//       catch (err) {
//         // display the dropped item
//         displayDroppedItemByPageId(droppedPage._id);

//         if (err.code === 'operation__blocked') {
//           toastWarning(t('pagetree.you_cannot_move_this_page_now'));
//         }
//         else {
//           toastError(t('pagetree.something_went_wrong_with_moving_page'));
//         }
//       }
//     };

//     const [{ isOver }, drop] = useDrop<ItemNode, Promise<void>, { isOver: boolean }>(
//       () => ({
//         accept: 'PAGE_TREE',
//         drop: pageItemDropHandler,
//         hover: (item, monitor) => {
//           // when a drag item is overlapped more than 1 sec, the drop target item will be opened.
//           if (monitor.isOver()) {
//             setTimeout(() => {
//               if (monitor.isOver()) {
//                 setIsOpen(true);
//               }
//             }, 600);
//           }
//         },
//         canDrop: (item) => {
//           const { page: droppedPage } = item;
//           return isDroppable(droppedPage, page);
//         },
//         collect: monitor => ({
//           isOver: monitor.isOver(),
//         }),
//       }),
//       [page],
//     );

//     // const itemRef = (c) => { drag(c); drop(c) };

//     const itemRef = c => drag(c);


//     return (
//       <SimpleItem
//         key={props.key}
//         targetPathOrId={props.targetPathOrId}
//         itemNode={props.itemNode}
//         isOpen
//         isEnableActions={props.isEnableActions}
//         isReadOnlyUser={props.isReadOnlyUser}
//         onRenamed={props.onRenamed}
//         onClickDuplicateMenuItem={props.onClickDuplicateMenuItem}
//         onClickDeleteMenuItem={props.onClickDeleteMenuItem}
//         isOver={isOver}
//       />
//     );
//   };
// };

export const PageTreeItem = (props) => {
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
  const router = useRouter();
  const {
    itemNode, targetPathOrId, isOpen: _isOpen = false,
    onRenamed, onClickDuplicateMenuItem, onClickDeleteMenuItem, isEnableActions, isReadOnlyUser,
  } = props;
  const { page, children } = itemNode;
  const [currentChildren, setCurrentChildren] = useState(children);
  const [isOpen, setIsOpen] = useState(_isOpen);
  const [isNewPageInputShown, setNewPageInputShown] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);
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
  // to re-show hidden item when useDrag end() callback
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
    />
  );
};
