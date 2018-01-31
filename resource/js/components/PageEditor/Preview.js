import React from 'react';
import PropTypes from 'prop-types';

export default class Preview extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    if (this.props.isMathJaxEnabled) {
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
        className="wiki page-editor-preview-body" dangerouslySetInnerHTML={this.generateInnerHtml(this.props.html)}>
      </div>
    )
  }
}

Preview.propTypes = {
  html: PropTypes.string,
  inputRef: PropTypes.func.isRequired,  // for getting div element
  isMathJaxEnabled: PropTypes.bool,
};
