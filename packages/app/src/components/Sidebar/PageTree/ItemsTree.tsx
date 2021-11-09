import React, { FC } from 'react';

import { IPage } from '../../../interfaces/page';
import { ItemNode } from './ItemNode';
import Item from './Item';

/*
 * Mock data
 */
const ancestors: (Partial<IPage> & {isTarget?: boolean})[] = [
  {
    path: '/A/B',
    isEmpty: false,
    grant: 1,
  },
  {
    path: '/A',
    isEmpty: false,
    grant: 1,
  },
  {
    path: '/',
    isEmpty: false,
    grant: 1,
  },
];


/*
 * Utility to generate node tree and return the root node
 */
const generateInitialTreeFromAncestors = (ancestors: Partial<IPage>[]): ItemNode => {
  const rootPage = ancestors[ancestors.length - 1]; // the last item is the root
  if (rootPage?.path !== '/') throw Error('/ not exist in ancestors');

  const ancestorNodes = ancestors.map((page, i): ItemNode => {
    // isPartialChildren will be false for the target page
    const isPartialChildren = i !== 0;
    return new ItemNode(page, [], isPartialChildren);
  });

  // update children for each node
  const rootNode = ancestorNodes.reduce((child, parent) => {
    parent.children = [child];
    return parent;
  });

  return rootNode;
};

/*
 * ItemsTree
 */
const ItemsTree: FC = () => {
  // TODO: fetch ancestors using swr
  if (ancestors == null) return null;

  // create node tree
  const rootNode = generateInitialTreeFromAncestors(ancestors);

  const isOpen = true;

  return (
    <>
      <Item key={rootNode.page.path} itemNode={rootNode} isOpen={isOpen} />
    </>
  );
};

export default ItemsTree;
