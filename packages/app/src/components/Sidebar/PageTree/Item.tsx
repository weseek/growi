import React, {
  useCallback, useState, FC, useEffect,
} from 'react';
import { DropdownToggle } from 'reactstrap';
import { useTranslation } from 'react-i18next';

import { useDrag, useDrop } from 'react-dnd';

import nodePath from 'path';

import { pathUtils, pagePathUtils } from '@growi/core';

import { toastWarning, toastError, toastSuccess } from '~/client/util/apiNotification';

import { useSWRxPageChildren } from '~/stores/page-listing';
import { IPageForPageDeleteModal } from '~/stores/ui';
import { apiv3Put, apiv3Post } from '~/client/util/apiv3-client';

import TriangleIcon from '~/components/Icons/TriangleIcon';
import { bookmark, unbookmark } from '~/client/services/page-operation';
import ClosableTextInput, { AlertInfo, AlertType } from '../../Common/ClosableTextInput';
import { PageItemControl } from '../../Common/Dropdown/PageItemControl';
import { ItemNode } from './ItemNode';

interface ItemProps {
  isEnableActions: boolean
  itemNode: ItemNode
  targetPathOrId?: string
  isOpen?: boolean
  onClickDuplicateMenuItem?(pageId: string, path: string): void
  onClickRenameMenuItem?(pageId: string, revisionId: string, path: string): void
  onClickDeleteMenuItem?(pageToDelete: IPageForPageDeleteModal | null): void
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
    itemNode, targetPathOrId, isOpen: _isOpen = false, onClickDuplicateMenuItem, onClickRenameMenuItem, onClickDeleteMenuItem, isEnableActions,
  } = props;

  const { page, children } = itemNode;

  const [pageTitle, setPageTitle] = useState(page.path);
  const [currentChildren, setCurrentChildren] = useState(children);
  const [isOpen, setIsOpen] = useState(_isOpen);
  const [isNewPageInputShown, setNewPageInputShown] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);
  // const [isRenameInputShown, setRenameInputShown] = useState(false);

  const { data, mutate: mutateChildren } = useSWRxPageChildren(isOpen ? page._id : null);

  // hasDescendants flag
  const isChildrenLoaded = currentChildren?.length > 0;
  const hasDescendants = (page.descendantCount != null && page?.descendantCount > 0) || isChildrenLoaded;

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

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'PAGE_TREE',
    item: { page },
    end: () => {
      // in order to set d-none to dropped Item
      setShouldHide(true);
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const pageItemDropHandler = async(item, monitor) => {
    if (page == null || page.path == null) {
      return;
    }

    const { page: droppedPage } = item;

    const pageTitle = nodePath.basename(droppedPage.path);
    const newParentPath = page.path;
    const newPagePath = nodePath.join(newParentPath, pageTitle);

    try {
      await apiv3Put('/pages/rename', {
        pageId: droppedPage._id,
        revisionId: droppedPage.revision,
        newPagePath,
        isRenameRedirect: false,
        isRemainMetadata: false,
      });

      await mutateChildren();

      // force open
      setIsOpen(true);

      toastSuccess('TODO: i18n Successfully moved pages.');
    }
    catch (err) {
      // display the dropped item
      displayDroppedItemByPageId(droppedPage._id);

      if (err.code === 'operation__blocked') {
        toastWarning('TODO: i18n You cannot move this page now.');
      }
      else {
        toastError('TODO: i18n Something went wrong with moving page.');
      }
    }
  };

  const [{ isOver }, drop] = useDrop(() => ({
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

    onClickDuplicateMenuItem(pageId, path);
  }, [onClickDuplicateMenuItem, page]);


  /*
  * Rename: TODO: rename page title on input form by #87757
  */

  // const onClickRenameButton = useCallback(async(_pageId: string): Promise<void> => {
  //   setRenameInputShown(true);
  // }, []);

  // const onPressEnterForRenameHandler = async(inputText: string) => {
  //   const parentPath = getParentPagePath(page.path as string)
  //   const newPagePath = `${parentPath}/${inputText}`;

  //   try {
  //     setPageTitle(inputText);
  //     setRenameInputShown(false);
  //     await apiv3Put('/pages/rename', { newPagePath, pageId: page._id, revisionId: page.revision });
  //   }
  //   catch (err) {
  //     // open ClosableInput and set pageTitle back to the previous title
  //     setPageTitle(nodePath.basename(pageTitle as string));
  //     setRenameInputShown(true);
  //     toastError(err);
  //   }
  // };

  const renameMenuItemClickHandler = useCallback((): void => {
    if (onClickRenameMenuItem == null) {
      return;
    }

    const { _id: pageId, revision: revisionId, path } = page;

    if (pageId == null || revisionId == null || path == null) {
      throw Error('Any of _id and revisionId and path must not be null.');
    }

    onClickRenameMenuItem(pageId, revisionId as string, path);
  }, [onClickRenameMenuItem, page]);

  const onClickDeleteButton = useCallback(async(_pageId: string): Promise<void> => {
    if (onClickDeleteMenuItem == null) {
      return;
    }

    const { _id: pageId, revision: revisionId, path } = page;

    if (pageId == null || revisionId == null || path == null) {
      throw Error('Any of _id, revision, and path must not be null.');
    }

    const pageToDelete: IPageForPageDeleteModal = {
      pageId,
      revisionId: revisionId as string,
      path,
    };

    onClickDeleteMenuItem(pageToDelete);
  }, [page, onClickDeleteMenuItem]);

  const onPressEnterForCreateHandler = async(inputText: string) => {
    setNewPageInputShown(false);
    const parentPath = pathUtils.addTrailingSlash(page.path as string);
    const newPagePath = `${parentPath}${inputText}`;
    const initialBody = `# ${newPagePath}`;
    const isCreatable = pagePathUtils.isCreatablePage(newPagePath);

    if (isCreatable) {
      const body = {
        path: newPagePath,
        body: initialBody,
        grant: page.grant,
        grantUserGroupId: page.grantedGroup,
      };

      try {
        await apiv3Post('/pages/', body);
        mutateChildren();
      }
      catch (err) {
        toastError(err);
      }
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
    <div id={`pagetree-item-${page._id}`} className={`grw-pagetree-item-container ${isOver ? 'grw-pagetree-is-over' : ''} ${shouldHide ? 'd-none' : ''}`}>
      <li
        ref={(c) => { drag(c); drop(c) }}
        className={`list-group-item list-group-item-action border-0 py-1 d-flex align-items-center ${page.isTarget ? 'grw-pagetree-is-target' : ''}`}
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
        {/* TODO: rename page title on input form by 87757 */}
        {/* { isRenameInputShown && (
          <ClosableTextInput
            isShown
            value={nodePath.basename(pageTitle as string)}
            placeholder={t('Input page name')}
            onClickOutside={() => { setRenameInputShown(false) }}
            onPressEnter={onPressEnterForRenameHandler}
            inputValidator={inputValidator}
          />
        )}
        { !isRenameInputShown && ( */}
        <a href={page._id} className="grw-pagetree-title-anchor flex-grow-1">
          <p className={`text-truncate m-auto ${page.isEmpty && 'text-muted'}`}>{nodePath.basename(pageTitle as string) || '/'}</p>
        </a>
        {/* )} */}
        {(page.descendantCount != null && page.descendantCount > 0) && (
          <div className="grw-pagetree-count-wrapper">
            <ItemCount descendantCount={page.descendantCount} />
          </div>
        )}
        <div className="grw-pagetree-control d-none">
          <PageItemControl
            pageId={page._id}
            isEnableActions={isEnableActions}
            showBookmarkMenuItem
            onClickBookmarkMenuItem={bookmarkMenuItemClickHandler}
            onClickDuplicateMenuItem={duplicateMenuItemClickHandler}
            onClickDeleteMenuItem={onClickDeleteButton}
            onClickRenameMenuItem={renameMenuItemClickHandler}
          >
            <DropdownToggle color="transparent" className="border-0 rounded btn-page-item-control p-0">
              <i className="icon-options fa fa-rotate-90 text-muted p-1"></i>
            </DropdownToggle>
          </PageItemControl>
          <button
            type="button"
            className="border-0 rounded btn-page-item-control p-0"
            onClick={onClickPlusButton}
          >
            <i className="icon-plus text-muted d-block p-1" />
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
              targetPathOrId={targetPathOrId}
              onClickDuplicateMenuItem={onClickDuplicateMenuItem}
              onClickRenameMenuItem={onClickRenameMenuItem}
              onClickDeleteMenuItem={onClickDeleteMenuItem}
            />
          </div>
        ))
      }
    </div>
  );

};

export default Item;
