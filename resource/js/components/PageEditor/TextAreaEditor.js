import React from 'react';
import PropTypes from 'prop-types';

import FormControl from 'react-bootstrap/es/FormControl';

import AbstractEditor from './AbstractEditor';

import pasteHelper from './PasteHelper';

import InterceptorManager from '../../../../lib/util/interceptor-manager';

import MarkdownListInterceptor from './MarkdownListInterceptor';

export default class TextAreaEditor extends AbstractEditor {

  constructor(props) {
    super(props);
    this.logger = require('@alias/logger')('growi:PageEditor:TextAreaEditor');

    this.state = {
      value: this.props.value,
    };

    this.init();

    this.handleEnterKey = this.handleEnterKey.bind(this);

    this.keyPressHandler = this.keyPressHandler.bind(this);
    this.pasteHandler = this.pasteHandler.bind(this);
    this.dragEnterHandler = this.dragEnterHandler.bind(this);
  }

  init() {
    this.interceptorManager = new InterceptorManager();
    this.interceptorManager.addInterceptors([
      new MarkdownListInterceptor(),
    ]);
  }

  componentDidMount() {
    // initialize caret line
    this.setCaretLine(0);

    // set event handlers
    this.textarea.addEventListener('keypress', this.keyPressHandler);
    this.textarea.addEventListener('paste', this.pasteHandler);
    this.textarea.addEventListener('dragenter', this.dragEnterHandler);
  }

  /**
   * @inheritDoc
   */
  forceToFocus() {
    setTimeout(() => {
      this.textarea.focus();
    }, 150);
  }

  /**
   * @inheritDoc
   */
  setCaretLine(line) {
    if (isNaN(line)) {
      return;
    }

    // scroll to bottom
    this.textarea.scrollTop = this.textarea.scrollHeight;

    const lines = this.textarea.value.split('\n').slice(0, line+1);
    const pos = lines
        .map(lineStr => lineStr.length + 1) // correct length+1 of each lines
        .reduce((a, x) => a += x, 0)        // sum
        - 1;                                // -1

    this.textarea.setSelectionRange(pos, pos);
  }

  /**
   * @inheritDoc
   */
  setScrollTopByLine(line) {
    // do nothing
  }

  /**
   * @inheritDoc
   */
  insertText(text) {
  }

  /**
   * @inheritDoc
   */
  getStrFromBol() {
  }

  /**
   * @inheritDoc
   */
  getStrToEol() {
  }

  /**
   * @inheritDoc
   */
  replaceBolToCurrentPos(text) {
  }

  /**
   * keypress event handler
   * @param {string} event
   */
  keyPressHandler(event) {
    const key = event.key.toLowerCase();
    if (key === 'enter') {
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      this.handleEnterKey();
    }
  }

  /**
   * handle ENTER key
   */
  handleEnterKey() {
    var context = {
      handlers: [],  // list of handlers which process enter key
      editor: this,
    };

    const interceptorManager = this.interceptorManager;
    interceptorManager.process('preHandleEnter', context)
      .then(() => {
        if (context.handlers.length == 0) {
          // TODO impl
          // codemirror.commands.newlineAndIndentContinueMarkdownList(this.getCodeMirror());
        }
      });
  }

  /**
   * paste event handler
   * @param {any} event
   */
  pasteHandler(event) {
    const types = event.clipboardData.types;

    // text
    if (types.includes('text/plain')) {
      pasteHelper.pasteText(this, event);
    }
    // files
    else if (types.includes('Files')) {
      this.dispatchPasteFiles(event);
    }
  }

  dragEnterHandler(event) {
    this.dispatchDragEnter(event);
  }

  dispatchDragEnter(event) {
    if (this.props.onDragEnter != null) {
      this.props.onDragEnter(event);
    }
  }

  render() {
    return <React.Fragment>
      <FormControl
        componentClass="textarea" className="textarea-editor"
        inputRef={ref => { this.textarea = ref }}
        defaultValue={this.state.value}
        onChange={(e) => {
          if (this.props.onChange != null) {
            this.props.onChange(e.target.value);
          }
        }} />
    </React.Fragment>;
  }

}

TextAreaEditor.propTypes = Object.assign({
}, AbstractEditor.propTypes);

