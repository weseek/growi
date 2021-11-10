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
  if (!isTopPage(rootPage?.path as string)) throw new Error('/ not exist in ancestors');

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
  const path = '/';

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
    let ancestors: ItemNode[] = [];

    if (initialNode.children.length === 0) { // when showing top page
      ancestors = [initialNode];
    }
    else {
      let currentNode = initialNode;
      while (currentNode.hasChildren() && currentNode?.children?.[0] != null) {
        ancestors.push(currentNode);
        const child = currentNode.children[0];
        currentNode = child;
      }
    }

    // update children
    ancestors.forEach((node) => {
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
