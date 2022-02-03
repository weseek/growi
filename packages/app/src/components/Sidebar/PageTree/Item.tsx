import React, {
  useCallback, useState, FC, useEffect, memo,
} from 'react';
import nodePath from 'path';
import { useTranslation } from 'react-i18next';
import { pagePathUtils } from '@growi/core';
import { useDrag, useDrop } from 'react-dnd';
import { toastWarning } from '~/client/util/apiNotification';

import { ItemNode } from './ItemNode';
import { IPageHasId } from '~/interfaces/page';
import { useSWRxPageChildren } from '../../../stores/page-listing';
import ClosableTextInput, { AlertInfo, AlertType } from '../../Common/ClosableTextInput';
import PageItemControl from '../../Common/Dropdown/PageItemControl';
import { IPageForPageDeleteModal } from '~/stores/ui';

import TriangleIcon from '~/components/Icons/TriangleIcon';

const { isTopPage, isUserPage } = pagePathUtils;


interface ItemProps {
  isEnableActions: boolean
  itemNode: ItemNode
  targetPathOrId?: string
  isOpen?: boolean
  onClickDeleteByPage?(page: IPageForPageDeleteModal): void
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

type ItemControlProps = {
  page: Partial<IPageHasId>
  isEnableActions: boolean
  isDeletable: boolean
  onClickPlusButton?(): void
  onClickDeleteButton?(): void
  onClickRenameButton?(): void
}


const ItemControl: FC<ItemControlProps> = memo((props: ItemControlProps) => {
  const onClickPlusButton = () => {
    if (props.onClickPlusButton == null) {
      return;
    }

    props.onClickPlusButton();
  };

  const onClickDeleteButtonHandler = () => {
    if (props.onClickDeleteButton == null) {
      return;
    }

    props.onClickDeleteButton();
  };

  const onClickRenameButtonHandler = () => {
    if (props.onClickRenameButton == null) {
      return;
    }

    props.onClickRenameButton();
  };

  if (props.page == null) {
    return <></>;
  }

  return (
    <>
      <PageItemControl
        page={props.page}
        onClickDeleteButtonHandler={onClickDeleteButtonHandler}
        isEnableActions={props.isEnableActions}
        isDeletable={props.isDeletable}
        onClickRenameButtonHandler={onClickRenameButtonHandler}
      />
      <button
        type="button"
        className="border-0 rounded grw-btn-page-management p-0"
        onClick={onClickPlusButton}
      >
        <i className="icon-plus text-muted d-block p-1" />
      </button>
    </>
  );
});


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
    itemNode, targetPathOrId, isOpen: _isOpen = false, onClickDeleteByPage, isEnableActions,
  } = props;

  const { page, children } = itemNode;

  const [currentChildren, setCurrentChildren] = useState(children);
  const [isOpen, setIsOpen] = useState(_isOpen);
  const [isNewPageInputShown, setNewPageInputShown] = useState(false);
  const [isRenameInputShown, setRenameInputShown] = useState(false);

  const { data, error } = useSWRxPageChildren(isOpen ? page._id : null);

  const hasDescendants = (page.descendantCount != null && page?.descendantCount > 0);

  const isDeletable = !page.isEmpty && !isTopPage(page.path as string) && !isUserPage(page.path as string);

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

  const onClickDeleteButton = useCallback(() => {
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


  const onClickRenameButton = useCallback(() => {
    setRenameInputShown(true);
  }, []);

  // TODO: make a put request to pages/title
  const onPressEnterForRenameHandler = () => {
    toastWarning(t('search_result.currently_not_implemented'));
    setRenameInputShown(false);
  };

  // TODO: go to create page page
  const onPressEnterForCreateHandler = () => {
    toastWarning(t('search_result.currently_not_implemented'));
    setNewPageInputShown(false);
  };

  const inputValidator = (title: string | null): AlertInfo | null => {
    if (title == null || title === '') {
      return {
        type: AlertType.WARNING,
        message: t('form_validation.title_required'),
      };
    }

    return null;
  };

  // didMount
  useEffect(() => {
    if (hasChildren()) setIsOpen(true);
  }, []);

  /*
   * Make sure itemNode.children and currentChildren are synced
   */
  useEffect(() => {
    if (children.length > currentChildren.length) {
      markTarget(children, targetPathOrId);
      setCurrentChildren(children);
    }
  }, []);

  /*
   * When swr fetch succeeded
   */
  useEffect(() => {
    if (isOpen && error == null && data != null) {
      const newChildren = ItemNode.generateNodesFromPages(data.children);
      markTarget(newChildren, targetPathOrId);
      setCurrentChildren(newChildren);
    }
  }, [data, isOpen]);

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
        { isRenameInputShown && (
          <ClosableTextInput
            isShown
            placeholder={t('Input page name')}
            onClickOutside={() => { setRenameInputShown(false) }}
            onPressEnter={onPressEnterForRenameHandler}
            inputValidator={inputValidator}
          />
        )}
        { !isRenameInputShown && (
          <a
            href={page._id}
            className="grw-pagetree-title-anchor flex-grow-1"
          >
            <p className={`text-truncate m-auto ${page.isEmpty && 'text-muted'}`}>{nodePath.basename(page.path as string) || '/'}</p>
          </a>
        )}
        {(page.descendantCount != null && page.descendantCount > 0) && (
          <div className="grw-pagetree-count-wrapper">
            <ItemCount descendantCount={page.descendantCount} />
          </div>
        )}
        <div className="grw-pagetree-control d-none">
          <ItemControl
            page={page}
            onClickPlusButton={onClickPlusButton}
            onClickDeleteButton={onClickDeleteButton}
            onClickRenameButton={onClickRenameButton}
            isEnableActions={isEnableActions}
            isDeletable={isDeletable}
          />
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
              onClickDeleteByPage={onClickDeleteByPage}
            />
          </div>
        ))
      }
    </div>
  );

};

export default Item;
