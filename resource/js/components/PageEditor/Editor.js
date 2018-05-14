import React from 'react';
import PropTypes from 'prop-types';

import urljoin from 'url-join';
const loadScript = require('simple-load-script');
const loadCssSync = require('load-css-file');

import * as codemirror from 'codemirror';
import mtu from './MarkdownTableUtil';

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


import Dropzone from 'react-dropzone';

import pasteHelper from './PasteHelper';
import EmojiAutoCompleteHelper from './EmojiAutoCompleteHelper';

import InterceptorManager from '../../../../lib/util/interceptor-manager';

import MarkdownListInterceptor from './MarkdownListInterceptor';
import MarkdownTableInterceptor from './MarkdownTableInterceptor';

export default class Editor extends React.Component {

  constructor(props) {
    super(props);

    this.cmCdnRoot = 'https://cdn.jsdelivr.net/npm/codemirror@5.37.0';

    this.interceptorManager = new InterceptorManager();
    this.interceptorManager.addInterceptors([
      new MarkdownListInterceptor(),
      new MarkdownTableInterceptor(),
    ]);

    this.state = {
      value: this.props.value,
      dropzoneActive: false,
      isEnabledEmojiAutoComplete: false,
      isUploading: false,
      isLoadingKeymap: false,
    };

    this.loadedThemeSet = new Set(['eclipse', 'elegant']);   // themes imported in _vendor.scss
    this.loadedKeymapSet = new Set();

    this.getCodeMirror = this.getCodeMirror.bind(this);
    this.setCaretLine = this.setCaretLine.bind(this);
    this.setScrollTopByLine = this.setScrollTopByLine.bind(this);
    this.loadTheme = this.loadTheme.bind(this);
    this.loadKeymapMode = this.loadKeymapMode.bind(this);
    this.setKeymapMode = this.setKeymapMode.bind(this);
    this.forceToFocus = this.forceToFocus.bind(this);
    this.dispatchSave = this.dispatchSave.bind(this);
    this.handleEnterKey = this.handleEnterKey.bind(this);

    this.onScrollCursorIntoView = this.onScrollCursorIntoView.bind(this);
    this.onPaste = this.onPaste.bind(this);

    this.onDragEnterForCM = this.onDragEnterForCM.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);

    this.getDropzoneAccept = this.getDropzoneAccept.bind(this);
    this.getDropzoneClassName = this.getDropzoneClassName.bind(this);
    this.renderDropzoneOverlay = this.renderDropzoneOverlay.bind(this);

    this.renderLoadingKeymapOverlay = this.renderLoadingKeymapOverlay.bind(this);
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

  loadCss(source) {
    return new Promise((resolve) => {
      loadCssSync(source);
      resolve();
    });
  }

  forceToFocus() {
    const editor = this.getCodeMirror();
    // use setInterval with reluctance -- 2018.01.11 Yuki Takei
    const intervalId = setInterval(() => {
      this.getCodeMirror().focus();
      if (editor.hasFocus()) {
        clearInterval(intervalId);
      }
    }, 100);
  }

  /**
   * set caret position of codemirror
   * @param {string} number
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
   * scroll
   * @param {number} line
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
   * remove overlay and set isUploading to false
   */
  terminateUploadingState() {
    this.setState({
      dropzoneActive: false,
      isUploading: false,
    });
  }

