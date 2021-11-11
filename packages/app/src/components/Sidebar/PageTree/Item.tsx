import React, { memo, useCallback, useState } from 'react';

import { ItemNode } from './ItemNode';
import { useSWRxPageChildren } from '../../../stores/page-listing';


interface ItemProps {
  itemNode: ItemNode
  isOpen?: boolean
}

const Item = (props: ItemProps) => {
  const { itemNode, isOpen = false } = props;

  const { page, children } = itemNode;

  const [currentChildren, setCurrentChildren] = useState(children);

  const [shouldFetch, setShouldFetch] = useState(false);
  const { data, error } = useSWRxPageChildren(shouldFetch ? page._id : null);

  const hasChildren = useCallback((): boolean => {
    return currentChildren != null && currentChildren?.length > 0;
  }, [currentChildren]);

  const onClickLoadChildren = useCallback(() => {
    setShouldFetch(true);
  }, []);

  if (error == null && data != null) {
    const { children } = data;
    setCurrentChildren(ItemNode.generateNodesFromPages(children));
  }

  if (page == null) {
    return null;
  }

  // TODO: improve style
  const style = { margin: '10px', opacity: 1.0 };
  if (page.isTarget) style.opacity = 0.7;

  console.log('すべて', hasChildren(), currentChildren, itemNode);
  return (
    <div style={style}>
      <p>{page.path} <button type="button" onClick={onClickLoadChildren}>Load</button></p>
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
