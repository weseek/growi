import React from 'react';
import PropTypes from 'prop-types';

import RefsContext from '../util/RefsContext';
import TagCacheManagerFactory from '../util/TagCacheManagerFactory';


export default class AttachmentList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      errorMessage: '',

      attachments: [],
    };

    this.tagCacheManager = TagCacheManagerFactory.getInstance();
  }

  // eslint-disable-next-line react/no-deprecated
  async componentWillMount() {
    const { appContainer, refsContext } = this.props;

    // get state object cache
    const stateCache = this.tagCacheManager.getStateCache(refsContext);

    // check cache exists
    // if (stateCache != null) {
    //   this.setState({
    //     isLoading: false,
    //     isError: stateCache.isError,
    //     errorMessage: stateCache.errorMessage,
    //   });
    //   return; // go to render()
    // }

    refsContext.parse();

    let res;
    try {
      this.setState({ isLoading: true });

      console.log(refsContext);

      // TODO: try to use async/await
      res = await appContainer.apiGet('/plugin/ref', {
        pagePath: refsContext.pagePath,
        fileName: refsContext.fileName,
        options: refsContext.options,
      });

      console.log(res);

      if (res.status === 'ok') {
        this.setState({
          isLoaded: true,
          attachments: [res.attachment]
        });
      }
    }
    catch (err) {
      this.setState({
        errorMessage: err,
      });
    }
    finally {
      this.setState({ isLoading: false });
    }

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
    return <div className="refs-attachment-list">{JSON.stringify(this.props.refsContext)}</div>;
  }

}

AttachmentList.propTypes = {
  appContainer: PropTypes.object.isRequired,
  refsContext: PropTypes.instanceOf(RefsContext).isRequired,
};
