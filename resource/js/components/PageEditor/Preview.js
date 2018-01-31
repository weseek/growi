import React from 'react';
import PropTypes from 'prop-types';
import { PreviewOptions } from './OptionsSelector';

export default class Preview extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (this.props.isMathJaxEnabled && this.props.renderMathJaxOnInit) {
      this.renderMathJax();
    }
  }

  componentDidUpdate() {
    const opts = this.props.previewOptions;
    if (this.props.isMathJaxEnabled && opts != null && opts.renderMathJaxInRealtime) {
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
  renderMathJaxOnInit: PropTypes.bool,
  previewOptions: PropTypes.instanceOf(PreviewOptions),
};
