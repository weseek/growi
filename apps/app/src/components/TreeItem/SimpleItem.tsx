import React, {
  useCallback, useState, useEffect,
  type FC, type RefObject, type RefCallback, type MouseEvent,
} from 'react';

import nodePath from 'path';

import type { Nullable } from '@growi/core';
import { useTranslation } from 'next-i18next';
import { UncontrolledTooltip } from 'reactstrap';

import type { IPageForItem } from '~/interfaces/page';
import { useSWRxPageChildren } from '~/stores/page-listing';
import { usePageTreeDescCountMap } from '~/stores/ui';
import { shouldRecoverPagePaths } from '~/utils/page-operation';

import CountBadge from '../Common/CountBadge';

import { ItemNode } from './ItemNode';
import { useNewPageInput } from './NewPageInput';
import type { TreeItemProps, TreeItemToolProps } from './interfaces';


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


const SimpleItemContent = ({ page }: { page: IPageForItem }) => {
  const { t } = useTranslation();

  const pageName = nodePath.basename(page.path ?? '') || '/';

  const shouldShowAttentionIcon = page.processData != null ? shouldRecoverPagePaths(page.processData) : false;

  return (
    <div
      className="flex-grow-1 d-flex align-items-center pe-none"
      style={{ minWidth: 0 }}
    >
      {shouldShowAttentionIcon && (
        <>
          <span id="path-recovery" className="material-symbols-outlined mr-2 text-warning">warning</span>
          <UncontrolledTooltip placement="top" target="path-recovery" fade={false}>
            {t('tooltip.operation.attention.rename')}
          </UncontrolledTooltip>
        </>
      )}
      {page != null && page.path != null && page._id != null && (
        <div className="grw-pagetree-title-anchor flex-grow-1">
          <div className="d-flex align-items-center">
            <span className={`text-truncate me-1 ${page.isEmpty && 'grw-sidebar-text-muted'}`}>{pageName}</span>
            { page.wip && (
              <span className="wip-page-badge badge rounded-pill me-1 text-bg-secondary">WIP</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const SimpleItemTool: FC<TreeItemToolProps> = (props) => {
  const { getDescCount } = usePageTreeDescCountMap();

  const { page } = props.itemNode;

  const descendantCount = getDescCount(page._id) || page.descendantCount || 0;

  return (
    <>
      {descendantCount > 0 && (
        <div className="grw-pagetree-count-wrapper">
          <CountBadge count={descendantCount} />
        </div>
      )}
    </>
  );
};

type SimpleItemProps = TreeItemProps & {
  itemRef?: RefObject<any> | RefCallback<any>,
}

export const SimpleItem: FC<SimpleItemProps> = (props) => {
  const {
    itemNode, targetPathOrId, isOpen: _isOpen = false,
    onRenamed, onClick, onClickDuplicateMenuItem, onClickDeleteMenuItem, isEnableActions, isReadOnlyUser, isWipPageShown = true,
    itemRef, itemClass, mainClassName,
  } = props;

  const { page, children } = itemNode;

  const { isProcessingSubmission } = useNewPageInput();

  const [currentChildren, setCurrentChildren] = useState(children);
  const [isOpen, setIsOpen] = useState(_isOpen);

  const { data } = useSWRxPageChildren(isOpen ? page._id : null);


  const itemClickHandler = useCallback((e: MouseEvent) => {
    // DO NOT handle the event when e.currentTarget and e.target is different
    if (e.target !== e.currentTarget) {
      return;
    }

    onClick?.(page);

  }, [onClick, page]);


  // descendantCount
  const { getDescCount } = usePageTreeDescCountMap();
  const descendantCount = getDescCount(page._id) || page.descendantCount || 0;

  // hasDescendants flag
  const isChildrenLoaded = currentChildren?.length > 0;
  const hasDescendants = descendantCount > 0 || isChildrenLoaded;

  const hasChildren = useCallback((): boolean => {
    return currentChildren != null && currentChildren.length > 0;
  }, [currentChildren]);

  const onClickLoadChildren = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

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

  const ItemClassFixed = itemClass ?? SimpleItem;

  const EndComponents = props.customEndComponents ?? [SimpleItemTool];

  const baseProps: Omit<TreeItemProps, 'itemNode'> = {
    isEnableActions,
    isReadOnlyUser,
    isOpen: false,
    isWipPageShown,
    targetPathOrId,
    onRenamed,
    onClickDuplicateMenuItem,
    onClickDeleteMenuItem,
  };

  const toolProps: TreeItemToolProps = {
    ...baseProps,
    itemNode,
  };

  const CustomNextComponents = props.customNextComponents;

  if (!isWipPageShown && page.wip) {
    return <></>;
  }

  return (
    <div
      id={`pagetree-item-${page._id}`}
      data-testid="grw-pagetree-item-container"
      className={`grw-pagetree-item-container ${mainClassName}`}
    >
      <li
        ref={itemRef}
        role="button"
        className={`list-group-item border-0 py-0 pr-3 d-flex align-items-center text-muted ${page.isTarget ? 'active' : 'list-group-item-action'}`}
        id={page.isTarget ? 'grw-pagetree-current-page-item' : `grw-pagetree-list-${page._id}`}
        onClick={itemClickHandler}
      >

        <div className="grw-triangle-container d-flex justify-content-center">
          {hasDescendants && (
            <button
              type="button"
              className={`grw-pagetree-triangle-btn btn p-0 ${isOpen ? 'grw-pagetree-open' : ''}`}
              onClick={onClickLoadChildren}
            >
              <div className="d-flex justify-content-center">
                <span className="material-symbols-outlined">arrow_right</span>
              </div>
            </button>
          )}
        </div>

        <SimpleItemContent page={page} />

        {EndComponents.map((EndComponent, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <EndComponent key={index} {...toolProps} />
        ))}

      </li>

      {CustomNextComponents?.map((UnderItemContent, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <UnderItemContent key={index} {...toolProps} />
      ))}

      {
        isOpen && hasChildren() && currentChildren.map((node, index) => {
          const itemProps = {
            ...baseProps,
            itemNode: node,
            itemClass,
            mainClassName,
            onClick,
          };

          return (
            <div key={node.page._id} className="grw-pagetree-item-children">
              <ItemClassFixed {...itemProps} />
              {isProcessingSubmission && (currentChildren.length - 1 === index) && (
                <div className="text-muted text-center">
                  <i className="fa fa-spinner fa-pulse mr-1"></i>
                </div>
              )}
            </div>
          );
        })
      }
    </div>
  );
};
