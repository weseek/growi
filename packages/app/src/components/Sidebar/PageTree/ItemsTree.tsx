import React, { FC, useState } from 'react';
import { pagePathUtils } from '@growi/core';

import { IPage } from '../../../interfaces/page';
import { ItemNode } from './ItemNode';
import Item from './Item';
import { useSWRxPageAncestors, useSWRxPageAncestorsChildren } from '../../../stores/page-listing';

const { isTopPage } = pagePathUtils;

/*
 * Utility to generate initial node and return
 */
const generateInitialNode = (targetAndAncestors: Partial<IPage>[]): ItemNode => {
  const rootPage = targetAndAncestors[targetAndAncestors.length - 1]; // the last item is the root
  if (!isTopPage(rootPage?.path as string)) throw Error('/ not exist in ancestors');

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

const generateInitialNodeWithChildren = (ancestors: Partial<IPage>[], ancestorsChildren: Record<string, Partial<IPage>[]>): ItemNode => {
  // create nodes
  const nodes = ancestors.map((page): ItemNode => {
    const children = ancestorsChildren[page.path as string].map(page => new ItemNode(page, []));
    return new ItemNode(page, children);
  });

  // update children for each node
  const rootNode = nodes.reduce((child, parent) => {
    parent.children = [child];
    return parent;
  });

  return rootNode;
};

// TODO: get from props
const path = '/Sandbox/Bootstrap4';
const id = '6181188ae38676152e464fc2';

/*
 * ItemsTree
 */
const ItemsTree: FC = () => {
  const [initialNode, setInitialNode] = useState<ItemNode | null>(null);

  // initial request this is important
  const { data: ancestorsChildrenData, error } = useSWRxPageAncestorsChildren(path);
  // secondary request
  const { data: ancestorsData, error: error2 } = useSWRxPageAncestors(path, id);


  if (error != null || error2 != null) {
    return null;
  }

  if (ancestorsData == null) {
    return null;
  }

  /*
   * When initial request is taking long
   */
  if (ancestorsChildrenData == null) {
    const { targetAndAncestors } = ancestorsData;
    const newInitialNode = generateInitialNode(targetAndAncestors);
    setInitialNode(newInitialNode); // rerender
  }

  /*
   * When initial request finishes
   */
  if (ancestorsChildrenData != null) {
    // increment initialNode
    const { targetAndAncestors } = ancestorsData;
    const { ancestorsChildren } = ancestorsChildrenData;
    const ancestors = targetAndAncestors.filter(page => page.path !== path);

    const newInitialNode = generateInitialNodeWithChildren(ancestors, ancestorsChildren);
    setInitialNode(newInitialNode); // rerender
  }

  if (initialNode == null) {
    return null;
  }

  const isOpen = true;
  return (
    <>
      <Item key={(initialNode as ItemNode).page.path} itemNode={(initialNode as ItemNode)} isOpen={isOpen} />
    </>
  );
};

/*
 * ItemsTree wrapper
 */


export default ItemsTree;
