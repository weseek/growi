import React from 'react';
import PropTypes from 'prop-types';

import urljoin from 'url-join';
import * as codemirror from 'codemirror';

import { Button } from 'reactstrap';
import { UnControlled as ReactCodeMirror } from 'react-codemirror2';

// import * as loadScript from 'simple-load-script';
// import * as loadCssSync from 'load-css-file';

// import InterceptorManager from '~/service/interceptor-manager';
import loggerFactory from '~/utils/logger';

// import '~/styles/modules/codemirror-editor.module.scss';

import AbstractEditor from './AbstractEditor';
import SimpleCheatsheet from './SimpleCheatsheet';

// import pasteHelper from './PasteHelper';
// import EmojiAutoCompleteHelper from './EmojiAutoCompleteHelper';
// import PreventMarkdownListInterceptor from './PreventMarkdownListInterceptor';
// import MarkdownTableInterceptor from './MarkdownTableInterceptor';
// import mlu from './MarkdownLinkUtil';
// import mtu from './MarkdownTableUtil';
// import mdu from './MarkdownDrawioUtil';
// import geu from './GridEditorUtil';
// import GridEditModal from './GridEditModal';
// import LinkEditModal from './LinkEditModal';
// import HandsontableModal from './HandsontableModal';
import EditorIcon from './EditorIcon';
// import DrawioModal from './DrawioModal';

const logger = loggerFactory('growi:PageEditor:CodeMirrorEditor');

// set save handler
codemirror.commands.save = (instance) => {
  if (instance.codeMirrorEditor != null) {
    instance.codeMirrorEditor.dispatchSave();
  }
};

const MARKDOWN_TABLE_ACTIVATED_CLASS = 'markdown-table-activated';
const MARKDOWN_LINK_ACTIVATED_CLASS = 'markdown-link-activated';

