import React from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/es/Button';
import urljoin from 'url-join';
import * as codemirror from 'codemirror';

import { UnControlled as ReactCodeMirror } from 'react-codemirror2';

import InterceptorManager from '@commons/service/interceptor-manager';

import AbstractEditor from './AbstractEditor';
import SimpleCheatsheet from './SimpleCheatsheet';

import pasteHelper from './PasteHelper';
import EmojiAutoCompleteHelper from './EmojiAutoCompleteHelper';
import PreventMarkdownListInterceptor from './PreventMarkdownListInterceptor';
import MarkdownTableInterceptor from './MarkdownTableInterceptor';
import mtu from './MarkdownTableUtil';
import HandsontableModal from './HandsontableModal';

const loadScript = require('simple-load-script');
const loadCssSync = require('load-css-file');
// set save handler
codemirror.commands.save = (instance) => {
  if (instance.codeMirrorEditor != null) {
    instance.codeMirrorEditor.dispatchSave();
  }
};
// set CodeMirror instance as 'CodeMirror' so that CDN addons can reference
window.CodeMirror = require('codemirror');
require('codemirror/addon/display/placeholder');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/edit/matchtags');
require('codemirror/addon/edit/closetag');
require('codemirror/addon/edit/continuelist');
require('codemirror/addon/hint/show-hint');
require('codemirror/addon/hint/show-hint.css');
require('codemirror/addon/search/searchcursor');
require('codemirror/addon/search/match-highlighter');
require('codemirror/addon/selection/active-line');
require('codemirror/addon/scroll/annotatescrollbar');
require('codemirror/addon/fold/foldcode');
require('codemirror/addon/fold/foldgutter');
require('codemirror/addon/fold/foldgutter.css');
require('codemirror/addon/fold/markdown-fold');
require('codemirror/addon/fold/brace-fold');
require('codemirror/addon/display/placeholder');
require('codemirror/mode/gfm/gfm');
require('../../util/codemirror/autorefresh.ext');


const MARKDOWN_TABLE_ACTIVATED_CLASS = 'markdown-table-activated';

export default class CodeMirrorEditor extends AbstractEditor {

  constructor(props) {
    super(props);
    this.logger = require('@alias/logger')('growi:PageEditor:CodeMirrorEditor');

    this.state = {
      value: this.props.value,
      isGfmMode: this.props.isGfmMode,
      isEnabledEmojiAutoComplete: false,
      isLoadingKeymap: false,
      isSimpleCheatsheetShown: this.props.isGfmMode && this.props.value.length === 0,
      isCheatsheetModalShown: false,
      additionalClassSet: new Set(),
    };

    this.init();

    this.getCodeMirror = this.getCodeMirror.bind(this);

    this.getBol = this.getBol.bind(this);
    this.getEol = this.getEol.bind(this);

    this.loadTheme = this.loadTheme.bind(this);
    this.loadKeymapMode = this.loadKeymapMode.bind(this);
    this.setKeymapMode = this.setKeymapMode.bind(this);
    this.handleEnterKey = this.handleEnterKey.bind(this);
    this.handleCtrlEnterKey = this.handleCtrlEnterKey.bind(this);

    this.scrollCursorIntoViewHandler = this.scrollCursorIntoViewHandler.bind(this);
    this.pasteHandler = this.pasteHandler.bind(this);
    this.cursorHandler = this.cursorHandler.bind(this);
    this.changeHandler = this.changeHandler.bind(this);

    this.updateCheatsheetStates = this.updateCheatsheetStates.bind(this);

    this.renderLoadingKeymapOverlay = this.renderLoadingKeymapOverlay.bind(this);
    this.renderCheatsheetModalButton = this.renderCheatsheetModalButton.bind(this);

    this.makeHeaderHandler = this.makeHeaderHandler.bind(this);
    this.showHandsonTableHandler = this.showHandsonTableHandler.bind(this);
  }

  init() {
    this.cmCdnRoot = 'https://cdn.jsdelivr.net/npm/codemirror@5.42.0';
    this.cmNoCdnScriptRoot = '/js/cdn';
    this.cmNoCdnStyleRoot = '/styles/cdn';

    this.interceptorManager = new InterceptorManager();
    this.interceptorManager.addInterceptors([
      new PreventMarkdownListInterceptor(),
      new MarkdownTableInterceptor(),
    ]);

    this.loadedThemeSet = new Set(['eclipse', 'elegant']); // themes imported in _vendor.scss
    this.loadedKeymapSet = new Set();
  }

  componentWillMount() {
    if (this.props.emojiStrategy != null) {
      this.emojiAutoCompleteHelper = new EmojiAutoCompleteHelper(this.props.emojiStrategy);
      this.setState({ isEnabledEmojiAutoComplete: true });
    }
  }

