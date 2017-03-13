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
    this.props.crowi.apiGet('/plugins/lsx', {currentPath: this.props.currentPath, args: this.props.lsxArgs})
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
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
          <span class="lsx-blink">{this.props.tagExpression}</span>
        </div>
      );
    }
    if (this.isError) {
      return (
        <div>
          <i class="fa fa-exclamation-triangle fa-fw"></i>
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
  tagExpression: React.PropTypes.string.isRequired,
  currentPath: React.PropTypes.string.isRequired,
  lsxArgs: React.PropTypes.string.isRequired,
};
