import React, { FC } from 'react';

import { IPage } from '../../../interfaces/page';
import { ItemNode } from './ItemNode';
import Item from './Item';

/*
 * Mock data
 */
const ancestors: (Partial<IPage> & {isTarget?: boolean})[] = [
  {
    path: '/',
    isEmpty: false,
    grant: 1,
  },
  {
    path: '/A',
    isEmpty: false,
    grant: 1,
  },
  {
    path: '/A/B',
    isEmpty: false,
    grant: 1,
  },
];

/*
 * Mock data
 */
const targetAndSiblings: (Partial<IPage> & {isTarget?: boolean})[] = [
  {
    path: '/A/B/C',
    isEmpty: false,
    grant: 1,
    isTarget: true,
  },
  {
    path: '/A/B/C2',
    isEmpty: false,
    grant: 1,
  },
  {
    path: '/A/B/C3',
    isEmpty: false,
    grant: 1,
  },
  {
    path: '/A/B/C4',
    isEmpty: false,
    grant: 1,
  },
];


/*
 * Utility to generate node tree and return the root node
 */
const generateInitialTreeFromAncestors = (ancestors: Partial<IPage>[], siblings: Partial<IPage>[]): ItemNode => {
  const rootPage = ancestors[0];
  if (rootPage?.path !== '/') throw Error('/ not exist in ancestors');

  const ancestorNodes = ancestors.map((page, i, array): ItemNode => {
    if (i === array.length - 1) {
      const siblingNodes = siblings.map(page => new ItemNode(page));
      return new ItemNode(page, siblingNodes);
    }
    return new ItemNode(page, [], true);
  });

  const rootNode = ancestorNodes.reverse().reduce((child, parent) => {
    parent.children = [child];
    return parent;
  });

  return rootNode;
};

/*
 * ItemsTree
 */
const ItemsTree: FC = () => {
  // TODO: fetch ancestors, siblings using swr
  if (ancestors == null) return null;

  // create node tree
  const rootNode = generateInitialTreeFromAncestors(ancestors, targetAndSiblings);

  const isOpen = true;

  return (
    <>
      <Item key={rootNode.page.path} itemNode={rootNode} isOpen={isOpen} />
    </>
  );
};

export default ItemsTree;