  componentDidMount() {
    // ensure to be able to resolve 'this' to use 'codemirror.commands.save'
    this.getCodeMirror().codeMirrorEditor = this;

    // load theme
    const theme = this.props.editorOptions.theme;
    this.loadTheme(theme);

    // set keymap
    const keymapMode = this.props.editorOptions.keymapMode;
    this.setKeymapMode(keymapMode);
  }

  componentWillReceiveProps(nextProps) {
    // load theme
    const theme = nextProps.editorOptions.theme;
    this.loadTheme(theme);

    // set keymap
    const keymapMode = nextProps.editorOptions.keymapMode;
    this.setKeymapMode(keymapMode);
  }

  getCodeMirror() {
    return this.cm.editor;
  }

  /**
   * @inheritDoc
   */
  forceToFocus() {
    const editor = this.getCodeMirror();
    // use setInterval with reluctance -- 2018.01.11 Yuki Takei
    const intervalId = setInterval(() => {
      this.getCodeMirror().focus();
      if (editor.hasFocus()) {
        clearInterval(intervalId);
        // refresh
        editor.refresh();
      }
    }, 100);
  }

  /**
   * @inheritDoc
   */
  setValue(newValue) {
    this.setState({ value: newValue });
    this.getCodeMirror().getDoc().setValue(newValue);
  }

  /**
   * @inheritDoc
   */
  setGfmMode(bool) {
    // update state
    this.setState({
      isGfmMode: bool,
      isEnabledEmojiAutoComplete: bool,
    });

    this.updateCheatsheetStates(bool, null);

    // update CodeMirror option
    const mode = bool ? 'gfm' : undefined;
    this.getCodeMirror().setOption('mode', mode);
  }

  /**
   * @inheritDoc
   */
  setCaretLine(line) {
    if (Number.isNaN(line)) {
      return;
    }

    const editor = this.getCodeMirror();
    const linePosition = Math.max(0, line);

    editor.setCursor({ line: linePosition }); // leave 'ch' field as null/undefined to indicate the end of line
    this.setScrollTopByLine(linePosition);
  }

  /**
   * @inheritDoc
   */
  setScrollTopByLine(line) {
    if (Number.isNaN(line)) {
      return;
    }

    const editor = this.getCodeMirror();
    // get top position of the line
    const top = editor.charCoords({ line, ch: 0 }, 'local').top;
    editor.scrollTo(null, top);
  }

  /**
   * @inheritDoc
   */
  getStrFromBol() {
    const editor = this.getCodeMirror();
    const curPos = editor.getCursor();
    return editor.getDoc().getRange(this.getBol(), curPos);
  }

  /**
   * @inheritDoc
   */
  getStrToEol() {
    const editor = this.getCodeMirror();
    const curPos = editor.getCursor();
    return editor.getDoc().getRange(curPos, this.getEol());
  }

  /**
   * @inheritDoc
   */
  getStrFromBolToSelectedUpperPos() {
    const editor = this.getCodeMirror();
    const pos = this.selectUpperPos(editor.getCursor('from'), editor.getCursor('to'));
    return editor.getDoc().getRange(this.getBol(), pos);
  }

  /**
   * @inheritDoc
   */
  replaceBolToCurrentPos(text) {
    const editor = this.getCodeMirror();
    const pos = this.selectLowerPos(editor.getCursor('from'), editor.getCursor('to'));
    editor.getDoc().replaceRange(text, this.getBol(), pos);
  }

  /**
   * @inheritDoc
   */
  replaceLine(text) {
    const editor = this.getCodeMirror();
    editor.getDoc().replaceRange(text, this.getBol(), this.getEol());
  }

  /**
   * @inheritDoc
   */
  insertText(text) {
    const editor = this.getCodeMirror();
    editor.getDoc().replaceSelection(text);
  }

  /**
   * return the postion of the BOL(beginning of line)
   */
  getBol() {
    const editor = this.getCodeMirror();
    const curPos = editor.getCursor();
    return { line: curPos.line, ch: 0 };
  }

  /**
   * return the postion of the EOL(end of line)
   */
  getEol() {
    const editor = this.getCodeMirror();
    const curPos = editor.getCursor();
    const lineLength = editor.getDoc().getLine(curPos.line).length;
    return { line: curPos.line, ch: lineLength };
  }

  /**
   * select the upper position of pos1 and pos2
   * @param {{line: number, ch: number}} pos1
   * @param {{line: number, ch: number}} pos2
   */
  selectUpperPos(pos1, pos2) {
    // if both is in same line
    if (pos1.line === pos2.line) {
      return (pos1.ch < pos2.ch) ? pos1 : pos2;
    }
    return (pos1.line < pos2.line) ? pos1 : pos2;
  }

