import * as url from 'url';

import { IPageHasId, ParseRangeResult, pathUtils } from '@growi/core';

import type { PageNode } from '../interfaces/page-node';

function isEquals(path1: string, path2: string) {
  return pathUtils.removeTrailingSlash(path1) === pathUtils.removeTrailingSlash(path2);
}

function getParentPath(path: string) {
  return pathUtils.removeTrailingSlash(decodeURIComponent(url.resolve(path, './')));
}

/**
 * generate PageNode instances for target page and the ancestors
 *
 * @param {any} pathToNodeMap
 * @param {any} rootPagePath
 * @param {any} pagePath
 * @returns
 * @memberof Lsx
 */
function generatePageNode(pathToNodeMap: Record<string, PageNode>, rootPagePath: string, pagePath: string): PageNode | null {
  // exclude rootPagePath itself
  if (isEquals(pagePath, rootPagePath)) {
    return null;
  }

  // return when already registered
  if (pathToNodeMap[pagePath] != null) {
    return pathToNodeMap[pagePath];
  }

  // generate node
  const node = { pagePath, children: [] };
  pathToNodeMap[pagePath] = node;

  /*
    * process recursively for ancestors
    */
  // get or create parent node
  const parentPath = getParentPath(pagePath);
  const parentNode = generatePageNode(pathToNodeMap, rootPagePath, parentPath);
  // associate to patent
  if (parentNode != null) {
    parentNode.children.push(node);
  }

  return node;
}

export function generatePageNodeTree(rootPagePath: string, pages: IPageHasId[], depthRange?: ParseRangeResult | null): PageNode[] {
  const pathToNodeMap: Record<string, PageNode> = {};

  pages.forEach((page) => {
    const node = generatePageNode(pathToNodeMap, rootPagePath, page.path); // this will not be null

    // exclude rootPagePath itself
    if (node == null) {
      return;
    }

    // set the Page substance
    node.page = page;
  });

  // return root objects
  const rootNodes: PageNode[] = [];
  Object.keys(pathToNodeMap).forEach((pagePath) => {
    // exclude '/'
    if (pagePath === '/') {
      return;
    }

    const parentPath = getParentPath(pagePath);

    // pick up what parent doesn't exist
    if ((parentPath === '/') || !(parentPath in pathToNodeMap)) {
      rootNodes.push(pathToNodeMap[pagePath]);
    }
  });
  return rootNodes;
}
