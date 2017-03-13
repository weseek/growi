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
    const fromPagePath = this.props.fromPagePath;
    const args = this.props.lsxArgs;

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
    if (this.state.isLoading) {
      return (
        <div>
          <i className="fa fa-spinner fa-pulse fa-fw"></i>
          <span className="lsx-blink">{this.props.tagExpression}</span>
        </div>
      );
    }
    if (this.isError) {
      return (
        <div>
          <i className="fa fa-exclamation-triangle fa-fw"></i>
          {this.props.tagExpression} (-> <small>{this.state.message})</small>
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
  currentPagePath: React.PropTypes.string,
  tagExpression: React.PropTypes.string.isRequired,
  fromPagePath: React.PropTypes.string.isRequired,
  lsxArgs: React.PropTypes.string.isRequired,
};