  /**
   * insert text
   * @param {string} text
   */
  insertText(text) {
    const editor = this.getCodeMirror();
    editor.getDoc().replaceSelection(text);
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
   * dispatch onUpload event
   */
  dispatchUpload(files) {
    if (this.props.onUpload != null) {
      this.props.onUpload(files);
    }
  }

  /**
   * handle ENTER key
   */
  handleEnterKey() {

    const editor = this.getCodeMirror();
    var context = {
      handlers: [],  // list of handlers which process enter key
      editor: editor,
    };

    const interceptorManager = this.interceptorManager;
    interceptorManager.process('preHandleEnter', context)
      .then(() => {
        if (context.handlers.length == 0) {
          codemirror.commands.newlineAndIndentContinueMarkdownList(editor);
        }
      });
  }

  onScrollCursorIntoView(editor, event) {
    if (this.props.onScrollCursorIntoView != null) {
      const line = editor.getCursor().line;
      this.props.onScrollCursorIntoView(line);
    }
  }

  /**
   * CodeMirror paste event handler
   * see: https://codemirror.net/doc/manual.html#events
   * @param {any} editor An editor instance of CodeMirror
   * @param {any} event
   */
  onPaste(editor, event) {
    const types = event.clipboardData.types;

    // text
    if (types.includes('text/plain')) {
      pasteHelper.pasteText(editor, event);
    }
    // files
    else if (types.includes('Files')) {
      const dropzone = this.refs.dropzone;
      const items = event.clipboardData.items || event.clipboardData.files || [];

      // abort if length is not 1
      if (items.length != 1) {
        return;
      }

      const file = items[0].getAsFile();
      // check type and size
      if (pasteHelper.fileAccepted(file, dropzone.props.accept) &&
          pasteHelper.fileMatchSize(file, dropzone.props.maxSize, dropzone.props.minSize)) {

        this.dispatchUpload(file);
        this.setState({ isUploading: true });
      }
    }
  }

  onDragEnterForCM(editor, event) {
    const dataTransfer = event.dataTransfer;

    // do nothing if contents is not files
    if (!dataTransfer.types.includes('Files')) {
      return;
    }

    this.setState({ dropzoneActive: true });
  }

  onDragLeave() {
    this.setState({ dropzoneActive: false });
  }

  onDrop(accepted, rejected) {
    // rejected
    if (accepted.length != 1) { // length should be 0 or 1 because `multiple={false}` is set
      this.setState({ dropzoneActive: false });
      return;
    }

    const file = accepted[0];
    this.dispatchUpload(file);
    this.setState({ isUploading: true });
  }

  getDropzoneAccept() {
    let accept = 'null';    // reject all
    if (this.props.isUploadable) {
      if (!this.props.isUploadableFile) {
        accept = 'image/*'; // image only
      }
      else {
        accept = '';        // allow all
      }
    }

    return accept;
  }

  getDropzoneClassName() {
    let className = 'dropzone';
    if (!this.props.isUploadable) {
      className += ' dropzone-unuploadable';
    }
    else {
      className += ' dropzone-uploadable';

      if (this.props.isUploadableFile) {
        className += ' dropzone-uploadablefile';
      }
    }

    // uploading
    if (this.state.isUploading) {
      className += ' dropzone-uploading';
    }

    return className;
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

  renderDropzoneOverlay() {
    const overlayStyle = this.getOverlayStyle();

    return (
      <div style={overlayStyle} className="overlay">
        {this.state.isUploading &&
          <span className="overlay-content">
            <div className="speeding-wheel d-inline-block"></div>
            <span className="sr-only">Uploading...</span>
          </span>
        }
        {!this.state.isUploading && <span className="overlay-content"></span>}
      </div>
    );
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
    const flexContainer = {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    };

    const theme = this.props.editorOptions.theme || 'elegant';
    const styleActiveLine = this.props.editorOptions.styleActiveLine || undefined;
    return <React.Fragment>
      <div style={flexContainer}>
        <Dropzone
          ref="dropzone"
          disableClick
          disablePreview={true}
          accept={this.getDropzoneAccept()}
          className={this.getDropzoneClassName()}
          acceptClassName="dropzone-accepted"
          rejectClassName="dropzone-rejected"
          multiple={false}
          onDragLeave={this.onDragLeave}
          onDrop={this.onDrop}
        >
          { this.state.dropzoneActive && this.renderDropzoneOverlay() }

          <ReactCodeMirror
            ref="cm"
            editorDidMount={(editor) => {
              // add event handlers
              editor.on('paste', this.onPaste);
              editor.on('scrollCursorIntoView', this.onScrollCursorIntoView);
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
                'Ctrl-Q': (cm) => { cm.foldCode(cm.getCursor()); },
              }
            }}
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
            onCursor={(editor, event) => {
              const strFromBol = mtu.getStrFromBol(editor);
              if (mtu.isEndOfLine(editor) && mtu.linePartOfTableRE.test(strFromBol)){
              console.log("console.log()")
              }
              }}
            onDragEnter={this.onDragEnterForCM}
          />
        </Dropzone>

        <button type="button" className="btn btn-default btn-block btn-open-dropzone"
          onClick={() => {this.refs.dropzone.open();}}>

          <i className="icon-paper-clip" aria-hidden="true"></i>&nbsp;
          Attach files by dragging &amp; dropping,&nbsp;
          <span className="btn-link">selecting them</span>,&nbsp;
          or pasting from the clipboard.
        </button>

        { this.renderLoadingKeymapOverlay() }

      </div>

    </React.Fragment>;
  }

}

Editor.propTypes = {
  value: PropTypes.string,
  options: PropTypes.object,
  editorOptions: PropTypes.object,
  isUploadable: PropTypes.bool,
  isUploadableFile: PropTypes.bool,
  emojiStrategy: PropTypes.object,
  onChange: PropTypes.func,
  onScroll: PropTypes.func,
  onScrollCursorIntoView: PropTypes.func,
  onSave: PropTypes.func,
  onUpload: PropTypes.func,
};

