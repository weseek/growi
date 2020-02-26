import React from 'react';
import PropTypes from 'prop-types';

import { debounce } from 'throttle-debounce';

export default class RevisionBody extends React.PureComponent {

  constructor(props) {
    super(props);

    // create debounced method for rendering MathJax
    this.renderMathJaxWithDebounce = debounce(200, this.renderMathJax);

    // create debounced method for rendering draw.io
    this.renderDrawioWithDebounce = debounce(200, this.renderDrawio);
  }

  componentDidMount() {
    const MathJax = window.MathJax;
    if (MathJax != null && this.props.isMathJaxEnabled && this.props.renderMathJaxOnInit) {
      this.renderMathJaxWithDebounce();
    }

    const DrawioViewer = window.GraphViewer;
    if (DrawioViewer != null) {
      this.renderDrawioWithDebounce();
    }
  }

  componentDidUpdate() {
    const MathJax = window.MathJax;
    if (MathJax != null && this.props.isMathJaxEnabled && this.props.renderMathJaxInRealtime) {
      this.renderMathJaxWithDebounce();
    }

    const DrawioViewer = window.GraphViewer;
    if (DrawioViewer != null) {
      this.renderDrawioWithDebounce();
    }
  }

  componentWillReceiveProps(nextProps) {
    const MathJax = window.MathJax;
    if (MathJax != null && this.props.isMathJaxEnabled && this.props.renderMathJaxOnInit) {
      this.renderMathJaxWithDebounce();
    }

    const DrawioViewer = window.GraphViewer;
    if (DrawioViewer != null) {
      this.renderDrawioWithDebounce();
    }
  }

  renderMathJax() {
    const MathJax = window.MathJax;
    MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.element]);
  }

  renderDrawio() {
    const DrawioViewer = window.GraphViewer;
    DrawioViewer.processElements();
  }

  generateInnerHtml(html) {
    return { __html: html };
  }

  render() {
    const additionalClassName = this.props.additionalClassName || '';
    return (
      <div
        ref={(elm) => {
          this.element = elm;
          if (this.props.inputRef != null) {
            this.props.inputRef(elm);
          }
        }}
        className={`wiki ${additionalClassName}`}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={this.generateInnerHtml(this.props.html)}
      />
    );
  }

}

RevisionBody.propTypes = {
  html: PropTypes.string,
  inputRef: PropTypes.func, // for getting div element
  isMathJaxEnabled: PropTypes.bool,
  renderMathJaxOnInit: PropTypes.bool,
  renderMathJaxInRealtime: PropTypes.bool,
  additionalClassName: PropTypes.string,
};
