import React from 'react';
import PropTypes from 'prop-types';

import * as url from 'url';

import { pathUtils } from 'growi-commons';
import RefsContext from '../util/RefsContext';
import CacheHelper from '../util/CacheHelper';


export default class AttachmentList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      isError: false,
      errorMessage: '',
    };
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillMount() {
    const pluginContext = this.props.refContext || this.props.refsContext;

    // get state object cache
    const stateCache = CacheHelper.getStateCache(pluginContext);

    // check cache exists
    if (stateCache != null) {
      this.setState({
        isLoading: false,
        isError: stateCache.isError,
        errorMessage: stateCache.errorMessage,
      });
      return; // go to render()
    }

    pluginContext.parse();

    // // add slash ensure not to forward match to another page
    // // ex: '/Java/' not to match to '/JavaScript'
    // const pagePath = pathUtils.addTrailingSlash(pluginContext.pagePath);

    // this.props.appContainer.apiGet('/plugins/lsx', { pagePath, options: pluginContext.options })
    //   .then((res) => {
    //     if (res.ok) {
    //       const nodeTree = this.generatePageNodeTree(pagePath, res.pages);
    //       this.setState({ nodeTree });
    //     }
    //     else {
    //       return Promise.reject(res.error);
    //     }
    //   })
    //   .catch((error) => {
    //     this.setState({ isError: true, errorMessage: error.message });
    //   })
    //   // finally
    //   .then(() => {
    //     this.setState({ isLoading: false });

    //     // store to sessionStorage
    //     CacheHelper.cacheState(pluginContext, this.state);
    //   });
  }

  // renderContents() {
  //   const lsxContext = this.props.lsxContext;

  //   if (this.state.isLoading) {
  //     return (
  //       <div className="text-muted">
  //         <i className="fa fa-spinner fa-pulse mr-1"></i>
  //         <span className="lsx-blink">{lsxContext.tagExpression}</span>
  //       </div>
  //     );
  //   }
  //   if (this.state.isError) {
  //     return (
  //       <div className="text-warning">
  //         <i className="fa fa-exclamation-triangle fa-fw"></i>
  //         {lsxContext.tagExpression} (-&gt; <small>{this.state.errorMessage}</small>)
  //       </div>
  //     );
  //   }
  //   // render tree

  //   return <LsxListView nodeTree={this.state.nodeTree} lsxContext={this.props.lsxContext} />;

  // }

  render() {
    return <div className="refs-attachment-list">AttachmentList</div>;
  }

}

AttachmentList.propTypes = {
  appContainer: PropTypes.object.isRequired,
  refContext: PropTypes.instanceOf(PropTypes.instanceOf(Object)),
  refsContext: PropTypes.instanceOf(PropTypes.instanceOf(RefsContext)),
};
