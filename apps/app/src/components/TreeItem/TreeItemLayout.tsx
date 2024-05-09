import React, {
  useCallback, useState, useEffect,
  type FC, type RefObject, type RefCallback, type MouseEvent,
} from 'react';

import type { Nullable } from '@growi/core';

import { useSWRxPageChildren } from '~/stores/page-listing';
import { usePageTreeDescCountMap } from '~/stores/ui';

import { ItemNode } from './ItemNode';
import { SimpleItemContent } from './SimpleItemContent';
import type { TreeItemProps, TreeItemToolProps } from './interfaces';


import styles from './TreeItemLayout.module.scss';

const moduleClass = styles['tree-item-layout'] ?? '';


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


type TreeItemLayoutProps = TreeItemProps & {
  itemRef?: RefObject<any> | RefCallback<any>,
}

export const TreeItemLayout: FC<TreeItemLayoutProps> = (props) => {
  const {
    itemNode, targetPathOrId, isOpen: _isOpen = false,
    onRenamed, onClick, onClickDuplicateMenuItem, onClickDeleteMenuItem, isEnableActions, isReadOnlyUser, isWipPageShown = true,
    itemRef, itemClass, mainClassName,
    showAlternativeContent,
  } = props;

  const { page, children } = itemNode;

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

  const ItemClassFixed = itemClass ?? TreeItemLayout;

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
    stateHandlers: {
      setIsOpen,
    },
  };

  const EndComponents = props.customEndComponents;
  const HoveredEndComponents = props.customHoveredEndComponents;
  const HeadObChildrenComponents = props.customHeadOfChildrenComponents;
  const AlternativeComponents = props.customAlternativeComponents;

  if (!isWipPageShown && page.wip) {
    return <></>;
  }

  return (
    <div
      id={`tree-item-layout-${page._id}`}
      data-testid="grw-pagetree-item-container"
      className={`tree-item-layout ${moduleClass} ${mainClassName}`}
    >
      <li
        ref={itemRef}
        role="button"
        className={`list-group-item border-0 py-0 pr-3 d-flex align-items-center rounded-1 ${page.isTarget ? 'active' : 'list-group-item-action'}`}
        id={page.isTarget ? 'grw-pagetree-current-page-item' : `grw-pagetree-list-${page._id}`}
        onClick={itemClickHandler}
      >

        <div className="btn-triangle-container d-flex justify-content-center">
          {hasDescendants && (
            <button
              type="button"
              className={`btn btn-triangle p-0 ${isOpen ? 'open' : ''}`}
              onClick={onClickLoadChildren}
            >
              <div className="d-flex justify-content-center">
                <span className="material-symbols-outlined">arrow_right</span>
              </div>
            </button>
          )}
        </div>

        { showAlternativeContent && AlternativeComponents != null
          ? (
            AlternativeComponents.map((AlternativeContent, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <AlternativeContent key={index} {...toolProps} />
            ))
          )
          : (
            <>
              <SimpleItemContent page={page} />
              <div className="d-hover-none">
                {EndComponents?.map((EndComponent, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <EndComponent key={index} {...toolProps} />
                ))}
              </div>
              <div className="d-none d-hover-flex">
                {HoveredEndComponents?.map((HoveredEndContent, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <HoveredEndContent key={index} {...toolProps} />
                ))}
              </div>
            </>
          )
        }

      </li>

      { isOpen && HeadObChildrenComponents?.map((HeadObChildrenContents, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <HeadObChildrenContents key={index} {...toolProps} />
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
            <div key={node.page._id} className="tree-item-layout-children">
              <ItemClassFixed {...itemProps} />
            </div>
          );
        })
      }
    </div>
  );
};
