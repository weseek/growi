import React from 'react';
import PropTypes from 'prop-types';

export default class RevisionBody extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const MathJax = window.MathJax;
    if (MathJax != null && this.props.isMathJaxEnabled && this.props.renderMathJaxOnInit) {
      const intervalId = setInterval(() => {
        if (MathJax.isReady) {
          this.renderMathJax();
          clearInterval(intervalId);
        }
      }, 100);
    }
  }

  componentDidUpdate() {
    const MathJax = window.MathJax;
    if (MathJax != null && this.props.isMathJaxEnabled && this.props.renderMathJaxInRealtime) {
      this.renderMathJax();
    }
  }

  componentWillReceiveProps(nextProps) {
    const MathJax = window.MathJax;
    if (MathJax != null && this.props.isMathJaxEnabled && this.props.renderMathJaxOnInit) {
      this.renderMathJax();
    }
  }

  renderMathJax() {
    const MathJax = window.MathJax;
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.element]);
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
        className="wiki" dangerouslySetInnerHTML={this.generateInnerHtml(this.props.html)}>
      </div>
    )
  }
}

RevisionBody.propTypes = {
  html: PropTypes.string,
  inputRef: PropTypes.func,  // for getting div element
  isMathJaxEnabled: PropTypes.bool,
  renderMathJaxOnInit: PropTypes.bool,
  renderMathJaxInRealtime: PropTypes.bool,
};
