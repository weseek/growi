import React from 'react';
import PropTypes from 'prop-types';

import * as codemirror from 'codemirror';

import { UnControlled as ReactCodeMirror } from 'react-codemirror2';
require('codemirror/lib/codemirror.css');
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

require('codemirror/theme/elegant.css');
require('codemirror/theme/neo.css');
require('codemirror/theme/mdn-like.css');
require('codemirror/theme/material.css');
require('codemirror/theme/monokai.css');
require('codemirror/theme/twilight.css');


import Dropzone from 'react-dropzone';

import pasteHelper from './PasteHelper';
import markdownListHelper from './MarkdownListHelper';
import emojiAutoCompleteHelper from './EmojiAutoCompleteHelper';


export default class Editor extends React.Component {

  constructor(props) {
    super(props);

    // https://regex101.com/r/7BN2fR/2
    this.indentAndMarkPattern = /^([ \t]*)(?:>|\-|\+|\*|\d+\.) /;

    this.state = {
      value: this.props.value,
      dropzoneActive: false,
      isUploading: false,
    };

    this.getCodeMirror = this.getCodeMirror.bind(this);
    this.setCaretLine = this.setCaretLine.bind(this);
    this.setScrollTopByLine = this.setScrollTopByLine.bind(this);
    this.forceToFocus = this.forceToFocus.bind(this);
    this.dispatchSave = this.dispatchSave.bind(this);

    this.onScrollCursorIntoView = this.onScrollCursorIntoView.bind(this);
    this.onPaste = this.onPaste.bind(this);

    this.onDragEnterForCM = this.onDragEnterForCM.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);

    this.getDropzoneAccept = this.getDropzoneAccept.bind(this);
    this.getDropzoneClassName = this.getDropzoneClassName.bind(this);
    this.renderOverlay = this.renderOverlay.bind(this);
  }

  componentDidMount() {
    // initialize caret line
    this.setCaretLine(0);
    // set save handler
    codemirror.commands.save = this.dispatchSave;
  }

  getCodeMirror() {
    return this.refs.cm.editor;
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
        accept = 'image/*'  // image only
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

  renderOverlay() {
    const overlayStyle = {
      position: 'absolute',
      zIndex: 1060, // FIXME: required because .content-main.on-edit has 'z-index:1050'
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    };

    return (
      <div style={overlayStyle} className="dropzone-overlay">
        {this.state.isUploading &&
          <span className="dropzone-overlay-content">
            <i className="fa fa-spinner fa-pulse fa-fw"></i>
            <span className="sr-only">Uploading...</span>
          </span>
        }
        {!this.state.isUploading && <span className="dropzone-overlay-content"></span>}
      </div>
    );
  }

  render() {
    const flexContainer = {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }
    const expandHeight = {
      height: 'calc(100% - 20px)'
    }

    const theme = this.props.editorOptions.theme || 'elegant';
    const styleActiveLine = this.props.editorOptions.styleActiveLine || undefined;
    return (
      <div style={flexContainer}>
        <Dropzone
          ref="dropzone"
          disableClick
          disablePreview={true}
          style={expandHeight}
          accept={this.getDropzoneAccept()}
          className={this.getDropzoneClassName()}
          acceptClassName="dropzone-accepted"
          rejectClassName="dropzone-rejected"
          multiple={false}
          onDragLeave={this.onDragLeave}
          onDrop={this.onDrop}
        >
          { this.state.dropzoneActive && this.renderOverlay() }

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
              gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
              // match-highlighter, matchesonscrollbar, annotatescrollbar options
              highlightSelectionMatches: {annotateScrollbar: true},
              // markdown mode options
              highlightFormatting: true,
              // continuelist, indentlist
              extraKeys: {
                "Enter": markdownListHelper.newlineAndIndentContinueMarkdownList,
                "Tab": "indentMore",
                "Shift-Tab": "indentLess",
                "Ctrl-Q": (cm) => { cm.foldCode(cm.getCursor()) },
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
              emojiAutoCompleteHelper.showHint(editor);
            }}
            onDragEnter={this.onDragEnterForCM}
          />
        </Dropzone>

        <button type="button" className="btn btn-default btn-block btn-open-dropzone"
            onClick={() => {this.refs.dropzone.open()}}>

          <i className="fa fa-paperclip" aria-hidden="true"></i>&nbsp;
          Attach files by dragging &amp; dropping,&nbsp;
          <span className="btn-link">selecting them</span>,&nbsp;
          or pasting from the clipboard.
        </button>
      </div>
    )
  }

}

Editor.propTypes = {
  value: PropTypes.string,
  options: PropTypes.object,
  isUploadable: PropTypes.bool,
  isUploadableFile: PropTypes.bool,
  onChange: PropTypes.func,
  onScroll: PropTypes.func,
  onScrollCursorIntoView: PropTypes.func,
  onSave: PropTypes.func,
  onUpload: PropTypes.func,
};

