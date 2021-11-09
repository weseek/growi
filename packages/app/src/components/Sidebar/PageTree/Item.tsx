import React, { memo, useState } from 'react';
import { IPage } from '../../../interfaces/page';
import { ItemNode } from './ItemNode';


interface ItemProps {
  itemNode: ItemNode
  isOpen?: boolean
}

const Item = memo<ItemProps>((props: ItemProps) => {
  const { itemNode, isOpen = false } = props;

  const { page, children, isPartialChildren } = itemNode;

  // TODO: fetch data if isPartialChildren

  if (page == null) {
    return null;
  }

  // TODO: improve style
  const style = { margin: '10px', opacity: 1.0 };
  if (page.isTarget) style.opacity = 0.7;

  /*
   * Normal render
   */
  return (
    <div style={style}>
      <p>{page.path}</p>
      {
        itemNode.hasChildren() && (children as ItemNode[]).map(node => (
          <Item
            key={node.page.path}
            itemNode={node}
            isOpen={false}
          />
        ))
      }
    </div>
  );

});

export default Item;