  /**
   * select the lower position of pos1 and pos2
   * @param {{line: number, ch: number}} pos1
   * @param {{line: number, ch: number}} pos2
   */
  selectLowerPos(pos1, pos2) {
    // if both is in same line
    if (pos1.line === pos2.line) {
      return (pos1.ch < pos2.ch) ? pos2 : pos1;
    }
    return (pos1.line < pos2.line) ? pos2 : pos1;
  }

  loadCss(source) {
    return new Promise((resolve) => {
      loadCssSync(source);
      resolve();
    });
  }

  /**
   * load Theme
   * @see https://codemirror.net/doc/manual.html#config
   *
   * @param {string} theme
   */
  loadTheme(theme) {
    if (!this.loadedThemeSet.has(theme)) {
      const url = this.props.noCdn
        ? urljoin(this.cmNoCdnStyleRoot, `codemirror-theme-${theme}.css`)
        : urljoin(this.cmCdnRoot, `theme/${theme}.min.css`);

      this.loadCss(url);

      // update Set
      this.loadedThemeSet.add(theme);
    }
  }

  /**
   * load assets for Key Maps
   * @param {*} keymapMode 'default' or 'vim' or 'emacs' or 'sublime'
   */
  loadKeymapMode(keymapMode) {
    const loadCss = this.loadCss;
    const scriptList = [];
    const cssList = [];

    // add dependencies
    if (this.loadedKeymapSet.size === 0) {
      const dialogScriptUrl = this.props.noCdn
        ? urljoin(this.cmNoCdnScriptRoot, 'codemirror-dialog.js')
        : urljoin(this.cmCdnRoot, 'addon/dialog/dialog.min.js');
      const dialogStyleUrl = this.props.noCdn
        ? urljoin(this.cmNoCdnStyleRoot, 'codemirror-dialog.css')
        : urljoin(this.cmCdnRoot, 'addon/dialog/dialog.min.css');

      scriptList.push(loadScript(dialogScriptUrl));
      cssList.push(loadCss(dialogStyleUrl));
    }
    // load keymap
    if (!this.loadedKeymapSet.has(keymapMode)) {
      const keymapScriptUrl = this.props.noCdn
        ? urljoin(this.cmNoCdnScriptRoot, `codemirror-keymap-${keymapMode}.js`)
        : urljoin(this.cmCdnRoot, `keymap/${keymapMode}.min.js`);
      scriptList.push(loadScript(keymapScriptUrl));
      // update Set
      this.loadedKeymapSet.add(keymapMode);
    }

    // set loading state
    this.setState({ isLoadingKeymap: true });

    return Promise.all(scriptList.concat(cssList))
      .then(() => {
        this.setState({ isLoadingKeymap: false });
      });
  }

  /**
   * set Key Maps
   * @see https://codemirror.net/doc/manual.html#keymaps
   *
   * @param {string} keymapMode 'default' or 'vim' or 'emacs' or 'sublime'
   */
  setKeymapMode(keymapMode) {
    if (!keymapMode.match(/^(vim|emacs|sublime)$/)) {
      // reset
      this.getCodeMirror().setOption('keyMap', 'default');
      return;
    }

    this.loadKeymapMode(keymapMode)
      .then(() => {
        let errorCount = 0;
        const timer = setInterval(() => {
          if (errorCount > 10) { // cancel over 3000ms
            this.logger.error(`Timeout to load keyMap '${keymapMode}'`);
            clearInterval(timer);
          }

          try {
            this.getCodeMirror().setOption('keyMap', keymapMode);
            clearInterval(timer);
          }
          catch (e) {
            this.logger.info(`keyMap '${keymapMode}' has not been initialized. retry..`);

            // continue if error occured
            errorCount++;
          }
        }, 300);
      });
  }

  /**
   * handle ENTER key
   */
  handleEnterKey() {
    if (!this.state.isGfmMode) {
      codemirror.commands.newlineAndIndent(this.getCodeMirror());
      return;
    }

    const context = {
      handlers: [], // list of handlers which process enter key
      editor: this,
    };

    const interceptorManager = this.interceptorManager;
    interceptorManager.process('preHandleEnter', context)
      .then(() => {
        if (context.handlers.length === 0) {
          codemirror.commands.newlineAndIndentContinueMarkdownList(this.getCodeMirror());
        }
      });
  }

  /**
   * handle Ctrl+ENTER key
   */
  handleCtrlEnterKey() {
    if (this.props.onCtrlEnter != null) {
      this.props.onCtrlEnter();
    }
  }

  scrollCursorIntoViewHandler(editor, event) {
    if (this.props.onScrollCursorIntoView != null) {
      const line = editor.getCursor().line;
      this.props.onScrollCursorIntoView(line);
    }
  }

