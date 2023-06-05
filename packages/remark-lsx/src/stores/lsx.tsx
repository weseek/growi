import * as url from 'url';

import { IPageHasId, pathUtils } from '@growi/core';
import axios from 'axios';
import useSWR, { SWRResponse } from 'swr';

import { LsxContext } from '../components/lsx-context';
import type { PageNode } from '../interfaces/page-node';

function isEquals(path1: string, path2: string) {
  return pathUtils.removeTrailingSlash(path1) === pathUtils.removeTrailingSlash(path2);
}

function getParentPath(path: string) {
  return pathUtils.addTrailingSlash(decodeURIComponent(url.resolve(path, '../')));
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

function generatePageNodeTree(rootPagePath: string, pages: IPageHasId[]) {
  const pathToNodeMap: Record<string, PageNode> = {};

  pages.forEach((page) => {
    // add slash ensure not to forward match to another page
    // e.g. '/Java/' not to match to '/JavaScript'
    const pagePath = pathUtils.addTrailingSlash(page.path);

    const node = generatePageNode(pathToNodeMap, rootPagePath, pagePath); // this will not be null

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

type LsxResponse = {
  pages: IPageHasId[],
  toppageViewersCount: number,
}

const useSWRxLsxResponse = (
    pagePath: string, options?: Record<string, string | undefined>, isImmutable?: boolean,
): SWRResponse<LsxResponse, Error> => {
  return useSWR(
    ['/_api/lsx', pagePath, options, isImmutable],
    async([endpoint, pagePath, options]) => {
      try {
        const res = await axios.get<LsxResponse>(endpoint, {
          params: {
            pagePath,
            options,
          },
        });
        return res.data;
      }
      catch (err) {
        if (axios.isAxiosError(err)) {
          throw new Error(err.response?.data.message);
        }
        throw err;
      }
    },
    {
      keepPreviousData: true,
      revalidateIfStale: !isImmutable,
      revalidateOnFocus: !isImmutable,
      revalidateOnReconnect: !isImmutable,
    },
  );
};

type LsxNodeTree = {
  nodeTree: PageNode[],
  toppageViewersCount: number,
}

export const useSWRxNodeTree = (lsxContext: LsxContext, isImmutable?: boolean): SWRResponse<LsxNodeTree, Error> => {
  const {
    data, error, isLoading, isValidating,
  } = useSWRxLsxResponse(lsxContext.pagePath, lsxContext.options, isImmutable);

  return useSWR(
    !isLoading && !isValidating ? ['lsxNodeTree', lsxContext.pagePath, lsxContext.options, isImmutable, data, error] : null,
    ([, pagePath, , , data]) => {
      if (data === undefined || error != null) {
        throw error;
      }
      return {
        nodeTree: generatePageNodeTree(pagePath, data?.pages),
        toppageViewersCount: data.toppageViewersCount,
      };
    },
    {
      keepPreviousData: true,
      revalidateIfStale: !isImmutable,
      revalidateOnFocus: !isImmutable,
      revalidateOnReconnect: !isImmutable,
    },
  );
};
