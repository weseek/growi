import React, {
  useCallback, useState, FC, useEffect,
} from 'react';
import { DropdownToggle } from 'reactstrap';
import { useTranslation } from 'react-i18next';

import { useDrag, useDrop } from 'react-dnd';

import nodePath from 'path';

import { pagePathUtils } from '@growi/core';

import { toastWarning, toastError } from '~/client/util/apiNotification';

import { useSWRxPageChildren } from '~/stores/page-listing';
import { IPageForPageDeleteModal } from '~/stores/ui';
import { apiv3Put } from '~/client/util/apiv3-client';

import TriangleIcon from '~/components/Icons/TriangleIcon';
import { bookmark, unbookmark } from '~/client/services/page-operation';
import ClosableTextInput, { AlertInfo, AlertType } from '../../Common/ClosableTextInput';
import { AsyncPageItemControl } from '../../Common/Dropdown/PageItemControl';
import { ItemNode } from './ItemNode';

const { generateEditorPath } = pagePathUtils;

interface ItemProps {
  isEnableActions: boolean
  itemNode: ItemNode
  targetPathOrId?: string
  isOpen?: boolean
  onClickDuplicateMenuItem?(pageId: string, path: string): void
  onClickRenameMenuItem?(pageId: string, revisionId: string, path: string): void
  onClickDeleteByPage?(pageToDelete: IPageForPageDeleteModal | null): void
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
    itemNode, targetPathOrId, isOpen: _isOpen = false, onClickDuplicateMenuItem, onClickRenameMenuItem, onClickDeleteByPage, isEnableActions,
  } = props;

  const { page, children } = itemNode;

  const [pageTitle, setPageTitle] = useState(page.path);
  const [currentChildren, setCurrentChildren] = useState(children);
  const [isOpen, setIsOpen] = useState(_isOpen);
  const [isNewPageInputShown, setNewPageInputShown] = useState(false);
  // const [isRenameInputShown, setRenameInputShown] = useState(false);

  const { data, error } = useSWRxPageChildren(isOpen ? page._id : null);

  const hasDescendants = (page.descendantCount != null && page?.descendantCount > 0);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'PAGE_TREE',
    item: { page },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const pageItemDropHandler = () => {
    // TODO: hit an api to rename the page by 85175
    // eslint-disable-next-line no-console
    console.log('pageItem was droped!!');
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
  //   if (inputText == null || inputText === '' || inputText.trim() === '' || inputText.includes('/')) {
  //     return;
  //   }

  //   const parentPath = nodePath.dirname(page.path as string);
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
    if (onClickDeleteByPage == null) {
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

    onClickDeleteByPage(pageToDelete);
  }, [page, onClickDeleteByPage]);

  const redirectToEditor = (...paths) => {
    try {
      const editorPath = generateEditorPath(...paths);
      window.location.href = editorPath;
    }
    catch (err) {
      toastError(err);
    }
  };

  const onPressEnterForCreateHandler = (inputText: string) => {
    setNewPageInputShown(false);

    if (inputText == null || inputText === '' || inputText.trim() === '' || inputText.includes('/')) {
      return;
    }

    const parentPath = nodePath.dirname(page.path as string);

    redirectToEditor(parentPath, inputText);
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
    if (isOpen && error == null && data != null) {
      const newChildren = ItemNode.generateNodesFromPages(data.children);
      markTarget(newChildren, targetPathOrId);
      setCurrentChildren(newChildren);
    }
  }, [data, error, isOpen, targetPathOrId]);

  return (
    <div className={`grw-pagetree-item-container ${isOver ? 'grw-pagetree-is-over' : ''}`}>
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
          <AsyncPageItemControl
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
          </AsyncPageItemControl>
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
              onClickDeleteByPage={onClickDeleteByPage}
            />
          </div>
        ))
      }
    </div>
  );

};

export default Item;
