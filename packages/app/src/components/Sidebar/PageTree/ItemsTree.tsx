import React, { FC } from 'react';

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

  // initial request
  const { data: ancestorsData, error } = useSWRxPageAncestors(path, id);

  // secondary request
  const { data: ancestorsChildrenData, error: error2 } = useSWRxPageAncestorsChildren(path);

  if (error != null || ancestorsData == null) {
    return null;
  }

  const { targetAndAncestors } = ancestorsData;

  // create node tree
  const initialNode = generateInitialNode(targetAndAncestors);

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
