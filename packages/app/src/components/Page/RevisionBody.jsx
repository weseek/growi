import React from 'react';
import PropTypes from 'prop-types';

import { debounce } from 'throttle-debounce';
import { useIsRevisionBodyRendered } from '~/stores/context';

class RevisionBody extends React.PureComponent {

  constructor(props) {
    super(props);

    // create debounced method for rendering MathJax
    this.renderMathJaxWithDebounce = debounce(200, this.renderMathJax);
  }

  componentDidMount() {
    const MathJax = window.MathJax;
    if (MathJax != null && this.props.isMathJaxEnabled && this.props.renderMathJaxOnInit) {
      this.renderMathJaxWithDebounce();
    }
  }

  componentDidUpdate() {
    const MathJax = window.MathJax;
    if (MathJax != null && this.props.isMathJaxEnabled && this.props.renderMathJaxInRealtime) {
      this.renderMathJaxWithDebounce();
    }
    if (this.props.onRevisionBodyRendered && !this.props.isRevisionBodyRendered) {
      this.props.onRevisionBodyRendered();
    }
  }

  componentWillUnmount() {
    if (this.props.onRivisionBodyWillUnmount && this.props.isRevisionBodyRendered) {
      this.props.onRivisionBodyWillUnmount();
    }
  }

  componentWillReceiveProps(nextProps) {
    const MathJax = window.MathJax;
    if (MathJax != null && this.props.isMathJaxEnabled && this.props.renderMathJaxOnInit) {
      this.renderMathJaxWithDebounce();
    }
  }

  renderMathJax() {
    const MathJax = window.MathJax;
    // Workaround MathJax Rendering (Errors still occur, but MathJax can be rendered)
    //
    // Reason:
    //   Addition of draw.io Integration causes initialization conflict between MathJax of draw.io and MathJax of GROWI.
    //   So, before MathJax is initialized, execute renderMathJaxWithDebounce again.
    //   Avoiding initialization of MathJax of draw.io solves the problem.
    //   refs: https://github.com/jgraph/drawio/pull/831
    if (MathJax != null && this.element != null) {
      MathJax.typesetPromise([this.element]);
    }
    else {
      this.renderMathJaxWithDebounce();
    }
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
  onRevisionBodyRendered: PropTypes.func,
  onRivisionBodyWillUnmount: PropTypes.func,
  isRevisionBodyRendered: PropTypes.bool,
};

export default (props) => {
  const { mutate, data: isRevisionBodyRendered } = useIsRevisionBodyRendered();
  const mutateOnComponentDidUpdate = () => {
    mutate(true);
  };
  const mutateOnComponentWillUnmount = () => {
    mutate(false);
  };
  return (
    <RevisionBody
      {...props}
      onRevisionBodyRendered={mutateOnComponentDidUpdate}
      onRivisionBodyWillUnmount={mutateOnComponentWillUnmount}
      isRevisionBodyRendered={isRevisionBodyRendered}
    >
    </RevisionBody>
  );
};
