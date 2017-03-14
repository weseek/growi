import React from 'react';

import styles from '../../css/index.css';

import { LsxContext } from '../util/LsxContext';
import { LsxCacheHelper } from '../util/LsxCacheHelper';

export class Lsx extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      html: '',
      isError: false,
      errorMessage: '',
    };
  }

  componentDidMount() {
    // check cache exists
    if (this.props.lsxStateCache) {
      this.setState({
        isLoading: false,
        html: this.props.lsxStateCache.html,
        isError: this.props.lsxStateCache.isError,
        errorMessage: this.props.lsxStateCache.errorMessage,
      });
      return;   // go to render()
    }

    const lsxContext = this.props.lsxContext;
    const fromPagePath = lsxContext.fromPagePath;
    const args = lsxContext.lsxArgs;

    this.props.crowi.apiGet('/plugins/lsx', {fromPagePath, args})
      .then((res) => {
        if (res.ok) {
          this.setState({ html: res.html });
        }
        else {
          return Promise.reject(res.error);
        }
      })
      .catch(error => {
        console.error(error);
        const errorMessage = error.response.data.error.message;
        console.error(errorMessage);
        this.setState({ isError: true, errorMessage: errorMessage });
      })
      // finally
      .then(() => {
        this.setState({ isLoading: false });

        // store to sessionStorage
        const cacheKey = LsxCacheHelper.generateCacheKeyFromContext(lsxContext);
        LsxCacheHelper.cacheState(cacheKey, this.state);
      })
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
    else {
      const innerHtml = this.getInnerHTMLObj();
      return <div dangerouslySetInnerHTML={innerHtml} />
    }
  }
}

Lsx.propTypes = {
  crowi: React.PropTypes.object.isRequired,

  lsxContext: React.PropTypes.instanceOf(LsxContext).isRequired,
  lsxStateCache: React.PropTypes.object,
};
