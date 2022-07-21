
import React from 'react';

import * as url from 'url';

import { pathUtils } from '@growi/core';
import axios from 'axios';
import PropTypes from 'prop-types';

// eslint-disable-next-line no-unused-vars
import { LsxContext } from '../util/LsxContext';
import { TagCacheManagerFactory } from '../util/TagCacheManagerFactory';

import { LsxListView } from './LsxPageList/LsxListView';
import { PageNode } from './PageNode';

import styles from '../../css/index.css';

export class Lsx extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      isError: false,
      isCacheExists: false,
      nodeTree: undefined,
      basisViewersCount: undefined,
      errorMessage: '',
    };

    this.tagCacheManager = TagCacheManagerFactory.getInstance();
  }

  async componentDidMount() {
    const { lsxContext, forceToFetchData } = this.props;

    // get state object cache
    const stateCache = this.retrieveDataFromCache();

    if (stateCache != null) {
      this.setState({
        isCacheExists: true,
        nodeTree: stateCache.nodeTree,
        isError: stateCache.isError,
        errorMessage: stateCache.errorMessage,
      });

      // switch behavior by forceToFetchData
      if (!forceToFetchData) {
        return; // go to render()
      }
    }

    lsxContext.parse();
    this.setState({ isLoading: true });

    // add slash ensure not to forward match to another page
    // ex: '/Java/' not to match to '/JavaScript'
    const pagePath = pathUtils.addTrailingSlash(lsxContext.pagePath);

    try {
      const res = await axios.get('/_api/plugins/lsx', {
        params: {
          pagePath,
          options: lsxContext.options,
        },
      });

      if (res.data.ok) {
        const basisViewersCount = res.data.toppageViewersCount;
        const nodeTree = this.generatePageNodeTree(pagePath, res.data.pages);
        this.setState({ nodeTree, basisViewersCount });
      }
    }
    catch (error) {
      this.setState({ isError: true, errorMessage: error.message });
    }
    finally {
      this.setState({ isLoading: false });

      // store to sessionStorage
      this.tagCacheManager.cacheState(lsxContext, this.state);
    }
  }

  retrieveDataFromCache() {
    const { lsxContext } = this.props;

    // get state object cache
    const stateCache = this.tagCacheManager.getStateCache(lsxContext);

    // instanciate PageNode
    if (stateCache != null && stateCache.nodeTree != null) {
      stateCache.nodeTree = stateCache.nodeTree.map((obj) => {
        return PageNode.instanciateFrom(obj);
      });
    }

    return stateCache;
  }

  /**
   * generate tree structure
   *
   * @param {string} rootPagePath
   * @param {Page[]} pages Array of Page model
   *
   * @memberOf Lsx
   */
  generatePageNodeTree(rootPagePath, pages) {
    const pathToNodeMap = {};

    pages.forEach((page) => {
      // add slash ensure not to forward match to another page
      // e.g. '/Java/' not to match to '/JavaScript'
      const pagePath = pathUtils.addTrailingSlash(page.path);

      // exclude rootPagePath itself
      if (this.isEquals(pagePath, rootPagePath)) {
        return;
      }

      const node = this.generatePageNode(pathToNodeMap, rootPagePath, pagePath); // this will not be null
      // set the Page substance
      node.page = page;
    });

    // return root objects
    const rootNodes = [];
    Object.keys(pathToNodeMap).forEach((pagePath) => {
      // exclude '/'
      if (pagePath === '/') {
        return;
      }

      const parentPath = this.getParentPath(pagePath);

      // pick up what parent doesn't exist
      if ((parentPath === '/') || !(parentPath in pathToNodeMap)) {
        rootNodes.push(pathToNodeMap[pagePath]);
      }
    });
    return rootNodes;
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
  generatePageNode(pathToNodeMap, rootPagePath, pagePath) {
    // exclude rootPagePath itself
    if (this.isEquals(pagePath, rootPagePath)) {
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
    const parentPath = this.getParentPath(pagePath);
    const parentNode = this.generatePageNode(pathToNodeMap, rootPagePath, parentPath);
    // associate to patent
    if (parentNode != null) {
      parentNode.children.push(node);
    }

    return node;
  }

  /**
   * compare whether path1 and path2 is the same
   *
   * @param {string} path1
   * @param {string} path2
   * @returns
   *
   * @memberOf Lsx
   */
  isEquals(path1, path2) {
    return pathUtils.removeTrailingSlash(path1) === pathUtils.removeTrailingSlash(path2);
  }

  getParentPath(path) {
    return pathUtils.addTrailingSlash(decodeURIComponent(url.resolve(path, '../')));
  }

  renderContents() {
    const lsxContext = this.props.lsxContext;
    const {
      isLoading, isError, isCacheExists, nodeTree,
    } = this.state;

    if (isError) {
      return (
        <div className="text-warning">
          <i className="fa fa-exclamation-triangle fa-fw"></i>
          {lsxContext.tagExpression} (-&gt; <small>{this.state.errorMessage}</small>)
        </div>
      );
    }


    return (
      <div className={isLoading ? 'lsx-blink' : ''}>
        { isLoading && (
          <div className="text-muted">
            <i className="fa fa-spinner fa-pulse mr-1"></i>
            {lsxContext.tagExpression}
            { isCacheExists && <small>&nbsp;(Showing cache..)</small> }
          </div>
        ) }
        { nodeTree && (
          <LsxListView nodeTree={this.state.nodeTree} lsxContext={this.props.lsxContext} basisViewersCount={this.state.basisViewersCount} />
        ) }
      </div>
    );

  }

  render() {
    return <div className="lsx">{this.renderContents()}</div>;
  }

}

Lsx.propTypes = {
  lsxContext: PropTypes.instanceOf(LsxContext).isRequired,

  forceToFetchData: PropTypes.bool,
};
