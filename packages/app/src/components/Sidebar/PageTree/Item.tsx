import React, { useCallback, useState, FC } from 'react';

import { ItemNode } from './ItemNode';
import { ChildrenResult } from '../../../interfaces/page-listing-results';
import { apiv3Get } from '../../../client/util/apiv3-client';


interface ItemProps {
  itemNode: ItemNode
  isOpen?: boolean
}

const Item: FC<ItemProps> = (props: ItemProps) => {
  const { itemNode, isOpen = false } = props;

  const { page, children } = itemNode;

  const [currentChildren, setCurrentChildren] = useState(children);

  const hasChildren = useCallback((): boolean => {
    return currentChildren != null && currentChildren.length > 0;
  }, [currentChildren]);

  const onClickLoadChildren = useCallback(async() => {
    const endpoint = `/page-listing/children?id=${page._id}`;
    try {
      const data = await apiv3Get<ChildrenResult>(endpoint).then((response) => {
        return {
          children: response.data.children,
        };
      });

      const { children } = data;
      setCurrentChildren(ItemNode.generateNodesFromPages(children));
    }
    catch (err) {
      // TODO: toastErr or something
    }
  }, [page]);


  // make sure itemNode.children and currentChildren are synced
  if (children?.length > currentChildren?.length) {
    setCurrentChildren(children);
  }

  // TODO: improve style
  const style = { margin: '10px', opacity: 1.0 };
  if (page.isTarget) style.opacity = 0.7;

  return (
    <div style={style}>
      <p><button type="button" className="btn btn-light p-1" onClick={onClickLoadChildren}>Load</button>  {page.path}</p>
      {
        hasChildren() && currentChildren?.map(node => (
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
