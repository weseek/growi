import React from 'react';
import PropTypes from 'prop-types';

import AbstractEditor from './AbstractEditor';

import urljoin from 'url-join';
const loadScript = require('simple-load-script');
const loadCssSync = require('load-css-file');

import * as codemirror from 'codemirror';
// set save handler
codemirror.commands.save = (instance) => {
  if (instance.codeMirrorEditor != null) {
    instance.codeMirrorEditor.dispatchSave();
  }
};
// set CodeMirror instance as 'CodeMirror' so that CDN addons can reference
window.CodeMirror = require('codemirror');


import { UnControlled as ReactCodeMirror } from 'react-codemirror2';
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
      isGfmMode: this.props.isGfmMode,
      isEnabledEmojiAutoComplete: false,
      isLoadingKeymap: false,
      isCheatsheatShown: this.props.isGfmMode && this.props.value.length === 0,
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
    // ensure to be able to resolve 'this' to use 'codemirror.commands.save'
    this.getCodeMirror().codeMirrorEditor = this;

    // initialize caret line
    this.setCaretLine(0);
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

    // update CodeMirror option
    const mode = bool ? 'gfm' : undefined;
    this.getCodeMirror().setOption('mode', mode);
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
    const top = editor.charCoords({line, ch: 0}, 'local').top;
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
    if (!this.state.isGfmMode) {
      codemirror.commands.newlineAndIndent(this.getCodeMirror());
      return;
    }

    const context = {
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
    const strFromBol = this.getStrFromBol();

    const autoformatTableClass = 'autoformat-markdown-table-activated';
    const additionalClassSet = this.state.additionalClassSet;
    const hasCustomClass = additionalClassSet.has(autoformatTableClass);
    if (mtu.isEndOfLine(editor) && mtu.linePartOfTableRE.test(strFromBol)) {
      if (!hasCustomClass) {
        additionalClassSet.add(autoformatTableClass);
        this.setState({additionalClassSet});
      }
    }
    else {
      if (hasCustomClass) {
        additionalClassSet.delete(autoformatTableClass);
        this.setState({additionalClassSet});
      }
    }
  }

  changeHandler(editor, data, value) {
    if (this.props.onChange != null) {
      this.props.onChange(value);
    }

    // update isCheatsheatShown
    const isCheatsheatShown = this.state.isGfmMode && value.length === 0;
    this.setState({isCheatsheatShown});

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

    // text
    if (types.includes('text/plain')) {
      pasteHelper.pasteText(this, event);
    }
    // files
    else if (types.includes('Files')) {
      this.dispatchPasteFiles(event);
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
      ? <div className="overlay overlay-loading-keymap">
          <span style={style} className="overlay-content">
            <div className="speeding-wheel d-inline-block"></div> Loading Keymap ...
          </span>
        </div>
      : '';
  }

  renderCheatSheatOverlay() {
    return (
      <div className="overlay overlay-gfm-cheatsheet mt-1 p-3 pt-3">
        <div className="panel panel-default mb-0">
          <div className="panel-heading"><i className="icon-fw icon-question"/>Markdown Help</div>
          <div className="panel-body small">
            <div className="row">
              <div className="col-xs-6">
                <p>
                  # 見出し1<br />
                  ## 見出し2<br />
                  ### 見出し3
                </p>
                <p><i>*斜体*</i>&nbsp;&nbsp;<b>**強調**</b></p>
                <p>
                  - リスト1<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;- リスト2
                </p>
              </div>
              <div className="col-xs-6">
                <p>
                  [リンク](http://..)<br />
                  [/ページ名/子ページ名]
                </p>
                <p>
                  ```javascript:index.js<br />
                  writeCode();<br />
                  ```
                </p>
                <p>行末にスペース2つ[ ][ ]<br />で改行</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const mode = this.state.isGfmMode ? 'gfm' : undefined;
    const defaultEditorOptions = {
      theme: 'elegant',
      lineNumbers: true,
    };
    const additionalClasses = Array.from(this.state.additionalClassSet).join(' ');
    const editorOptions = Object.assign(defaultEditorOptions, this.props.editorOptions || {});

    const placeholder = this.state.isGfmMode ? 'Input with Markdown..' : 'Input with Plane Text..';

    return <React.Fragment>
      <ReactCodeMirror
        ref="cm"
        className={additionalClasses}
        placeholder="search"
        editorDidMount={(editor) => {
          // add event handlers
          editor.on('paste', this.pasteHandler);
          editor.on('scrollCursorIntoView', this.scrollCursorIntoViewHandler);
        }}
        value={this.state.value}
        options={{
          mode: mode,
          theme: editorOptions.theme,
          styleActiveLine: editorOptions.styleActiveLine,
          lineNumbers: this.props.lineNumbers,
          tabSize: 4,
          indentUnit: 4,
          lineWrapping: true,
          autoRefresh: {force: true},   // force option is enabled by autorefresh.ext.js -- Yuki Takei
          autoCloseTags: true,
          placeholder: placeholder,
          matchBrackets: true,
          matchTags: {bothTags: true},
          // folding
          foldGutter: this.props.lineNumbers,
          gutters: this.props.lineNumbers ? ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'] : [],
          // match-highlighter, matchesonscrollbar, annotatescrollbar options
          highlightSelectionMatches: {annotateScrollbar: true},
          // markdown mode options
          highlightFormatting: true,
          // continuelist, indentlist
          extraKeys: {
            'Enter': this.handleEnterKey,
            'Ctrl-Enter': this.handleCtrlEnterKey,
            'Cmd-Enter': this.handleCtrlEnterKey,
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
        onChange={this.changeHandler}
        onDragEnter={(editor, event) => {
          if (this.props.onDragEnter != null) {
            this.props.onDragEnter(event);
          }
        }}
      />

      { this.renderLoadingKeymapOverlay() }
      { this.state.isCheatsheatShown && this.renderCheatSheatOverlay() }

    </React.Fragment>;
  }

}

CodeMirrorEditor.propTypes = Object.assign({
  emojiStrategy: PropTypes.object,
  lineNumbers: PropTypes.bool,
}, AbstractEditor.propTypes);
CodeMirrorEditor.defaultProps = {
  lineNumbers: true,
};
