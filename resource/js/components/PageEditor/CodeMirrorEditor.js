import React from 'react';
import PropTypes from 'prop-types';

import AbstractEditor from './AbstractEditor';

import urljoin from 'url-join';
const loadScript = require('simple-load-script');
const loadCssSync = require('load-css-file');

import * as codemirror from 'codemirror';

import { UnControlled as ReactCodeMirror } from 'react-codemirror2';
require('codemirror/addon/display/autorefresh');
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
require('codemirror/mode/gfm/gfm');

import pasteHelper from './PasteHelper';
import EmojiAutoCompleteHelper from './EmojiAutoCompleteHelper';

import InterceptorManager from '../../../../lib/util/interceptor-manager';

import PreventMarkdownListInterceptor from './PreventMarkdownListInterceptor';
import MarkdownTableInterceptor from './MarkdownTableInterceptor';
import mtu from './MarkdownTableUtil';

export default class CodeMirrorEditor extends AbstractEditor {

  constructor(props) {
    super(props);
    this.logger = require('@alias/logger')('growi:PageEditor:CodeMirrorEditor');

    this.state = {
      value: this.props.value,
      isEnabledEmojiAutoComplete: false,
      isLoadingKeymap: false,
      additionalClass: '',
    };

    this.init();

    this.getCodeMirror = this.getCodeMirror.bind(this);

    this.getBol = this.getBol.bind(this);
    this.getEol = this.getEol.bind(this);

    this.loadTheme = this.loadTheme.bind(this);
    this.loadKeymapMode = this.loadKeymapMode.bind(this);
    this.setKeymapMode = this.setKeymapMode.bind(this);
    this.handleEnterKey = this.handleEnterKey.bind(this);

    this.scrollCursorIntoViewHandler = this.scrollCursorIntoViewHandler.bind(this);
    this.pasteHandler = this.pasteHandler.bind(this);
    this.cursorHandler = this.cursorHandler.bind(this);

    this.renderLoadingKeymapOverlay = this.renderLoadingKeymapOverlay.bind(this);
  }

  init() {
    this.cmCdnRoot = 'https://cdn.jsdelivr.net/npm/codemirror@5.37.0';

    this.interceptorManager = new InterceptorManager();
    this.interceptorManager.addInterceptors([
      new PreventMarkdownListInterceptor(),
      new MarkdownTableInterceptor(),
    ]);

    this.loadedThemeSet = new Set(['eclipse', 'elegant']);   // themes imported in _vendor.scss
    this.loadedKeymapSet = new Set();
  }

  componentWillMount() {
    if (this.props.emojiStrategy != null) {
      this.emojiAutoCompleteHelper = new EmojiAutoCompleteHelper(this.props.emojiStrategy);
      this.setState({isEnabledEmojiAutoComplete: true});
    }
  }

