import React, { useCallback, useState, FC } from 'react';

import { ItemNode } from './ItemNode';
import { useSWRxPageChildren } from '../../../stores/page-listing';


interface ItemProps {
  itemNode: ItemNode
  isOpen?: boolean
}

const Item: FC<ItemProps> = (props: ItemProps) => {
  const { itemNode, isOpen: _isOpen = false } = props;

  const { page, children } = itemNode;

  const [currentChildren, setCurrentChildren] = useState(children);

  const [isOpen, setIsOpen] = useState(_isOpen);

  const { data, error } = useSWRxPageChildren(isOpen ? page._id : null);

  const hasChildren = useCallback((): boolean => {
    return currentChildren != null && currentChildren.length > 0;
  }, [currentChildren]);

  const onClickLoadChildren = useCallback(async() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  /*
   * When swr fetch succeeded
   */
  if (isOpen && error == null && data != null) {
    const { children } = data;
    itemNode.children = ItemNode.generateNodesFromPages(children);
  }

  // make sure itemNode.children and currentChildren are synced
  if (children.length > currentChildren.length) {
    setCurrentChildren(children);
  }

  // TODO: improve style
  const style = { margin: '10px', opacity: 1.0 };
  if (page.isTarget) style.opacity = 0.7;

  return (
    <div style={style}>
      <div>
        <button type="button" className="btn btn-light p-1" onClick={onClickLoadChildren}>Load</button>
        <a href={page._id}>
          <p>{page.path}</p>
        </a>
      </div>
      {
        hasChildren() && currentChildren.map(node => (
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
