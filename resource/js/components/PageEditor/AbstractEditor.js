import React from 'react';
import PropTypes from 'prop-types';

export default class AbstractEditor extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value,
    };

    this.forceToFocus = this.forceToFocus.bind(this);
    this.setCaretLine = this.setCaretLine.bind(this);
    this.setScrollTopByLine = this.setScrollTopByLine.bind(this);
    this.insertText = this.insertText.bind(this);
    this.dispatchSave = this.dispatchSave.bind(this);
  }

  componentDidMount() {
    // initialize caret line
    this.setCaretLine(0);
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
  }

}

AbstractEditor.propTypes = {
  value: PropTypes.string,
  editorOptions: PropTypes.object,
  onChange: PropTypes.func,
  onScroll: PropTypes.func,
  onScrollCursorIntoView: PropTypes.func,
  onSave: PropTypes.func,
};