  componentDidMount() {
    // initialize caret line
    this.setCaretLine(0);
    // set save handler
    codemirror.commands.save = this.dispatchSave;

    // set CodeMirror instance as 'CodeMirror' so that CDN addons can reference
    window.CodeMirror = require('codemirror');
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
    return this.refs.cm.editor;
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
  setCaretLine(line) {
    if (isNaN(line)) {
      return;
    }

    const editor = this.getCodeMirror();
    const linePosition = Math.max(0, line);

    editor.setCursor({line: linePosition});   // leave 'ch' field as null/undefined to indicate the end of line
    this.setScrollTopByLine(linePosition);
  }

  /**
   * @inheritDoc
   */
  setScrollTopByLine(line) {
    if (isNaN(line)) {
      return;
    }

    const editor = this.getCodeMirror();
    // get top position of the line
    var top = editor.charCoords({line, ch: 0}, 'local').top;
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
  replaceBolToCurrentPos(text) {
    const editor = this.getCodeMirror();
    editor.getDoc().replaceRange(text, this.getBol(), editor.getCursor());
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
      this.loadCss(urljoin(this.cmCdnRoot, `theme/${theme}.min.css`));

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
    let scriptList = [];
    let cssList = [];

    // add dependencies
    if (this.loadedKeymapSet.size == 0) {
      scriptList.push(loadScript(urljoin(this.cmCdnRoot, 'addon/dialog/dialog.min.js')));
      cssList.push(loadCss(urljoin(this.cmCdnRoot, 'addon/dialog/dialog.min.css')));
    }
    // load keymap
    if (!this.loadedKeymapSet.has(keymapMode)) {
      scriptList.push(loadScript(urljoin(this.cmCdnRoot, `keymap/${keymapMode}.min.js`)));
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
        this.getCodeMirror().setOption('keyMap', keymapMode);
      });
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
          codemirror.commands.newlineAndIndentContinueMarkdownList(this.getCodeMirror());
        }
      });
  }

  scrollCursorIntoViewHandler(editor, event) {
    if (this.props.onScrollCursorIntoView != null) {
      const line = editor.getCursor().line;
      this.props.onScrollCursorIntoView(line);
    }
  }

  cursorHandler(editor, event) {
    const strFromBol = this.getStrFromBol();
    if (mtu.isEndOfLine(editor) && mtu.linePartOfTableRE.test(strFromBol)) {
      this.setState({additionalClass: 'autoformat-markdown-table-activated'});
    }
    else {
      this.setState({additionalClass: ''});
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

    // text
    if (types.includes('text/plain')) {
      pasteHelper.pasteText(this, event);
    }
    // files
    else if (types.includes('Files')) {
      this.dispatchPasteFiles(event);
    }
  }

  getOverlayStyle() {
    return {
      position: 'absolute',
      zIndex: 4,  // forward than .CodeMirror-gutters
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    };
  }

  renderLoadingKeymapOverlay() {
    const overlayStyle = this.getOverlayStyle();

    return this.state.isLoadingKeymap
      ? <div style={overlayStyle} className="loading-keymap overlay">
          <span className="overlay-content">
            <div className="speeding-wheel d-inline-block"></div> Loading Keymap ...
          </span>
        </div>
      : '';
  }

  render() {
    const theme = this.props.editorOptions.theme || 'elegant';
    const styleActiveLine = this.props.editorOptions.styleActiveLine || undefined;
    return <React.Fragment>
      <ReactCodeMirror
        ref="cm"
        className={this.state.additionalClass}
        editorDidMount={(editor) => {
          // add event handlers
          editor.on('paste', this.pasteHandler);
          editor.on('scrollCursorIntoView', this.scrollCursorIntoViewHandler);
        }}
        value={this.state.value}
        options={{
          mode: 'gfm',
          theme: theme,
          styleActiveLine: styleActiveLine,
          lineNumbers: true,
          tabSize: 4,
          indentUnit: 4,
          lineWrapping: true,
          autoRefresh: true,
          autoCloseTags: true,
          matchBrackets: true,
          matchTags: {bothTags: true},
          // folding
          foldGutter: true,
          gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
          // match-highlighter, matchesonscrollbar, annotatescrollbar options
          highlightSelectionMatches: {annotateScrollbar: true},
          // markdown mode options
          highlightFormatting: true,
          // continuelist, indentlist
          extraKeys: {
            'Enter': this.handleEnterKey,
            'Tab': 'indentMore',
            'Shift-Tab': 'indentLess',
            'Ctrl-Q': (cm) => { cm.foldCode(cm.getCursor()) },
          }
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
        onChange={(editor, data, value) => {
          if (this.props.onChange != null) {
            this.props.onChange(value);
          }

          // Emoji AutoComplete
          if (this.state.isEnabledEmojiAutoComplete) {
            this.emojiAutoCompleteHelper.showHint(editor);
          }
        }}
        onDragEnter={(editor, event) => {
          if (this.props.onDragEnter != null) {
            this.props.onDragEnter(event);
          }
        }}
      />

      { this.renderLoadingKeymapOverlay() }

    </React.Fragment>;
  }

}

CodeMirrorEditor.propTypes = Object.assign({
  emojiStrategy: PropTypes.object,
}, AbstractEditor.propTypes);

