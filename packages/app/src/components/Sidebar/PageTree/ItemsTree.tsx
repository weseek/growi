import React, { FC } from 'react';
import { pagePathUtils } from '@growi/core';

import { IPage } from '../../../interfaces/page';
import { ItemNode } from './ItemNode';
import Item from './Item';
import { useSWRxPageAncestorsChildren } from '../../../stores/page-listing';
import { useTargetAndAncestors } from '../../../stores/context';
import { HasObjectId } from '../../../interfaces/has-object-id';

const { isTopPage } = pagePathUtils;

/*
 * Utility to generate initial node
 */
const generateInitialNodeBeforeResponse = (targetAndAncestors: Partial<IPage>[]): ItemNode => {
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

const generateInitialNodeAfterResponse = (ancestorsChildren: Record<string, Partial<IPage & HasObjectId>[]>, rootNode: ItemNode): ItemNode => {
  const paths = Object.keys(ancestorsChildren);

  const rootPath = paths[paths.length - 1]; // the last item is the root
  if (!isTopPage(rootPath)) throw new Error('rootPath must be "/"');

  let currentNode = rootNode;
  paths.reverse().forEach((path) => {
    const childPages = ancestorsChildren[path];
    currentNode.children = ItemNode.generateNodesFromPages(childPages);

    const nextNode = currentNode.children.filter((node) => {
      return paths.includes(node.page.path as string);
    })[0];
    currentNode = nextNode;
  });

  return rootNode;
};


/*
 * ItemsTree
 */
const ItemsTree: FC = () => {
  // TODO: get from static SWR
  const path = '/Sandbox/Mathematics';

  const { data: targetAndAncestors, error } = useTargetAndAncestors();

  const { data: ancestorsChildrenData, error: error2 } = useSWRxPageAncestorsChildren(path);

  if (error != null || error2 != null) {
    return null;
  }

  if (targetAndAncestors == null) {
    return null;
  }

  let initialNode: ItemNode;

  /*
   * Before swr response comes back
   */
  if (ancestorsChildrenData == null) {
    initialNode = generateInitialNodeBeforeResponse(targetAndAncestors);
  }

  /*
   * When swr request finishes
   */
  else {
    const { ancestorsChildren } = ancestorsChildrenData;

    const rootPage = targetAndAncestors[targetAndAncestors.length - 1];
    const rootNode = new ItemNode(rootPage);

    initialNode = generateInitialNodeAfterResponse(ancestorsChildren, rootNode);
  }

  const isOpen = true;
  return (
    <>
      <Item key={(initialNode as ItemNode).page.path} itemNode={(initialNode as ItemNode)} isOpen={isOpen} />
    </>
  );
};


export default ItemsTree;
