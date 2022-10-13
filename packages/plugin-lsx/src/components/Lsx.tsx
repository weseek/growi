import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import * as url from 'url';

import { IPage, pathUtils } from '@growi/core';
import axios from 'axios';

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

function generatePageNodeTree(rootPagePath: string, pages: IPage[]) {
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


type Props = {
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

type StateCache = {
  isError: boolean,
  errorMessage: string,
  basisViewersCount?: number,
  nodeTree?: PageNode[],
}

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
    const stateCache = tagCacheManager.getStateCache(lsxContext) as StateCache | null;

    // instanciate PageNode
    if (stateCache != null && stateCache.nodeTree != null) {
      stateCache.nodeTree = stateCache.nodeTree.map((obj) => {
        return PageNode.instanciateFrom(obj);
      });
    }

    return stateCache;
  }, [lsxContext]);

  const loadData = useCallback(async() => {
    setLoading(true);

    // add slash ensure not to forward match to another page
    // ex: '/Java/' not to match to '/JavaScript'
    const pagePath = pathUtils.addTrailingSlash(lsxContext.pagePath);

    let newNodeTree: PageNode[] = [];
    try {
      const result = await axios.get('/_api/plugins/lsx', {
        params: {
          pagePath,
          options: lsxContext.options,
        },
      });

      newNodeTree = generatePageNodeTree(pagePath, result.data.pages);
      setNodeTree(newNodeTree);
      setBasisViewersCount(result.data.toppageViewersCount);
      setError(false);

      // store to sessionStorage
      tagCacheManager.cacheState(lsxContext, {
        isError: false,
        errorMessage: '',
        basisViewersCount,
        nodeTree: newNodeTree,
      });
    }
    catch (error) {
      setError(true);
      setErrorMessage(error.message);

      // store to sessionStorage
      tagCacheManager.cacheState(lsxContext, {
        isError: true,
        errorMessage: error.message,
      });
    }
    finally {
      setLoading(false);
    }
  }, [basisViewersCount, lsxContext]);

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

    const showListView = nodeTree != null && (!isLoading || nodeTree.length > 0);

    return (
      <>
        { isLoading && (
          <div className={`text-muted ${isLoading ? 'lsx-blink' : ''}`}>
            <small>
              <i className="fa fa-spinner fa-pulse mr-1"></i>
              {lsxContext.toString()}
              { isCacheExists && <>&nbsp;(Showing cache..)</> }
            </small>
          </div>
        ) }
        { showListView && (
          <LsxListView nodeTree={nodeTree} lsxContext={lsxContext} basisViewersCount={basisViewersCount} />
        ) }
      </>
    );
  };

  return <div className={`lsx ${styles.lsx}`}>{renderContents()}</div>;
};
