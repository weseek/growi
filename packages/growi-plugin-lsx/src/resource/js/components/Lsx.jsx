import React from 'react';
import urlgrey from 'urlgrey';

import styles from '../../css/index.css';

import { LsxContext } from '../util/LsxContext';
import { LsxCacheHelper } from '../util/LsxCacheHelper';
import { PageNode } from './PageNode';

export class Lsx extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      isError: false,
      tree: undefined,
      errorMessage: '',
    };
  }

  componentDidMount() {
    // check cache exists
    if (this.props.lsxStateCache) {
      this.setState({
        isLoading: false,
        tree: this.props.lsxStateCache.tree,
        isError: this.props.lsxStateCache.isError,
        errorMessage: this.props.lsxStateCache.errorMessage,
      });
      return;   // go to render()
    }

    const lsxContext = this.props.lsxContext;
    let fromPagePath = this.addSlashOfEnd(lsxContext.fromPagePath);
    const args = lsxContext.lsxArgs;

    this.props.crowi.apiGet('/plugins/lsx', {fromPagePath, args})
      .catch(error => {
        const errorMessage = error.response.data.error.message;
        this.setState({ isError: true, errorMessage: errorMessage });
      })
      .then((res) => {
        if (res.ok) {
          const tree = this.generatePageNodeTree(fromPagePath, res.pages);
          this.setState({ tree });
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
   * @param {string} fromPagePath
   * @param {Page[]} pages Array of Page model
   *
   * @memberOf Lsx
   */
  generatePageNodeTree(fromPagePath, pages) {
    let pathToNodeMap = {};

    pages.forEach((page) => {
      // exclude fromPagePath
      if (page.path === this.omitSlashOfEnd(fromPagePath)) {
        return;
      }

      const node = new PageNode(page.path, page);
      pathToNodeMap[page.path] = node;

      // get or create parent node
      const parentPath = this.getParentPath(page.path);
      let parentNode = pathToNodeMap[parentPath];
      if (parentNode === undefined) {
        parentNode = new PageNode(parentPath);
        pathToNodeMap[parentPath] = parentNode;
      }
      // associate to patent
      parentNode.children.push(node);
    });

    // remove fromPagePath
    delete pathToNodeMap[this.omitSlashOfEnd(fromPagePath)];

    // return root objects
    return Object.values(pathToNodeMap).filter((node) => {
      const parentPath = this.getParentPath(node.path);
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

  getInnerHTMLObj() {
    return { __html: this.state.html };
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
      let list = [];
      this.state.tree.forEach((node) => {
        list.push(<li>{node.path}</li>);
      });
      return <ul>{list}</ul>
    }
  }
}

Lsx.propTypes = {
  crowi: React.PropTypes.object.isRequired,

  lsxContext: React.PropTypes.instanceOf(LsxContext).isRequired,
  lsxStateCache: React.PropTypes.object,
};
