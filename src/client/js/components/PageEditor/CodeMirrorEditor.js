import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/es/Modal';
import Button from 'react-bootstrap/es/Button';

import InterceptorManager from '@commons/service/interceptor-manager';

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

import AbstractEditor from './AbstractEditor';

import pasteHelper from './PasteHelper';
import EmojiAutoCompleteHelper from './EmojiAutoCompleteHelper';

import PreventMarkdownListInterceptor from './PreventMarkdownListInterceptor';
import MarkdownTableInterceptor from './MarkdownTableInterceptor';
import mtu from './MarkdownTableUtil';
import HandsontableModal from './HandsontableModal';

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
      isCheatsheetModalButtonShown: this.props.isGfmMode && this.props.value.length > 0,
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

    this.showHandsonTableHandler = this.showHandsonTableHandler.bind(this);
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

    this.updateCheatsheetStates(bool, null);

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

    // text
    if (types.includes('text/plain')) {
      pasteHelper.pasteText(this, event);
    }
    // files
    else if (types.includes('Files')) {
      this.dispatchPasteFiles(event);
    }
  }

  /**
   * update states which related to cheatsheet
   * @param {boolean} isGfmMode (use state.isGfmMode if null is set)
   * @param {string} value (get value from codemirror if null is set)
   */
  updateCheatsheetStates(isGfmMode, value) {
    if (isGfmMode == null) {
      isGfmMode = this.state.isGfmMode;
    }
    if (value == null) {
      value = this.getCodeMirror().getDoc().getValue();
    }
    // update isSimpleCheatsheetShown, isCheatsheetModalButtonShown
    const isSimpleCheatsheetShown = isGfmMode && value.length === 0;
    const isCheatsheetModalButtonShown = isGfmMode && value.length > 0;
    this.setState({ isSimpleCheatsheetShown, isCheatsheetModalButtonShown });
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

  renderSimpleCheatsheet() {
    return (
      <div className="panel panel-default gfm-cheatsheet mb-0">
        <div className="panel-body small p-b-0">
          <div className="row">
            <div className="col-xs-6">
              <p>
                # 見出し1<br />
                ## 見出し2
              </p>
              <p><i>*斜体*</i>&nbsp;&nbsp;<b>**強調**</b></p>
              <p>
                [リンク](http://..)<br />
                [/ページ名/子ページ名]
              </p>
              <p>
                ```javascript:index.js<br />
                writeCode();<br />
                ```
              </p>
            </div>
            <div className="col-xs-6">
              <p>
                - リスト 1<br />
                &nbsp;&nbsp;&nbsp;&nbsp;- リスト 1_1<br />
                - リスト 2<br />
                1. 番号付きリスト 1<br />
                1. 番号付きリスト 2
              </p>
              <hr />
              <p>行末にスペース2つ[ ][ ]<br />で改行</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderCheatsheetModalBody() {
    return (
      <div className="row small">
        <div className="col-sm-6">
          <h4>Header</h4>
          <ul className="hljs">
            <li><code># </code>見出し1</li>
            <li><code>## </code>見出し2</li>
            <li><code>### </code>見出し3</li>
          </ul>
          <h4>Block</h4>
          <p className="mb-1"><code>[空白行]</code>を挟むことで段落になります</p>
          <ul className="hljs">
            <li>text</li>
            <li></li>
            <li>text</li>
          </ul>
          <h4>Line breaks</h4>
          <p className="mb-1">段落中、<code>[space][space]</code>(スペース2つ) で改行されます</p>
          <ul className="hljs">
            <li>text<code> </code><code> </code></li>
            <li>text</li>
          </ul>
          <h4>Typography</h4>
          <ul className="hljs">
            <li><i>*イタリック*</i></li>
            <li><b>**ボールド**</b></li>
            <li><i><b>***イタリックボールド***</b></i></li>
            <li>~~取り消し線~~ => <s>striked text</s></li>
          </ul>
          <h4>Link</h4>
          <ul className="hljs">
            <li>[Google](https://www.google.co.jp/)</li>
            <li>[/Page1/ChildPage1]</li>
          </ul>
          <h4>コードハイライト</h4>
          <ul className="hljs">
            <li>```javascript:index.js</li>
            <li>writeCode();</li>
            <li>```</li>
          </ul>
        </div>
        <div className="col-sm-6">
          <h4>リスト</h4>
          <ul className="hljs">
            <li>- リスト 1</li>
            <li>&nbsp;&nbsp;- リスト 1_1</li>
            <li>- リスト 2</li>
          </ul>
          <ul className="hljs">
            <li>1. 番号付きリスト 1</li>
            <li>1. 番号付きリスト 2</li>
          </ul>
          <ul className="hljs">
            <li>- [ ] タスク(チェックなし)</li>
            <li>- [x] タスク(チェック付き)</li>
          </ul>
          <h4>引用</h4>
          <ul className="hljs">
            <li>> 複数行の引用文を</li>
            <li>> 書くことができます</li>
          </ul>
          <ul className="hljs">
            <li>>> 多重引用</li>
            <li>>>> 多重引用</li>
            <li>>>>> 多重引用</li>
          </ul>
          <h4>Table</h4>
          <ul className="hljs text-center">
            <li>|&nbsp;&nbsp;&nbsp;左寄せ&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;中央寄せ&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;右寄せ&nbsp;&nbsp;&nbsp;|</li>
            <li>|:-----------|:----------:|-----------:|</li>
            <li>|column 1&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;column 2&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;column 3|</li>
            <li>|column 1&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;column 2&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;column 3|</li>
          </ul>
          <h4>Images</h4>
          <p className="mb-1"><code> ![Alt文字列](URL)</code> で<span className="text-info">&lt;img&gt;</span>タグを挿入できます</p>
          <ul className="hljs">
            <li>![ex](https://example.com/images/a.png)</li>
          </ul>

          <hr />
          <a href="/Sandbox" className="btn btn-info btn-block" target="_blank">
            <i className="icon-share-alt"/> Sandbox を開く
          </a>
        </div>
      </div>
    );
  }

  renderCheatsheetModalButton() {
    const showCheatsheetModal = () => {
      this.setState({isCheatsheetModalShown: true});
    };

    const hideCheatsheetModal = () => {
      this.setState({isCheatsheetModalShown: false});
    };

    return (
      <React.Fragment>
        <Modal className="modal-gfm-cheatsheet" show={this.state.isCheatsheetModalShown} onHide={() => { hideCheatsheetModal() }}>
          <Modal.Header closeButton>
            <Modal.Title><i className="icon-fw icon-question"/>Markdown Help</Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-1">
            { this.renderCheatsheetModalBody() }
          </Modal.Body>
        </Modal>

        <a className="gfm-cheatsheet-modal-link text-muted small" onClick={() => { showCheatsheetModal() }}>
          <i className="icon-question" /> Markdown
        </a>
      </React.Fragment>
    );
  }

  showHandsonTableHandler() {
    this.refs.handsontableModal.show(mtu.getMarkdownTable(this.getCodeMirror()));
  }

  getNavbarItems() {
    return <Button bsSize="small" onClick={ this.showHandsonTableHandler }><img src="/images/icons/navbar-editor/table.svg" width="14" /></Button>;
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

      <div className="overlay overlay-gfm-cheatsheet mt-1 p-3 pt-3">
        { this.state.isSimpleCheatsheetShown && this.renderSimpleCheatsheet() }
        { this.state.isCheatsheetModalButtonShown && this.renderCheatsheetModalButton() }
      </div>

      <HandsontableModal ref='handsontableModal' onSave={ table => mtu.replaceFocusedMarkdownTableWithEditor(this.getCodeMirror(), table) }/>
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
