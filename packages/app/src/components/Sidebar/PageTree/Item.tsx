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
import { IPageForPageDeleteModal } from '~/components/PageDeleteModal';

import TriangleIcon from '~/components/Icons/TriangleIcon';

const { isTopPage } = pagePathUtils;


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
  onClickDeleteButtonHandler?(): void
  onClickRenameButtonHandler?(): void
  onClickPlusButtonHandler?(): void
}

const ItemControl: FC<ItemControlProps> = memo((props: ItemControlProps) => {
  const onClickPlusButton = () => {
    if (props.onClickPlusButtonHandler == null) {
      return;
    }

    props.onClickPlusButtonHandler();
  };

  const onClickDeleteButton = () => {
    if (props.onClickDeleteButtonHandler == null) {
      return;
    }

    props.onClickDeleteButtonHandler();
  };

  const onClickRenameButton = () => {
    if (props.onClickRenameButtonHandler == null) {
      return;
    }

    props.onClickRenameButtonHandler();
  };

  if (props.page == null) {
    return <></>;
  }

  return (
    <>
      <PageItemControl
        page={props.page}
        onClickDeleteButton={onClickDeleteButton}
        isEnableActions={props.isEnableActions}
        isDeletable={props.isDeletable}
        onClickRenameButton={onClickRenameButton}
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

const ItemCount: FC = () => {
  return (
    <>
      <span className="grw-pagetree-count badge badge-pill badge-light text-muted">
        {/* TODO: consider to show the number of children pages */}
        00
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
  const [isInputForRenameOpen, setIsInputForRenameOpen] = useState(false);
  const [isNewPageInputShown, setNewPageInputShown] = useState(false);

  const { data, error } = useSWRxPageChildren(isOpen ? page._id : null);

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

  const onClickDeleteButtonHandler = useCallback(() => {
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


  const onClickRenameButtonHandler = useCallback(() => {
    setIsInputForRenameOpen(true);
  }, []);

  const onPressEnterHandlerForRename = async() => {
    // try {
    //   await apiv3Put('/pages/rename', {
    //     newPagePath: 'こんにちは GROWI', pageId: page._id, isRecursively: false, revisionId: page.revision,
    //   });
    // }
    // catch (err) {
    //   console.log(err);
    // }
    console.log('Page path has been renamed!!');
    console.log(page);
    setIsInputForRenameOpen(false);
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

  // TODO: go to create page page
  const onPressEnterHandler = () => {
    toastWarning(t('search_result.currently_not_implemented'));
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
      <div
        ref={(c) => { drag(c); drop(c) }}
        className={`grw-pagetree-item d-flex align-items-center pr-1 ${page.isTarget ? 'grw-pagetree-is-target' : ''}`}
      >
        <button
          type="button"
          className={`grw-pagetree-button btn ${isOpen ? 'grw-pagetree-open' : ''}`}
          onClick={onClickLoadChildren}
        >
          <div className="grw-triangle-icon">
            <TriangleIcon />
          </div>
        </button>
        {/* page path */}
        { isInputForRenameOpen && (
          <ClosableTextInput
            isShown
            placeholder={page.path}
            onClickOutside={() => { setIsInputForRenameOpen(false) }}
            onPressEnter={onPressEnterHandlerForRename}
          />
        )}
        { !isInputForRenameOpen && (
          <a href={page._id} className="grw-pagetree-title-anchor flex-grow-1">
            <p className={`text-truncate m-auto ${page.isEmpty && 'text-muted'}`}>{nodePath.basename(page.path as string) || '/'}</p>
          </a>
        )}
        <div className="grw-pagetree-count-wrapper">
          <ItemCount />
        </div>
        <div className="grw-pagetree-control d-none">
          <ItemControl
            page={page}
            onClickDeleteButtonHandler={onClickDeleteButtonHandler}
            onClickRenameButtonHandler={onClickRenameButtonHandler}
            onClickPlusButtonHandler={() => { setNewPageInputShown(true) }}
            isEnableActions={isEnableActions}
            isDeletable={!page.isEmpty && !isTopPage(page.path as string)}
          />
        </div>
      </div>

      {isEnableActions && (
        <ClosableTextInput
          isShown={isNewPageInputShown}
          placeholder={t('Input page name')}
          onClickOutside={() => { setNewPageInputShown(false) }}
          onPressEnter={onPressEnterHandler}
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
