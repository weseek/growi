import React from 'react';

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
    if (this.props.lsxCache) {
      this.setState({
        isLoading: false,
        html: this.props.lsxCache.html,
        isError: this.props.lsxCache.isError,
        errorMessage: this.props.lsxCache.errorMessage,
      });
      return;
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
        this.setState({ isError: true, errorMessage: error });
      })
      // finally
      .then(() => {
        this.setState({ isLoading: false });
      })
  }

  getInnerHTMLObj() {
    return { __html: this.state.html };
  }

  render() {
    const lsxContext = this.props.lsxContext;

    if (this.state.isLoading) {
      return (
        <div>
          <i className="fa fa-spinner fa-pulse fa-fw"></i>
          <span className="lsx-blink">{lsxContext.tagExpression}</span>
        </div>
      );
    }
    if (this.state.isError) {
      return (
        <div>
          <i className="fa fa-exclamation-triangle fa-fw"></i>
          {lsxContext.tagExpression} (-> <small>{this.state.message})</small>
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
  lsxCache: React.PropTypes.instanceOf(LsxCache),
};
