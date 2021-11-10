import React, { FC } from 'react';

import { IPage } from '../../../interfaces/page';
import { ItemNode } from './ItemNode';
import Item from './Item';
import { useSWRxPageAncestorsChildren } from '../../../stores/page-listing';
import { useTargetAndAncestors } from '../../../stores/context';

/*
 * Utility to generate initial node and return
 */
const generateInitialNode = (targetAndAncestors: Partial<IPage>[]): ItemNode => {
  const rootPage = targetAndAncestors[targetAndAncestors.length - 1]; // the last item is the root
  if (rootPage?.path !== '/') throw Error('/ not exist in ancestors');

  const nodes = targetAndAncestors.map((page): ItemNode => {
    return new ItemNode(page, []);
  });

  // update children for each node
  const rootNode = nodes.reduce((child, parent) => {
    parent.children = [child];
    return parent;
  });

  return rootNode;
};

/*
 * ItemsTree
 */
const ItemsTree: FC = () => {
  // TODO: get from props
  const path = '/Sandbox/Bootstrap4';

  // initial request
  const { data: targetAndAncestors, error } = useTargetAndAncestors();

  // secondary request
  const { data: ancestorsChildrenData, error: error2 } = useSWRxPageAncestorsChildren(targetAndAncestors != null ? path : null);

  if (error != null || error2 != null) {
    return null;
  }

  if (targetAndAncestors == null) {
    return null;
  }

  const initialNode = generateInitialNode(targetAndAncestors);

  /*
   * when second SWR resolved
   */
  if (ancestorsChildrenData != null) {
    // increment initialNode
    const { ancestorsChildren } = ancestorsChildrenData;

    // flatten ancestors
    const partialChildren: ItemNode[] = [];
    let currentNode = initialNode;
    while (currentNode.hasChildren() && currentNode?.children?.[0] != null) {
      const child = currentNode.children[0];
      partialChildren.push(child);
      currentNode = child;
    }

    // update children
    partialChildren.forEach((node) => {
      const childPages = ancestorsChildren[node.page.path as string];
      node.children = ItemNode.generateNodesFromPages(childPages);
    });
  }

  const isOpen = true;
  return (
    <>
      <Item key={initialNode.page.path} itemNode={initialNode} isOpen={isOpen} />
    </>
  );
};

export default ItemsTree;
