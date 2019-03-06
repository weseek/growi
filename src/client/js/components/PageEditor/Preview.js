import React from 'react';
import PropTypes from 'prop-types';

import RevisionBody from '../Page/RevisionBody';

import { PreviewOptions } from './OptionsSelector';

/**
 * Wrapper component for Page/RevisionBody
 */
export default class Preview extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const renderMathJaxInRealtime = this.props.previewOptions.renderMathJaxInRealtime;

    return (
      <div
        className="page-editor-preview-body"
        ref={(elm) => {
            this.previewElement = elm;
            this.props.inputRef(elm);
          }}
        onScroll={(event) => {
            if (this.props.onScroll != null) {
              this.props.onScroll(event.target.scrollTop);
            }
          }}
      >

        <RevisionBody
          {...this.props}
          renderMathJaxInRealtime={renderMathJaxInRealtime}
        />
      </div>
    );
  }
}

Preview.propTypes = {
  html: PropTypes.string,
  inputRef: PropTypes.func.isRequired, // for getting div element
  isMathJaxEnabled: PropTypes.bool,
  renderMathJaxOnInit: PropTypes.bool,
  previewOptions: PropTypes.instanceOf(PreviewOptions),
  onScroll: PropTypes.func,
};