export default class CodeMirrorEditor extends AbstractEditor {

  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value,
      isGfmMode: this.props.isGfmMode,
      isEnabledEmojiAutoComplete: false,
      isLoadingKeymap: false,
      // isSimpleCheatsheetShown: this.props.isGfmMode && this.props.value.length === 0,
      isCheatsheetModalShown: false,
      additionalClassSet: new Set(),
    };

    // this.gridEditModal = React.createRef();
    // this.linkEditModal = React.createRef();
    // this.handsontableModal = React.createRef();
    // this.drawioModal = React.createRef();

    this.init();

    // this.getCodeMirror = this.getCodeMirror.bind(this);

    // this.getBol = this.getBol.bind(this);
    // this.getEol = this.getEol.bind(this);

    // this.loadTheme = this.loadTheme.bind(this);
    // this.loadKeymapMode = this.loadKeymapMode.bind(this);
    // this.setKeymapMode = this.setKeymapMode.bind(this);
    // this.handleEnterKey = this.handleEnterKey.bind(this);
    // this.handleCtrlEnterKey = this.handleCtrlEnterKey.bind(this);

    // this.scrollCursorIntoViewHandler = this.scrollCursorIntoViewHandler.bind(this);
    // this.pasteHandler = this.pasteHandler.bind(this);
    // this.cursorHandler = this.cursorHandler.bind(this);
    // this.changeHandler = this.changeHandler.bind(this);

    // this.updateCheatsheetStates = this.updateCheatsheetStates.bind(this);

    // this.renderLoadingKeymapOverlay = this.renderLoadingKeymapOverlay.bind(this);
    // this.renderCheatsheetModalButton = this.renderCheatsheetModalButton.bind(this);

    // this.makeHeaderHandler = this.makeHeaderHandler.bind(this);
    // this.showGridEditorHandler = this.showGridEditorHandler.bind(this);
    // this.showLinkEditHandler = this.showLinkEditHandler.bind(this);
    // this.showHandsonTableHandler = this.showHandsonTableHandler.bind(this);
    // this.showDrawioHandler = this.showDrawioHandler.bind(this);
  }

  init() {
    // this.cmCdnRoot = 'https://cdn.jsdelivr.net/npm/codemirror@5.42.0';
    // this.cmNoCdnScriptRoot = '/js/cdn';
    // this.cmNoCdnStyleRoot = '/styles/cdn';

    // this.interceptorManager = new InterceptorManager();
    // this.interceptorManager.addInterceptors([
    //   new PreventMarkdownListInterceptor(),
    //   new MarkdownTableInterceptor(),
    // ]);

    // this.loadedThemeSet = new Set(['eclipse', 'elegant']); // themes imported in _vendor.scss
    // this.loadedKeymapSet = new Set();
  }

  componentWillMount() {
    // if (this.props.emojiStrategy != null) {
    //   this.emojiAutoCompleteHelper = new EmojiAutoCompleteHelper(this.props.emojiStrategy);
    //   this.setState({ isEnabledEmojiAutoComplete: true });
    // }
  }

  componentDidMount() {
    // set CodeMirror instance as 'CodeMirror' so that CDN addons can reference
    window.CodeMirror = require('codemirror');
    require('codemirror/addon/display/placeholder');
    require('codemirror/addon/edit/matchbrackets');
    require('codemirror/addon/edit/matchtags');
    require('codemirror/addon/edit/closetag');
    require('codemirror/addon/edit/continuelist');
    require('codemirror/addon/hint/show-hint');
    require('codemirror/addon/search/searchcursor');
    require('codemirror/addon/search/match-highlighter');
    require('codemirror/addon/selection/active-line');
    require('codemirror/addon/scroll/annotatescrollbar');
    require('codemirror/addon/fold/foldcode');
    require('codemirror/addon/fold/foldgutter');
    require('codemirror/addon/fold/markdown-fold');
    require('codemirror/addon/fold/brace-fold');
    require('codemirror/addon/display/placeholder');
    require('codemirror/mode/gfm/gfm');
    require('../../util/codemirror/autorefresh.ext');

    // ensure to be able to resolve 'this' to use 'codemirror.commands.save'
    this.getCodeMirror().codeMirrorEditor = this;

    // load theme
    // const theme = this.props.editorOptions.theme;
    // this.loadTheme(theme);

    // set keymap
    // const keymapMode = this.props.editorOptions.keymapMode;
    // this.setKeymapMode(keymapMode);
  }

  componentWillReceiveProps(nextProps) {
    // load theme
    // const theme = nextProps.editorOptions.theme;
    // this.loadTheme(theme);

    // set keymap
    // const keymapMode = nextProps.editorOptions.keymapMode;
    // this.setKeymapMode(keymapMode);
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

  // loadCss(source) {
  //   return new Promise((resolve) => {
  //     loadCssSync(source);
  //     resolve();
  //   });
  // }

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
  // loadKeymapMode(keymapMode) {
  //   const loadCss = this.loadCss;
  //   const scriptList = [];
  //   const cssList = [];

  //   // add dependencies
  //   if (this.loadedKeymapSet.size === 0) {
  //     const dialogScriptUrl = this.props.noCdn
  //       ? urljoin(this.cmNoCdnScriptRoot, 'codemirror-dialog.js')
  //       : urljoin(this.cmCdnRoot, 'addon/dialog/dialog.min.js');
  //     const dialogStyleUrl = this.props.noCdn
  //       ? urljoin(this.cmNoCdnStyleRoot, 'codemirror-dialog.css')
  //       : urljoin(this.cmCdnRoot, 'addon/dialog/dialog.min.css');

  //     scriptList.push(loadScript(dialogScriptUrl));
  //     cssList.push(loadCss(dialogStyleUrl));
  //   }
  //   // load keymap
  //   if (!this.loadedKeymapSet.has(keymapMode)) {
  //     const keymapScriptUrl = this.props.noCdn
  //       ? urljoin(this.cmNoCdnScriptRoot, `codemirror-keymap-${keymapMode}.js`)
  //       : urljoin(this.cmCdnRoot, `keymap/${keymapMode}.min.js`);
  //     scriptList.push(loadScript(keymapScriptUrl));
  //     // update Set
  //     this.loadedKeymapSet.add(keymapMode);
  //   }

  //   // set loading state
  //   this.setState({ isLoadingKeymap: true });

  //   return Promise.all(scriptList.concat(cssList))
  //     .then(() => {
  //       this.setState({ isLoadingKeymap: false });
  //     });
  // }

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
            logger.error(`Timeout to load keyMap '${keymapMode}'`);
            clearInterval(timer);
          }

          try {
            this.getCodeMirror().setOption('keyMap', keymapMode);
            clearInterval(timer);
          }
          catch (e) {
            logger.info(`keyMap '${keymapMode}' has not been initialized. retry..`);

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
      // editorOptions: this.props.editorOptions,
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

  // cursorHandler(editor, event) {
  //   const { additionalClassSet } = this.state;
  //   const hasCustomClass = additionalClassSet.has(MARKDOWN_TABLE_ACTIVATED_CLASS);
  //   const hasLinkClass = additionalClassSet.has(MARKDOWN_LINK_ACTIVATED_CLASS);

  //   const isInTable = mtu.isInTable(editor);
  //   const isInLink = mlu.isInLink(editor);

  //   if (!hasCustomClass && isInTable) {
  //     additionalClassSet.add(MARKDOWN_TABLE_ACTIVATED_CLASS);
  //     this.setState({ additionalClassSet });
  //   }

  //   if (hasCustomClass && !isInTable) {
  //     additionalClassSet.delete(MARKDOWN_TABLE_ACTIVATED_CLASS);
  //     this.setState({ additionalClassSet });
  //   }

  //   if (!hasLinkClass && isInLink) {
  //     additionalClassSet.add(MARKDOWN_LINK_ACTIVATED_CLASS);
  //     this.setState({ additionalClassSet });
  //   }

  //   if (hasLinkClass && !isInLink) {
  //     additionalClassSet.delete(MARKDOWN_LINK_ACTIVATED_CLASS);
  //     this.setState({ additionalClassSet });
  //   }
  // }

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
  // pasteHandler(editor, event) {
  //   const types = event.clipboardData.types;

  //   // files
  //   if (types.includes('Files')) {
  //     event.preventDefault();
  //     this.dispatchPasteFiles(event);
  //   }
  //   // text
  //   else if (types.includes('text/plain')) {
  //     pasteHelper.pasteText(this, event);
  //   }

  // }

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
      <button type="button" className="btn-link gfm-cheatsheet-modal-link small" onClick={() => { this.markdownHelpButtonClickedHandler() }}>
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
              <div className="mb-2 d-none d-md-block">
                <SimpleCheatsheet />
              </div>
            </div>
          )
          : (
            <div className="mr-4 mb-2">
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

  // showGridEditorHandler() {
  //   this.gridEditModal.current.show(geu.getGridHtml(this.getCodeMirror()));
  // }

  // showLinkEditHandler() {
  //   this.linkEditModal.current.show(mlu.getMarkdownLink(this.getCodeMirror()));
  // }

  // showHandsonTableHandler() {
  //   this.handsontableModal.current.show(mtu.getMarkdownTable(this.getCodeMirror()));
  // }

  // showDrawioHandler() {
  //   this.drawioModal.current.show(mdu.getMarkdownDrawioMxfile(this.getCodeMirror()));
  // }

  getNavbarItems() {
    return [
      <Button
        key="nav-item-bold"
        color={null}
        size="sm"
        title="Bold"
        onClick={this.createReplaceSelectionHandler('**', '**')}
      >
        <EditorIcon icon="Bold" />
      </Button>,
      <Button
        key="nav-item-italic"
        color={null}
        size="sm"
        title="Italic"
        onClick={this.createReplaceSelectionHandler('*', '*')}
      >
        <EditorIcon icon="Italic" />
      </Button>,
      <Button
        key="nav-item-strikethrough"
        color={null}
        size="sm"
        title="Strikethrough"
        onClick={this.createReplaceSelectionHandler('~~', '~~')}
      >
        <EditorIcon icon="Strikethrough" />
      </Button>,
      <Button
        key="nav-item-header"
        color={null}
        size="sm"
        title="Heading"
        onClick={this.makeHeaderHandler}
      >
        <EditorIcon icon="Heading" />
      </Button>,
      <Button
        key="nav-item-code"
        color={null}
        size="sm"
        title="Inline Code"
        onClick={this.createReplaceSelectionHandler('`', '`')}
      >
        <EditorIcon icon="InlineCode" />
      </Button>,
      <Button
        key="nav-item-quote"
        color={null}
        size="sm"
        title="Quote"
        onClick={this.createAddPrefixToEachLinesHandler('> ')}
      >
        <EditorIcon icon="Quote" />
      </Button>,
      <Button
        key="nav-item-ul"
        color={null}
        size="sm"
        title="List"
        onClick={this.createAddPrefixToEachLinesHandler('- ')}
      >
        <EditorIcon icon="List" />
      </Button>,
      <Button
        key="nav-item-ol"
        color={null}
        size="sm"
        title="Numbered List"
        onClick={this.createAddPrefixToEachLinesHandler('1. ')}
      >
        <EditorIcon icon="NumberedList" />
      </Button>,
      <Button
        key="nav-item-checkbox"
        color={null}
        size="sm"
        title="Check List"
        onClick={this.createAddPrefixToEachLinesHandler('- [ ] ')}
      >
        <EditorIcon icon="CheckList" />
      </Button>,
      <Button
        key="nav-item-link"
        color={null}
        size="sm"
        title="Link"
        onClick={this.showLinkEditHandler}
      >
        <EditorIcon icon="Link" />
      </Button>,
      <Button
        key="nav-item-image"
        color={null}
        size="sm"
        title="Image"
        onClick={this.createReplaceSelectionHandler('![', ']()')}
      >
        <EditorIcon icon="Image" />
      </Button>,
      <Button
        key="nav-item-grid"
        color={null}
        size="sm"
        title="Grid"
        onClick={this.showGridEditorHandler}
      >
        <EditorIcon icon="Grid" />
      </Button>,
      <Button
        key="nav-item-table"
        color={null}
        size="sm"
        title="Table"
        onClick={this.showHandsonTableHandler}
      >
        <EditorIcon icon="Table" />
      </Button>,
      <Button
        key="nav-item-drawio"
        color={null}
        bssize="small"
        title="draw.io"
        onClick={this.showDrawioHandler}
      >
        <EditorIcon icon="Drawio" />
      </Button>,
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
            // theme: this.props.editorOptions.theme,
            // styleActiveLine: this.props.editorOptions.styleActiveLine,
            lineNumbers: this.props.lineNumbers,
            tabSize: 4,
            indentUnit: this.props.indentSize,
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
        {/*
        { this.renderLoadingKeymapOverlay() }

        { this.renderCheatsheetOverlay() }

        <GridEditModal
          ref={this.gridEditModal}
          onSave={(grid) => { return geu.replaceGridWithHtmlWithEditor(this.getCodeMirror(), grid) }}
        />
        <LinkEditModal
          ref={this.linkEditModal}
          onSave={(linkText) => { return mlu.replaceFocusedMarkdownLinkWithEditor(this.getCodeMirror(), linkText) }}
        />
        <HandsontableModal
          ref={this.handsontableModal}
          onSave={(table) => { return mtu.replaceFocusedMarkdownTableWithEditor(this.getCodeMirror(), table) }}
          ignoreAutoFormatting={this.props.editorOptions.ignoreMarkdownTableAutoFormatting}
        />
        <DrawioModal
          ref={this.drawioModal}
          onSave={(drawioData) => { return mdu.replaceFocusedDrawioWithEditor(this.getCodeMirror(), drawioData) }}
        /> */}

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
