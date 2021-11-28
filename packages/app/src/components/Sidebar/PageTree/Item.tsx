import React, {
  useCallback, useState, FC, useEffect,
} from 'react';
import nodePath from 'path';

import { ItemNode } from './ItemNode';
import { useSWRxPageChildren } from '../../../stores/page-listing';
import { usePageId } from '../../../stores/context';


interface ItemProps {
  itemNode: ItemNode
  isOpen?: boolean
}

// Utility to mark target
const markTarget = (children: ItemNode[], targetId: string): void => {
  children.forEach((node) => {
    if (node.page._id === targetId) {
      node.page.isTarget = true;
    }
    return node;
  });

  return;
};

const ItemContol: FC = () => {
  return (
    <>
      <button
        type="button"
        className="btn-link nav-link dropdown-toggle dropdown-toggle-no-caret border-0 rounded grw-btn-page-management py-0"
        data-toggle="dropdown"
      >
        <i className="fa fa-ellipsis-v text-muted"></i>
      </button>
      <button
        type="button"
        className="btn-link nav-link dropdown-toggle dropdown-toggle-no-caret border-0 rounded grw-btn-page-management py-0"
        data-toggle="dropdown"
      >
        <i className="fa fa-plus-circle text-muted"></i>
      </button>
    </>
  );
};

const ItemCount: FC = () => {
  return (
    <>
      <span className="badge badge-pill badge-light">
        10
      </span>
    </>
  );
};

const Item: FC<ItemProps> = (props: ItemProps) => {
  const { itemNode, isOpen: _isOpen = false } = props;

  const { page, children } = itemNode;

  const [currentChildren, setCurrentChildren] = useState(children);
  const [isOpen, setIsOpen] = useState(_isOpen);

  const { data: targetId } = usePageId();
  const { data, error } = useSWRxPageChildren(isOpen ? page._id : null);

  const hasChildren = useCallback((): boolean => {
    return currentChildren != null && currentChildren.length > 0;
  }, [currentChildren]);

  const onClickLoadChildren = useCallback(async() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  // didMount
  useEffect(() => {
    if (hasChildren()) setIsOpen(true);
  }, []);

  /*
   * Make sure itemNode.children and currentChildren are synced
   */
  useEffect(() => {
    if (children.length > currentChildren.length) {
      markTarget(children, targetId);
      setCurrentChildren(children);
    }
  }, []);

  /*
   * When swr fetch succeeded
   */
  useEffect(() => {
    if (isOpen && error == null && data != null) {
      const newChildren = ItemNode.generateNodesFromPages(data.children);
      markTarget(newChildren, targetId);
      setCurrentChildren(newChildren);
    }
  }, [data]);

  // TODO: improve style
  const opacityStyle = { opacity: 1.0 };
  if (page.isTarget) opacityStyle.opacity = 0.7;

  const buttonClass = isOpen ? 'rotate' : '';

  return (
    <div className="grw-pagetree-item-wrapper">
      <div style={opacityStyle} className="grw-pagetree-item d-flex align-items-center">
        <button
          type="button"
          className={`grw-pagetree-button btn ${buttonClass}`}
          onClick={onClickLoadChildren}
        >
          <i className="icon-control-play"></i>
        </button>
        <a href={page._id} className="flex-grow-1">
          <p className="grw-pagetree-title m-auto">{nodePath.basename(page.path as string) || '/'}</p>
        </a>
        <div className="grw-pagetree-count">
          <ItemCount />
        </div>
        <div className="grw-pagetree-control">
          <ItemContol />
        </div>
      </div>
      {
        isOpen && hasChildren() && currentChildren.map(node => (
          <Item
            key={node.page._id}
            itemNode={node}
            isOpen={false}
          />
        ))
      }
    </div>
  );

};

export default Item;
