import React, { FC } from 'react';

import { IPage } from '../../../interfaces/page';
import { ItemNode } from './ItemNode';
import Item from './Item';
import { useSWRxPageSiblings, useSWRxPageAncestors } from '../../../stores/page-listing';

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
  // TODO: get from props
  const path = '/Sandbox/Bootstrap4';
  const id = '6181188ae38676152e464fc2';

  const { data: ancestorsData, error } = useSWRxPageAncestors(path, id);

  if (error != null) {
    return null;
  }

  if (ancestorsData == null) {
    return null;
  }

  const { ancestors } = ancestorsData;

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
