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

    this.pasteHandler = this.pasteHandler.bind(this);
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

    this.textarea.addEventListener('paste', (e) => {
      this.logger.info('paste');
      this.pasteHandler(e);
    });
    this.textarea.addEventListener('dragenter', (e) => {
      this.logger.info('dragenter');
      this.dispatchDragEnter(e);
    });
  }

  /**
   * @inheritDoc
   */
  forceToFocus() {
  }

  /**
   * @inheritDoc
   */
  setCaretLine(line) {
    if (isNaN(line)) {
      return;
    }

  }

  /**
   * @inheritDoc
   */
  setScrollTopByLine(line) {
    if (isNaN(line)) {
      return;
    }

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

