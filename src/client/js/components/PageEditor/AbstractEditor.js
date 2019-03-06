import React from 'react';
import PropTypes from 'prop-types';

export default class AbstractEditor extends React.Component {
  constructor(props) {
    super(props);

    this.forceToFocus = this.forceToFocus.bind(this);
    this.setCaretLine = this.setCaretLine.bind(this);
    this.setScrollTopByLine = this.setScrollTopByLine.bind(this);

    this.getStrFromBol = this.getStrFromBol.bind(this);
    this.getStrToEol = this.getStrToEol.bind(this);
    this.insertText = this.insertText.bind(this);
    this.insertLinebreak = this.insertLinebreak.bind(this);

    this.dispatchSave = this.dispatchSave.bind(this);
  }

  forceToFocus() {
  }

  /**
   * set new value
   */
  setValue(newValue) {
  }

  /**
   * Enable/Disable GFM mode
   * @param {bool} bool
   */
  setGfmMode(bool) {
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
   * return strings from BOL(beginning of line) to current position
   */
  getStrFromBolToSelectedUpperPos() {
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
   * insert text
   * @param {string} text
   */
  insertText(text) {
  }

  /**
   * insert line break to the current position
   */
  insertLinebreak() {
    this.insertText('\n');
  }

  /**
   * dispatch onSave event
   */
  dispatchSave() {
    if (this.props.onSave != null) {
      this.props.onSave();
    }
  }

  /**
   * dispatch onPasteFiles event
   * @param {object} event
   */
  dispatchPasteFiles(event) {
    if (this.props.onPasteFiles != null) {
      this.props.onPasteFiles(event);
    }
  }

  /**
   * returns items(an array of react elements) in navigation bar for editor
   */
  getNavbarItems() {
    return null;
  }
}

AbstractEditor.propTypes = {
  value: PropTypes.string,
  ifGfmMode: PropTypes.bool,
  editorOptions: PropTypes.object,
  onChange: PropTypes.func,
  onScroll: PropTypes.func,
  onScrollCursorIntoView: PropTypes.func,
  onSave: PropTypes.func,
  onPasteFiles: PropTypes.func,
  onDragEnter: PropTypes.func,
  onCtrlEnter: PropTypes.func,
};
AbstractEditor.defaultProps = {
  isGfmMode: true,
};