  cursorHandler(editor, event) {
    const { additionalClassSet } = this.state;
    const hasCustomClass = additionalClassSet.has(MARKDOWN_TABLE_ACTIVATED_CLASS);

    const isInTable = mtu.isInTable(editor);

    if (!hasCustomClass && isInTable) {
      additionalClassSet.add(MARKDOWN_TABLE_ACTIVATED_CLASS);
      this.setState({ additionalClassSet });
    }

    if (hasCustomClass && !isInTable) {
      additionalClassSet.delete(MARKDOWN_TABLE_ACTIVATED_CLASS);
      this.setState({ additionalClassSet });
    }
  }

  changeHandler(editor, data, value) {
    if (this.props.onChange != null) {
      this.props.onChange(value);
    }

    this.updateCheatsheetStates(null, value);

    // Emoji AutoComplete
    if (this.state.isEnabledEmojiAutoComplete) {
      this.emojiAutoCompleteHelper.showHint(editor);
    }
  }

  /**
   * CodeMirror paste event handler
   * see: https://codemirror.net/doc/manual.html#events
   * @param {any} editor An editor instance of CodeMirror
   * @param {any} event
   */
  pasteHandler(editor, event) {
    const types = event.clipboardData.types;

    // files
    if (types.includes('Files')) {
      event.preventDefault();
      this.dispatchPasteFiles(event);
    }
    // text
    else if (types.includes('text/plain')) {
      pasteHelper.pasteText(this, event);
    }

  }

  /**
   * update states which related to cheatsheet
   * @param {boolean} isGfmModeTmp (use state.isGfmMode if null is set)
   * @param {string} valueTmp (get value from codemirror if null is set)
   */
  updateCheatsheetStates(isGfmModeTmp, valueTmp) {
    const isGfmMode = isGfmModeTmp || this.state.isGfmMode;
    const value = valueTmp || this.getCodeMirror().getDoc().getValue();

    // update isSimpleCheatsheetShown
    const isSimpleCheatsheetShown = isGfmMode && value.length === 0;
    this.setState({ isSimpleCheatsheetShown });
  }

  markdownHelpButtonClickedHandler() {
    if (this.props.onMarkdownHelpButtonClicked != null) {
      this.props.onMarkdownHelpButtonClicked();
    }
  }

  renderLoadingKeymapOverlay() {
    // centering
    const style = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    };

