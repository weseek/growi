import React from 'react';
import PropTypes from 'prop-types';

export default class AbstractEditor extends React.Component {

  constructor(props) {
    super(props);
  }

  forceToFocus() {
  }

  /**
   * set caret position of codemirror
   * @param {string} number
   */
  setCaretLine(line) {
  }

  /**
   * scroll
   * @param {number} line
   */
  setScrollTopByLine(line) {
  }

  /**
   * insert text
   * @param {string} text
   */
  insertText(text) {
  }

  /**
   * dispatch onSave event
   */
  dispatchSave() {
    if (this.props.onSave != null) {
      this.props.onSave();
    }
  }

}

AbstractEditor.propTypes = {
  value: PropTypes.string,
  editorOptions: PropTypes.object,
  onChange: PropTypes.func,
  onScroll: PropTypes.func,
  onScrollCursorIntoView: PropTypes.func,
  onSave: PropTypes.func,
  onPasteFiles: PropTypes.func,
};

