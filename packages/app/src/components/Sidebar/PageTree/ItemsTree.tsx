import React, { FC } from 'react';
import { pagePathUtils } from '@growi/core';

import { IPage } from '../../../interfaces/page';
import { ItemNode } from './ItemNode';
import Item from './Item';
import { useSWRxPageAncestorsChildren } from '../../../stores/page-listing';
import { useTargetAndAncestors } from '../../../stores/context';

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
  // TODO: get from props
  const path = '/Sandbox/Bootstrap4';

  const { data: targetAndAncestors, error } = useTargetAndAncestors();

  const { data: ancestorsChildrenData, error: error2 } = useSWRxPageAncestorsChildren(targetAndAncestors != null ? path : null);

  if (error != null || error2 != null) {
    return null;
  }

  if (targetAndAncestors == null) {
    return null;
  }

  const initialNode = generateInitialNode(targetAndAncestors);

  /*
   * When swr request finishes
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
      <Item key={(initialNode as ItemNode).page.path} itemNode={(initialNode as ItemNode)} isOpen={isOpen} />
    </>
  );
};

/*
 * ItemsTree wrapper
 */


export default ItemsTree;
