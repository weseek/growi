import React, { FC, useState } from 'react';

import { IPage } from '../../../interfaces/page';
import { ItemNode } from './ItemNode';
import Item from './Item';
import { useSWRxPageAncestors, useSWRxPageAncestorsChildren } from '../../../stores/page-listing';

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
  const id = '6181188ae38676152e464fc2';

  const [initialNode, setInitialNode] = useState<ItemNode | null>(null);

  // initial request
  const { data: ancestorsData, error } = useSWRxPageAncestors(path, id);

  // secondary request
  const { data: ancestorsChildrenData, error: error2 } = useSWRxPageAncestorsChildren(ancestorsData != null ? path : null);

  if (error != null || ancestorsData == null) {
    return null;
  }

  const { targetAndAncestors } = ancestorsData;
  const newInitialNode = generateInitialNode(targetAndAncestors);

  if (error2 != null) {
    return null;
  }

  /*
   * when second SWR resolved
   */
  if (ancestorsChildrenData != null) {
    // increment initialNode
    const { ancestorsChildren } = ancestorsChildrenData;

    // flatten ancestors
    const partialChildren: ItemNode[] = [];
    let currentNode = newInitialNode;
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

  setInitialNode(newInitialNode); // rerender

  if (initialNode == null) return null;

  const isOpen = true;
  return (
    <>
      <Item key={initialNode.page.path} itemNode={initialNode} isOpen={isOpen} />
    </>
  );
};

/*
 * ItemsTree wrapper
 */


export default ItemsTree;
