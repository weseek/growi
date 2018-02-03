import React from 'react';
import PropTypes from 'prop-types';

export default class RevisionBody extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (this.props.isMathJaxEnabled && this.props.renderMathJaxOnInit) {
      this.renderMathJax();
    }
  }

  componentDidUpdate() {
    if (this.props.isMathJaxEnabled && this.props.renderMathJaxInRealtime) {
      this.renderMathJax();
    }
  }

  renderMathJax() {
    const MathJax = window.MathJax;
    if (MathJax != null) {
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.element]);
    }
  }

  generateInnerHtml(html) {
    return {__html: html};
  }

  render() {
    return (
      <div
        ref={(elm) => {
          this.element = elm;
          this.props.inputRef(elm);
        }}
        className="wiki" dangerouslySetInnerHTML={this.generateInnerHtml(this.props.html)}>
      </div>
    )
  }
}

RevisionBody.propTypes = {
  html: PropTypes.string,
  inputRef: PropTypes.func.isRequired,  // for getting div element
  isMathJaxEnabled: PropTypes.bool,
  renderMathJaxOnInit: PropTypes.bool,
  renderMathJaxInRealtime: PropTypes.bool,
};
