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
require('codemirror/addon/scroll/annotatescrollbar');
require('codemirror/mode/gfm/gfm');
require('codemirror/theme/eclipse.css');

import Dropzone from 'react-dropzone';

import pasteHelper from './PasteHelper';
import emojiAutoCompleteHelper from './EmojiAutoCompleteHelper';


export default class Editor extends React.Component {

  constructor(props) {
    super(props);

    // https://regex101.com/r/7BN2fR/2
    this.indentAndMarkPattern = /^([ \t]*)(?:>|\-|\+|\*|\d+\.) /;

    this.state = {
      value: this.props.value,
      dropzoneAccept: '',
      dropzoneActive: false,
    };

    this.getCodeMirror = this.getCodeMirror.bind(this);
    this.setCaretLine = this.setCaretLine.bind(this);
    this.forceToFocus = this.forceToFocus.bind(this);
    this.dispatchSave = this.dispatchSave.bind(this);

    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);
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
    const editor = this.getCodeMirror();
    editor.setCursor({line: line-1});   // leave 'ch' field as null/undefined to indicate the end of line
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

  onDragEnter() {
    this.setState({
      dropzoneActive: true
    });
  }

  onDragLeave() {
    this.setState({
      dropzoneActive: false
    });
  }

  onDrop(files) {
    this.setState({
      dropzoneActive: false
    });
    this.dispatchUpload(files);
  }

  render() {
    const dropzoneStyle = {
      height: '100%'
    }

    const overlayStyle = {
      position: 'absolute',
      zIndex: 1060,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      padding: '2.5em 0',
      background: 'rgba(0,0,0,0.5)',
      textAlign: 'center',
      color: '#fff'
    };

    return (
      <Dropzone
        disableClick
        style={dropzoneStyle}
        accept={this.state.accept}
        onDragLeave={this.onDragLeave}
        onDrop={this.onDrop}
      >
        { this.state.dropzoneActive && <div style={overlayStyle}>Drop files...</div> }
        <ReactCodeMirror
          ref="cm"
          editorDidMount={(editor) => {
            // add paste event handler
            editor.on('paste', pasteHelper.pasteHandler);
          }}
          value={this.state.value}
          options={{
            mode: 'gfm',
            theme: 'eclipse',
            lineNumbers: true,
            tabSize: 4,
            indentUnit: 4,
            lineWrapping: true,
            autoRefresh: true,
            autoCloseTags: true,
            matchBrackets: true,
            matchTags: {bothTags: true},
            // match-highlighter, matchesonscrollbar, annotatescrollbar options
            highlightSelectionMatches: {annotateScrollbar: true},
            // markdown mode options
            highlightFormatting: true,
            // continuelist, indentlist
            extraKeys: {
              "Enter": "newlineAndIndentContinueMarkdownList",
              "Tab": "indentMore",
              "Shift-Tab": "indentLess",
            }
          }}
          onScroll={(editor, data) => {
            if (this.props.onScroll != null) {
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
          onDragEnter={this.onDragEnter}
        />
      </Dropzone>
    )
  }

}

Editor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onScroll: PropTypes.func,
  onSave: PropTypes.func,
  onUpload: PropTypes.func,
};
