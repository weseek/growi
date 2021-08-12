import React from 'react';
import PropTypes from 'prop-types';

import * as url from 'url';

import { pathUtils } from 'growi-commons';

// eslint-disable-next-line no-unused-vars
import styles from '../../css/index.css';

import { LsxContext } from '../util/LsxContext';
import { LsxCacheHelper } from '../util/LsxCacheHelper';
import { PageNode } from './PageNode';
import { LsxListView } from './LsxPageList/LsxListView';


export class Lsx extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      isError: false,
      nodeTree: undefined,
      errorMessage: '',
    };
  }

  componentWillMount() {
    const lsxContext = this.props.lsxContext;
    lsxContext.parse();

    // check cache exists
    if (this.props.lsxStateCache) {
      this.setState({
        isLoading: false,
        nodeTree: this.props.lsxStateCache.nodeTree,
        isError: this.props.lsxStateCache.isError,
        errorMessage: this.props.lsxStateCache.errorMessage,
      });
      return; // go to render()
    }

    // add slash ensure not to forward match to another page
    // ex: '/Java/' not to match to '/JavaScript'
    const pagePath = pathUtils.addTrailingSlash(lsxContext.pagePath);

    this.props.appContainer.apiGet('/plugins/lsx', { pagePath, options: lsxContext.options })
      .then((res) => {
        if (res.ok) {
          const nodeTree = this.generatePageNodeTree(pagePath, res.pages);
          this.setState({ nodeTree });
        }
        else {
          return Promise.reject(res.error);
        }
      })
      .catch((error) => {
        this.setState({ isError: true, errorMessage: error.message });
      })
      // finally
      .then(() => {
        this.setState({ isLoading: false });

        // store to sessionStorage
        const cacheKey = LsxCacheHelper.generateCacheKeyFromContext(lsxContext);
        LsxCacheHelper.cacheState(cacheKey, this.state);
      });
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

    if (this.state.isLoading) {
      return (
        <div className="text-muted">
          <i className="fa fa-spinner fa-pulse mr-1"></i>
          <span className="lsx-blink">{lsxContext.tagExpression}</span>
        </div>
      );
    }
    if (this.state.isError) {
      return (
        <div className="text-warning">
          <i className="fa fa-exclamation-triangle fa-fw"></i>
          {lsxContext.tagExpression} (-&gt; <small>{this.state.errorMessage}</small>)
        </div>
      );
    }
    // render tree

    return <LsxListView nodeTree={this.state.nodeTree} lsxContext={this.props.lsxContext} />;

  }

  render() {
    return <div className="lsx">{this.renderContents()}</div>;
  }

}

Lsx.propTypes = {
  appContainer: PropTypes.object.isRequired,

  lsxContext: PropTypes.instanceOf(LsxContext).isRequired,
  lsxStateCache: PropTypes.object,
};
