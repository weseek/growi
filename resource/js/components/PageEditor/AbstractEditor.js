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
   * return strings from BOL(beginning of line) to current position
   */
  getStrFromBol() {
    throw new Error('this method should be impelemented in subclass');
  }

  /**
   * return strings from current position to EOL(end of line)
   */
  getStrToEol() {
    throw new Error('this method should be impelemented in subclass');
  }

  /**
   * replace Beggining Of Line to current position with param 'text'
   * @param {string} text
   */
  replaceBolToCurrentPos(text) {
    throw new Error('this method should be impelemented in subclass');
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

