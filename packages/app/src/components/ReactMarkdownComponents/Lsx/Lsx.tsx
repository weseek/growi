import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import * as url from 'url';

import { pathUtils } from '@growi/core';

import { apiGet } from '~/client/util/apiv1-client';

// eslint-disable-next-line no-unused-vars

import { LsxListView } from './LsxPageList/LsxListView';
import { PageNode } from './PageNode';
import { LsxContext } from './lsx-context';
import { getInstance as getTagCacheManager } from './tag-cache-manager';

import styles from './Lsx.module.scss';


const tagCacheManager = getTagCacheManager();


/**
 * compare whether path1 and path2 is the same
 *
 * @param {string} path1
 * @param {string} path2
 * @returns
 *
 * @memberOf Lsx
 */
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
  const node = new PageNode(pagePath);
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


type Props = {
  // lsxContext: PropTypes.instanceOf(LsxContext).isRequired,

  children: React.ReactNode,
  className?: string,

  prefix: string,
  num?: string,
  depth?: string,
  sort?: string,
  reverse?: string,
  filter?: string,

  forceToFetchData?: boolean,
};

export const Lsx = ({
  prefix,
  num, depth, sort, reverse, filter,
  ...props
}: Props): JSX.Element => {

  const [isLoading, setLoading] = useState(false);
  const [isError, setError] = useState(false);
  const [isCacheExists, setCacheExists] = useState(false);
  const [nodeTree, setNodeTree] = useState<PageNode[]|undefined>();
  const [basisViewersCount, setBasisViewersCount] = useState<number|undefined>();
  const [errorMessage, setErrorMessage] = useState('');

  const { forceToFetchData } = props;

  const lsxContext = useMemo(() => {
    const options = {
      num, depth, sort, reverse, filter,
    };
    return new LsxContext(prefix, options);
  }, [depth, filter, num, prefix, reverse, sort]);

  const retrieveDataFromCache = useCallback(() => {
    // get state object cache
    const stateCache = tagCacheManager.getStateCache(lsxContext);

    // instanciate PageNode
    if (stateCache != null && stateCache.nodeTree != null) {
      stateCache.nodeTree = stateCache.nodeTree.map((obj) => {
        return PageNode.instanciateFrom(obj);
      });
    }

    return stateCache;
  }, [lsxContext]);

  const generatePageNodeTree = useCallback((rootPagePath, pages) => {
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
  }, []);

  const loadData = useCallback(async() => {
    setLoading(true);

    // add slash ensure not to forward match to another page
    // ex: '/Java/' not to match to '/JavaScript'
    const pagePath = pathUtils.addTrailingSlash(lsxContext.pagePath);

    let newNodeTree: PageNode[] = [];
    try {
      const result: any = await apiGet('/plugins/lsx', {
        pagePath,
        options: lsxContext.options,
      });

      const basisViewersCount = result.toppageViewersCount;
      newNodeTree = generatePageNodeTree(pagePath, result.pages);
      setNodeTree(newNodeTree);
      setBasisViewersCount(basisViewersCount);
    }
    catch (error) {
      setError(true);
      setErrorMessage(error.message);
    }
    finally {
      setLoading(false);

      // store to sessionStorage
      // tagCacheManager.cacheState(lsxContext, {
      //   isError,
      //   isCacheExists,
      //   basisViewersCount,
      //   errorMessage,
      //   nodeTree: newNodeTree,
      // });
    }
  }, [generatePageNodeTree, lsxContext]);

  useEffect(() => {
    // get state object cache
    const stateCache = retrieveDataFromCache();

    if (stateCache != null) {
      setCacheExists(true);
      setNodeTree(stateCache.nodeTree);
      setError(stateCache.isError);
      setErrorMessage(stateCache.errorMessage);

      // switch behavior by forceToFetchData
      if (!forceToFetchData) {
        return; // go to render()
      }
    }

    loadData();
  }, [forceToFetchData, loadData, retrieveDataFromCache]);

  const renderContents = () => {
    if (isError) {
      return (
        <div className="text-warning">
          <i className="fa fa-exclamation-triangle fa-fw"></i>
          {lsxContext.toString()} (-&gt; <small>{errorMessage}</small>)
        </div>
      );
    }


    return (
      <div className={isLoading ? 'lsx-blink' : ''}>
        { isLoading && (
          <div className="text-muted">
            <i className="fa fa-spinner fa-pulse mr-1"></i>
            {lsxContext.toString()}
            { isCacheExists && <small>&nbsp;(Showing cache..)</small> }
          </div>
        ) }
        { nodeTree && (
          <LsxListView nodeTree={nodeTree} lsxContext={lsxContext} basisViewersCount={basisViewersCount} />
        ) }
      </div>
    );
  };

  return <div className={`lsx ${styles.lsx}`}>{renderContents()}</div>;
};
