import React from 'react';
import urlgrey from 'urlgrey';

import styles from '../../css/index.css';

import { LsxContext } from '../util/LsxContext';
import { LsxCacheHelper } from '../util/LsxCacheHelper';
import { PageNode } from './PageNode';
import { ListView } from './PageList/ListView';

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

  componentDidMount() {
    // check cache exists
    if (this.props.lsxStateCache) {
      this.setState({
        isLoading: false,
        nodeTree: this.props.lsxStateCache.nodeTree,
        isError: this.props.lsxStateCache.isError,
        errorMessage: this.props.lsxStateCache.errorMessage,
      });
      return;   // go to render()
    }

    const lsxContext = this.props.lsxContext;
    lsxContext.parse();

    // ensure not to forward match to another page
    // ex: ensure '/Java/' not to match to '/JavaScript'
    let pagePath = this.addSlashOfEnd(lsxContext.pagePath);

    this.props.crowi.apiGet('/plugins/lsx', {pagePath, queryOptions: ''})
      .catch(error => {
        const errorMessage = error.response.data.error.message;
        this.setState({ isError: true, errorMessage: errorMessage });
      })
      .then((res) => {
        if (res.ok) {
          const nodeTree = this.generatePageNodeTree(pagePath, res.pages);
          this.setState({ nodeTree });
        }
        else {
          return Promise.reject(res.error);
        }
      })
      // finally
      .then(() => {
        this.setState({ isLoading: false });

        // store to sessionStorage
        const cacheKey = LsxCacheHelper.generateCacheKeyFromContext(lsxContext);
        LsxCacheHelper.cacheState(cacheKey, this.state);
      })
  }

  /**
   * generate tree structure
   *
   * @param {string} pagePath
   * @param {Page[]} pages Array of Page model
   *
   * @memberOf Lsx
   */
  generatePageNodeTree(pagePath, pages) {
    let pathToNodeMap = {};

    pages.forEach((page) => {
      // exclude pagePath itself
      if (page.path === this.omitSlashOfEnd(pagePath)) {
        return;
      }

      const node = pathToNodeMap[page.path] || new PageNode();
      node.page = page;
      pathToNodeMap[page.path] = node;

      // get or create parent node
      const parentPath = this.getParentPath(page.path);
      if (parentPath !== this.omitSlashOfEnd(pagePath)) {
        let parentNode = pathToNodeMap[parentPath];
        if (parentNode === undefined) {
          parentNode = new PageNode();
          pathToNodeMap[parentPath] = parentNode;
        }
        // associate to patent
        parentNode.children.push(node);
      }
    });

    // return root objects
    return Object.values(pathToNodeMap).filter((node) => {
      const parentPath = this.getParentPath(node.page.path);
      return !(parentPath in pathToNodeMap);
    });
  }

  /**
   * return path that added slash to the end for specified path
   *
   * @param {any} path
   * @returns
   *
   * @memberOf Lsx
   */
  addSlashOfEnd(path) {
    let returnPath = path;
    if (!path.match(/\/$/)) {
      returnPath += '/';
    }
    return returnPath;
  }

  /**
   * return path that omitted slash of the end from specified path
   *
   * @param {any} path
   * @returns
   *
   * @memberOf Lsx
   */
  omitSlashOfEnd(path) {
    let returnPath = path;
    if (path.match(/\/$/)) {
      returnPath = path.substr(0, path.length -1);
    }
    return returnPath;
  }

  getParentPath(path) {
    const parent = urlgrey(path).parent();
    return decodeURIComponent(parent.path());
  }

  render() {
    const lsxContext = this.props.lsxContext;

    if (this.state.isLoading) {
      return (
        <div className="text-muted">
          <i className="fa fa-spinner fa-pulse fa-fw"></i>
          <span className={styles.lsxBlink}>{lsxContext.tagExpression}</span>
        </div>
      );
    }
    if (this.state.isError) {
      return (
        <div className="text-warning">
          <i className="fa fa-exclamation-triangle fa-fw"></i>
          {lsxContext.tagExpression} (-> <small>{this.state.errorMessage})</small>
        </div>
      )
    }
    // render tree
    else {
      return <ListView nodeTree={this.state.nodeTree}
          options={lsxContext.options}
          lsxContext={this.props.lsxContext} />
    }
  }
}

Lsx.propTypes = {
  crowi: React.PropTypes.object.isRequired,

  lsxContext: React.PropTypes.instanceOf(LsxContext).isRequired,
  lsxStateCache: React.PropTypes.object,
};