    return this.state.isLoadingKeymap
      ? (
        <div className="overlay overlay-loading-keymap">
          <span style={style} className="overlay-content">
            <div className="speeding-wheel d-inline-block"></div> Loading Keymap ...
          </span>
        </div>
      )
      : '';
  }

  renderCheatsheetModalButton() {
    return (
      <button type="button" className="btn-link gfm-cheatsheet-modal-link text-muted small p-0" onClick={() => { this.markdownHelpButtonClickedHandler() }}>
        <i className="icon-question" /> Markdown
      </button>
    );
  }

  renderCheatsheetOverlay() {
    const cheatsheetModalButton = this.renderCheatsheetModalButton();

    return (
      <div className="overlay overlay-gfm-cheatsheet mt-1 p-3">
        { this.state.isSimpleCheatsheetShown
          ? (
            <div className="text-right">
              {cheatsheetModalButton}
              <div className="mt-2">
                <SimpleCheatsheet />
              </div>
            </div>
          )
          : (
            <div className="mr-4">
              {cheatsheetModalButton}
            </div>
          )
        }
      </div>
    );
  }

  /**
   * return a function to replace a selected range with prefix + selection + suffix
   *
   * The cursor after replacing is inserted between the selection and the suffix.
   */
  createReplaceSelectionHandler(prefix, suffix) {
    return () => {
      const cm = this.getCodeMirror();
      const selection = cm.getDoc().getSelection();
      const curStartPos = cm.getCursor('from');
      const curEndPos = cm.getCursor('to');

      const curPosAfterReplacing = {};
      curPosAfterReplacing.line = curEndPos.line;
      if (curStartPos.line === curEndPos.line) {
        curPosAfterReplacing.ch = curEndPos.ch + prefix.length;
      }
      else {
        curPosAfterReplacing.ch = curEndPos.ch;
      }

      cm.getDoc().replaceSelection(prefix + selection + suffix);
      cm.setCursor(curPosAfterReplacing);
      cm.focus();
    };
  }

  /**
   * return a function to add prefix to selected each lines
   *
   * The cursor after editing is inserted between the end of the selection.
   */
  createAddPrefixToEachLinesHandler(prefix) {
    return () => {
      const cm = this.getCodeMirror();
      const startLineNum = cm.getCursor('from').line;
      const endLineNum = cm.getCursor('to').line;

      const lines = [];
      for (let i = startLineNum; i <= endLineNum; i++) {
        lines.push(prefix + cm.getDoc().getLine(i));
      }
      const replacement = `${lines.join('\n')}\n`;
      cm.getDoc().replaceRange(replacement, { line: startLineNum, ch: 0 }, { line: endLineNum + 1, ch: 0 });

      cm.setCursor(endLineNum, cm.getDoc().getLine(endLineNum).length);
      cm.focus();
    };
  }

  /**
   * make a selected line a header
   *
   * The cursor after editing is inserted between the end of the line.
   */
  makeHeaderHandler() {
    const cm = this.getCodeMirror();
    const lineNum = cm.getCursor('from').line;
    const line = cm.getDoc().getLine(lineNum);
    let prefix = '#';
    if (!line.startsWith('#')) {
      prefix += ' ';
    }
    cm.getDoc().replaceRange(prefix, { line: lineNum, ch: 0 }, { line: lineNum, ch: 0 });
    cm.focus();
  }

  showHandsonTableHandler() {
    this.handsontableModal.show(mtu.getMarkdownTable(this.getCodeMirror()));
  }

  getNavbarItems() {
    return [
      /* eslint-disable max-len */
      <Button
        key="nav-item-bold"
        bsSize="small"
        title="Bold"
        onClick={this.createReplaceSelectionHandler('**', '**')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="13" viewBox="0 0 10.9 14">
          <path d="M0 0h5.6c3 0 4.7 1.1 4.7 3.4a3.1 3.1 0 0 1-2.5 3.1 3.7 3.7 0 0 1 3.1 3.5c0 2.9-1.4 4-4.2 4H0zm5.2 6.5c2.7 0 2.6-1.4 2.6-3.1S7.9.7 5.6.7H2.3v5.8zm-2.9 6.6h3.4c2.1 0 2.7-1.1 2.7-3.1s0-2.8-3.2-2.8H2.3z" />
        </svg>
      </Button>,
      <Button
        key="nav-item-italic"
        bsSize="small"
        title="Italic"
        onClick={this.createReplaceSelectionHandler('*', '*')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="13" viewBox="0 0 8.6 13.9">
          <path d="M8.1 0a.6.6 0 0 1 .5.6c0 .3-.2.6-.7.6H6.2L3.8 12.8h1.8c.2 0 .4.3.4.5a.7.7 0 0 1-.7.6H.5c-.3 0-.5-.4-.5-.6s.4-.6.7-.6h1.7L4.9 1.2H3.1a.5.5 0 0 1-.5-.5c0-.3.1-.7.8-.7z" />
        </svg>
      </Button>,
      <Button
        key="nav-item-strikethrough"
        bsSize="small"
        title="Strikethrough"
        onClick={this.createReplaceSelectionHandler('~~', '~~')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="13" viewBox="0 0 19.5 14">
          <path d="M5.8 6.2H9C7.2 5.7 6.3 5 6.3 3.8a2.2 2.2 0 0 1 .9-1.9 4.3 4.3 0 0 1 2.5-.7 4.3 4.3 0 0 1 2.5.7 3.1 3.1 0 0 1 1.1 1.6.7.7 0 0 0 .6.4h.3a.7.7 0 0 0 .4-.8A3.6 3.6 0 0 0 13.1 1a6.7 6.7 0 0 0-6-.5 3.1 3.1 0 0 0-1.7 1.3 3.6 3.6 0 0 0-.6 2 2.9 2.9 0 0 0 1 2.3zm7 2.5a2 2 0 0 1 .6 1.4 2.4 2.4 0 0 1-1 1.9 3.7 3.7 0 0 1-2.5.7 4.6 4.6 0 0 1-3-.8 3.7 3.7 0 0 1-1.2-2 .6.6 0 0 0-.6-.5h-.2a.7.7 0 0 0-.5.8 4.1 4.1 0 0 0 1.5 2.5A6 6 0 0 0 9.8 14a7.5 7.5 0 0 0 2.6-.5 4.9 4.9 0 0 0 1.8-1.4 4.3 4.3 0 0 0 .6-2.2 5 5 0 0 0-.2-1.2zM.4 7.9a.7.7 0 0 1-.4-.5.4.4 0 0 1 .4-.4h18.8a.4.4 0 0 1 .3.6c0 .1-.1.2-.2.3z" />
        </svg>
      </Button>,
      <Button
        key="nav-item-header"
        bsSize="small"
        title="Heading"
        onClick={this.makeHeaderHandler}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="13" viewBox="0 0 13.7 14">
          <path d="M10.2 0h2.9a.6.6 0 0 1 .6.6.6.6 0 0 1-.6.6h-.8v11.6h.8a.6.6 0 0 1 .6.6.6.6 0 0 1-.6.6h-2.9a.6.6 0 0 1-.6-.6.6.6 0 0 1 .6-.6h.8V7.2H2.7v5.6h.8a.6.6 0 0 1 .6.6.6.6 0 0 1-.6.6H.6a.6.6 0 0 1-.6-.6.6.6 0 0 1 .6-.6h.7V1.2H.6A.6.6 0 0 1 0 .6.6.6 0 0 1 .6 0h2.9a.6.6 0 0 1 .6.6.6.6 0 0 1-.6.6h-.8v4.9H11V1.2h-.8a.6.6 0 0 1-.6-.6.6.6 0 0 1 .6-.6z" />
        </svg>
      </Button>,
      <Button
        key="nav-item-code"
        bsSize="small"
        title="Inline Code"
        onClick={this.createReplaceSelectionHandler('`', '`')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="13" viewBox="0 0 18.1 14">
          <path d="M17.8 7.9l-4 3.8a.5.5 0 0 1-.8 0 .5.5 0 0 1 0-.8L16.8 7 13 3.2a.6.6 0 0 1 0-.9.5.5 0 0 1 .8 0l4 3.8a1.3 1.3 0 0 1 0 1.8zM5.2 2.3a.7.7 0 0 1 0 .9L1.3 7l3.9 3.9a.6.6 0 0 1 0 .8.6.6 0 0 1-.9 0L.4 7.9a1.3 1.3 0 0 1 0-1.8l3.9-3.8a.6.6 0 0 1 .9 0zM11.5.8L7.8 13.6a.6.6 0 0 1-.7.4.6.6 0 0 1-.5-.8L10.3.4a.7.7 0 0 1 .8-.4.6.6 0 0 1 .4.8z" />
        </svg>
      </Button>,
      <Button
        key="nav-item-quote"
        bsSize="small"
        title="Quote"
        onClick={this.createAddPrefixToEachLinesHandler('> ')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="13" viewBox="0 0 17 12">
          <path d="M5 0H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a1.7 1.7 0 0 0 1-.3V10a.9.9 0 0 1-1 1H3v1h2a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 6H2a.9.9 0 0 1-1-1V2a.9.9 0 0 1 1-1h3a.9.9 0 0 1 1 1v3a.9.9 0 0 1-1 1zm10-6h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a1.7 1.7 0 0 0 1-.3V10a.9.9 0 0 1-1 1h-2v1h2a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 6h-3a.9.9 0 0 1-1-1V2a.9.9 0 0 1 1-1h3a.9.9 0 0 1 1 1v3a.9.9 0 0 1-1 1z" />
        </svg>
      </Button>,
      <Button
        key="nav-item-ul"
        bsSize="small"
        title="List"
        onClick={this.createAddPrefixToEachLinesHandler('- ')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="13" viewBox="0 0 21.6 13.5">
          <path d="M6.4 1.5h14.5a.7.7 0 0 0 .7-.7.7.7 0 0 0-.7-.7H6.4a.8.8 0 0 0-.8.7.8.8 0 0 0 .8.7zm0 6h14.5a.7.7 0 0 0 .7-.7.7.7 0 0 0-.7-.7H6.4a.8.8 0 0 0-.8.7.8.8 0 0 0 .8.7zm0 6h14.5a.7.7 0 0 0 .7-.7.7.7 0 0 0-.7-.7H6.4a.8.8 0 0 0-.8.7.8.8 0 0 0 .8.7zM.9 1.5h1a.8.8 0 0 0 .9-.7.8.8 0 0 0-.9-.8h-1a.8.8 0 0 0-.9.7.8.8 0 0 0 .9.8zm0 6h1a.8.8 0 0 0 .9-.7.8.8 0 0 0-.9-.8h-1a.8.8 0 0 0-.9.7.8.8 0 0 0 .9.8zm0 6h1a.8.8 0 0 0 .9-.7.8.8 0 0 0-.9-.7h-1a.8.8 0 0 0-.9.7.8.8 0 0 0 .9.7z" />
        </svg>
      </Button>,
      <Button
        key="nav-item-ol"
        bsSize="small"
        title="Numbered List"
        onClick={this.createAddPrefixToEachLinesHandler('1. ')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="13" viewBox="0 0 23.7 16">
          <path d="M23.7 2a.8.8 0 0 1-.8.8H6.6a.8.8 0 0 1-.7-.8.7.7 0 0 1 .7-.7h16.3a.7.7 0 0 1 .8.7zM6.6 8.7h16.3a.7.7 0 0 0 .8-.7.8.8 0 0 0-.8-.8H6.6a.8.8 0 0 0-.7.8.7.7 0 0 0 .7.7zm0 5.9h16.3a.7.7 0 0 0 .8-.7.7.7 0 0 0-.8-.7H6.6a.7.7 0 0 0-.7.7.7.7 0 0 0 .7.7zM1.5.5V4h.6V0h-.5L.7.5v.4l.8-.4zM.9 9.6l.3-.3c.9-.9 1.4-1.5 1.4-2.2a1.2 1.2 0 0 0-1.3-1.2h-.1a1.4 1.4 0 0 0-1.2.6l.3.4a1.2 1.2 0 0 1 .9-.5.6.6 0 0 1 .8.6v.2c0 .6-.4 1.1-1.5 2.1l-.4.4v.3h2.6v-.4zm.9 4.1a1 1 0 0 0 .7-.9 1 1 0 0 0-1.1-1 2 2 0 0 0-1.1.3v.4l.8-.2c.5 0 .8.2.8.6s-.5.7-.9.7H.7v.4H1c.6 0 1.1.2 1.1.8a.8.8 0 0 1-.9.8l-.9-.3-.2.4a2 2 0 0 0 1.1.3c1 0 1.5-.6 1.5-1.2a1.2 1.2 0 0 0-.9-1.1z" />
        </svg>
      </Button>,
      <Button
        key="nav-item-checkbox"
        bsSize="small"
        title="Check List"
        onClick={this.createAddPrefixToEachLinesHandler('- [ ] ')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="13" viewBox="0 0 14.4 16">
          <path d="M13.9 5.5a.5.5 0 0 1 .5.5v9a1.1 1.1 0 0 1-1.1 1H1a1.1 1.1 0 0 1-1-1V2.6a1.1 1.1 0 0 1 1-1h7.1a.5.5 0 0 1 .5.5.5.5 0 0 1-.5.5H1V15h12.3V6a.6.6 0 0 1 .6-.5zM3.6 8.3a.5.5 0 0 0 0 .7l2.5 2.5a.8.8 0 0 0 1.1 0h.1l7-10.7c.1-.2.1-.6-.2-.7a.5.5 0 0 0-.7.1L6.6 10.6 4.3 8.3a.5.5 0 0 0-.7 0z" />
        </svg>
      </Button>,
      <Button
        key="nav-item-link"
        bsSize="small"
        title="Link"
        onClick={this.createReplaceSelectionHandler('[', ']()')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="13" viewBox="0 0 16 16">
          <path d="M4.6 11.4l.4.2h.2v-.2l6.1-6.1a.4.4 0 0 0 .1-.3.5.5 0 0 0-.5-.5h-.3l-6 6.2a.6.6 0 0 0-.1.4c0 .1 0 .3.1.3zm2.8-1a2 2 0 0 1 0 1.1 4.1 4.1 0 0 1-.5.9l-2.1 1.9a1.9 1.9 0 0 1-1.5.7 2 2 0 0 1-1.6-.7 1.9 1.9 0 0 1-.7-1.5 2 2 0 0 1 .7-1.6l1.9-2.1a2 2 0 0 1 2.2-.5l.8-.8a3.2 3.2 0 0 0-1.4-.3 3.3 3.3 0 0 0-2.3.9L1 10.5A3.2 3.2 0 0 0 .9 15H1a2.9 2.9 0 0 0 2.3 1 3.2 3.2 0 0 0 2.3-1l2-1.9a4.6 4.6 0 0 0 .9-1.7 2.9 2.9 0 0 0-.3-1.8zM15 1a2.5 2.5 0 0 0-1-.8 3.1 3.1 0 0 0-3.5.8L8.4 2.9a3.1 3.1 0 0 0-.9 1.8 3.2 3.2 0 0 0 .3 1.9l.8-.8a2 2 0 0 1 0-1.1 2.2 2.2 0 0 1 .5-1.1l2.1-1.9.3-.3.4-.2.4-.2h.5a1.9 1.9 0 0 1 1.5.7 2 2 0 0 1 .7 1.6 1.9 1.9 0 0 1-.7 1.5l-2 2.1-.7.4a1.5 1.5 0 0 1-.9.2h-.4l-.8.8H12l1-.7 2-2.1A3 3 0 0 0 15 1z" />
        </svg>
      </Button>,
      <Button
        key="nav-item-image"
        bsSize="small"
        title="Image"
        onClick={this.createReplaceSelectionHandler('![', ']()')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="13" viewBox="0 0 19 16">
          <path d="M17.8 0H1.2A1.2 1.2 0 0 0 0 1.2v13.6A1.2 1.2 0 0 0 1.2 16h16.6a1.2 1.2 0 0 0 1.2-1.2V1.2a1.4 1.4 0 0 0-.2-.6.8.8 0 0 0-.4-.4zm0 14.8H1.2v-3.5l4.7-4.6 5 4.9.3.2.5-.2 2.1-1.9 3.9 4h.1v1.1zm0-2.8l-3.5-3.5-.4-.2h-.4l-2.2 2-4.9-4.8-.4-.2c-.2 0-.4 0-.5.2L1.2 9.7V1.2h16.6V12zm-4.2-6.1h.6a1.1 1.1 0 0 0 .6-1.1 1.2 1.2 0 0 0-1.2-1.1 1.3 1.3 0 0 0-1.2 1.2 1.2 1.2 0 0 0 .4.8 1.1 1.1 0 0 0 .8.3z" />
        </svg>
      </Button>,
      <Button
        key="nav-item-table"
        bsSize="small"
        title="Table"
        onClick={this.showHandsonTableHandler}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="13" viewBox="0 0 20.3 16">
          <path d="M19.1 16H1.2A1.2 1.2 0 0 1 0 14.8V1.2A1.2 1.2 0 0 1 1.2 0h17.9a1.2 1.2 0 0 1 1.2 1.2v13.6a1.2 1.2 0 0 1-1.2 1.2zm-5.2-4.3v3.2h5.3v-3.2zm-6.4 0v3.2h5.3v-3.2zm-6.4 0v3.2h5.3v-3.2zm12.8-4.2v3.2h5.3V7.5zm-6.4 0v3.2h5.3V7.5zm-6.4 0v3.2h5.3V7.5zm12.8-4.3v3.2h5.3V3.2zm-6.4 0v3.2h5.3V3.2zm-6.4 0v3.2h5.3V3.2z" />
        </svg>
      </Button>,
      /* eslint-able max-len */
    ];
  }

  render() {
    const mode = this.state.isGfmMode ? 'gfm' : undefined;
    const additionalClasses = Array.from(this.state.additionalClassSet).join(' ');

    const placeholder = this.state.isGfmMode ? 'Input with Markdown..' : 'Input with Plane Text..';

    return (
      <React.Fragment>

        <ReactCodeMirror
          ref={(c) => { this.cm = c }}
          className={additionalClasses}
          placeholder="search"
          editorDidMount={(editor) => {
          // add event handlers
          editor.on('paste', this.pasteHandler);
          editor.on('scrollCursorIntoView', this.scrollCursorIntoViewHandler);
        }}
          value={this.state.value}
          options={{
            mode,
            theme: this.props.editorOptions.theme,
            styleActiveLine: this.props.editorOptions.styleActiveLine,
            lineNumbers: this.props.lineNumbers,
            tabSize: 4,
            indentUnit: 4,
            lineWrapping: true,
            autoRefresh: { force: true }, // force option is enabled by autorefresh.ext.js -- Yuki Takei
            autoCloseTags: true,
            placeholder,
            matchBrackets: true,
            matchTags: { bothTags: true },
            // folding
            foldGutter: this.props.lineNumbers,
            gutters: this.props.lineNumbers ? ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'] : [],
            // match-highlighter, matchesonscrollbar, annotatescrollbar options
            highlightSelectionMatches: { annotateScrollbar: true },
            // markdown mode options
            highlightFormatting: true,
            // continuelist, indentlist
            extraKeys: {
              Enter: this.handleEnterKey,
              'Ctrl-Enter': this.handleCtrlEnterKey,
              'Cmd-Enter': this.handleCtrlEnterKey,
              Tab: 'indentMore',
              'Shift-Tab': 'indentLess',
              'Ctrl-Q': (cm) => { cm.foldCode(cm.getCursor()) },
            },
          }}
          onCursor={this.cursorHandler}
          onScroll={(editor, data) => {
          if (this.props.onScroll != null) {
            // add line data
            const line = editor.lineAtHeight(data.top, 'local');
            data.line = line;
            this.props.onScroll(data);
          }
        }}
          onChange={this.changeHandler}
          onDragEnter={(editor, event) => {
          if (this.props.onDragEnter != null) {
            this.props.onDragEnter(event);
          }
        }}
        />

        { this.renderLoadingKeymapOverlay() }

        { this.renderCheatsheetOverlay() }

        <HandsontableModal
          ref={(c) => { this.handsontableModal = c }}
          onSave={(table) => { return mtu.replaceFocusedMarkdownTableWithEditor(this.getCodeMirror(), table) }}
        />

      </React.Fragment>
    );
  }

}

CodeMirrorEditor.propTypes = Object.assign({
  editorOptions: PropTypes.object.isRequired,
  emojiStrategy: PropTypes.object,
  lineNumbers: PropTypes.bool,
  onMarkdownHelpButtonClicked: PropTypes.func,
}, AbstractEditor.propTypes);
CodeMirrorEditor.defaultProps = {
  lineNumbers: true,
};
