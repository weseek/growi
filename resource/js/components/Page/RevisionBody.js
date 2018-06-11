import React from 'react';
import PropTypes from 'prop-types';

import { debounce } from 'throttle-debounce';

export default class RevisionBody extends React.Component {

  constructor(props) {
    super(props);

    // create debounced method for rendering MathJax
    this.renderMathJaxWithDebounce = debounce(200, this.renderMathJax);
    this.renderMermaidWithDebounce = debounce(300, this.renderMermaid);
  }

  componentDidMount() {
    const MathJax = window.MathJax;
    const Mermaid = window.Mermaid;
    if (MathJax != null && this.props.isMathJaxEnabled && this.props.renderMathJaxOnInit) {
      this.renderMathJaxWithDebounce();
    }
    if (Mermaid != null && this.props.isMermaidEnabled && this.props.renderMermaidOnInit) {
      this.renderMermaidWithDebounce();
    }
  }

  componentDidUpdate() {
    const MathJax = window.MathJax;
    const Mermaid = window.Mermaid;
    if (MathJax != null && this.props.isMathJaxEnabled && this.props.renderMathJaxInRealtime) {
      this.renderMathJaxWithDebounce();
    }
    if (Mermaid != null && this.props.isMermaidEnabled && this.props.renderMermaidInRealtime) {
      this.renderMermaidWithDebounce();
    }
  }

  componentWillReceiveProps(nextProps) {
    const MathJax = window.MathJax;
    const Mermaid = window.Mermaid;
    if (MathJax != null && this.props.isMathJaxEnabled && this.props.renderMathJaxOnInit) {
      this.renderMathJaxWithDebounce();
    }
    if (Mermaid != null && this.props.isMermaidEnabled && this.props.renderMermaidOnInit) {
      this.renderMermaidWithDebounce();
    }
  }

  renderMathJax() {
    const MathJax = window.MathJax;
    MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.element]);
  }

  renderMermaid() {
    const Mermaid = window.Mermaid;
    //MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.element]);
  }

  generateInnerHtml(html) {
    return {__html: html};
  }

  render() {
    return (
      <div
        ref={(elm) => {
          this.element = elm;
          if (this.props.inputRef != null) {
            this.props.inputRef(elm);
          }
        }}
        className={'wiki ' + this.props.additionalClassName} dangerouslySetInnerHTML={this.generateInnerHtml(this.props.html)}>
      </div>
    );
  }
}

RevisionBody.propTypes = {
  html: PropTypes.string,
  inputRef: PropTypes.func,  // for getting div element
  isMathJaxEnabled: PropTypes.bool,
  renderMathJaxOnInit: PropTypes.bool,
  renderMathJaxInRealtime: PropTypes.bool,
  isMermaidEnabled: PropTypes.bool,
  renderMermaidOnInit: PropTypes.bool,
  renderMermaidInRealtime: PropTypes.bool,
  additionalClassName: PropTypes.string,
};
