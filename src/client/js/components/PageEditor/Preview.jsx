import React from 'react';
import PropTypes from 'prop-types';

import { Subscribe } from 'unstated';

import RevisionBody from '../Page/RevisionBody';

import EditorContainer from '../../services/EditorContainer';

/**
 * Wrapper component for Page/RevisionBody
 */
export default class Preview extends React.PureComponent {

  render() {
    return (
      <Subscribe to={[EditorContainer]}>
        { editorContainer => (
          // eslint-disable-next-line arrow-body-style
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
              renderMathJaxInRealtime={editorContainer.state.previewOptions.renderMathJaxInRealtime}
            />
          </div>
        )}
      </Subscribe>
    );
  }

}

Preview.propTypes = {
  html: PropTypes.string,
  inputRef: PropTypes.func.isRequired, // for getting div element
  isMathJaxEnabled: PropTypes.bool,
  renderMathJaxOnInit: PropTypes.bool,
  onScroll: PropTypes.func,
};
