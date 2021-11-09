import React, { FC } from 'react';

import { IPage } from '../../../interfaces/page';
import { ItemNode } from './ItemNode';
import Item from './Item';
import { useSWRxPageSiblings, useSWRxPageAncestors } from '../../../stores/page-listing';


/*
 * Utility to generate node tree and return the root node
 */
const generateInitialTreeFromAncestors = (ancestors: Partial<IPage>[], siblings: Partial<IPage>[]): ItemNode => {
  const rootPage = ancestors[ancestors.length - 1];
  if (rootPage?.path !== '/') throw Error('/ not exist in ancestors');

  const ancestorNodes = ancestors.map((page, i): ItemNode => {
    if (i === 0) {
      const siblingNodes = siblings.map(page => new ItemNode(page));
      return new ItemNode(page, siblingNodes);
    }
    return new ItemNode(page, [], true);
  });

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
  // TODO: get from props
  const path = '/Sandbox/Bootstrap4';
  const id = '6181188ae38676152e464fc2';

  const { data: ancestorsData, error: error1 } = useSWRxPageAncestors(path, id);
  const { data: siblingsData, error: error2 } = useSWRxPageSiblings(path);

  if (error1 != null || error2 != null) {
    return null;
  }

  if (ancestorsData == null || siblingsData == null) {
    return null;
  }

  const { ancestors } = ancestorsData;
  const { targetAndSiblings } = siblingsData;

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
