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
require('codemirror/addon/search/match-highlighter');
require('codemirror/addon/scroll/annotatescrollbar');
require('codemirror/mode/gfm/gfm');
require('codemirror/theme/eclipse.css');

require('../../../../local_modules/codemirror-markdown-list-autoindentlist');


export default class Editor extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value,
    };

    this.getCodeMirror = this.getCodeMirror.bind(this);
    this.setCaretLine = this.setCaretLine.bind(this);
    this.forceToFocus = this.forceToFocus.bind(this);
    this.dispatchSave = this.dispatchSave.bind(this);
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

  render() {
    return (
      <ReactCodeMirror
        ref="cm"
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
            "Tab": "autoIndentMarkdownList",
          }
        }}
        onScroll={(editor, data) => {
          if (this.props.onScroll != null) {
            this.props.onScroll(editor, data);
          }
        }}
        onChange={(editor, data, value) => {
          if (this.props.onChange != null) {
            this.props.onChange(value);
          }
        }}
      />
    )
  }

}

Editor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onScroll: PropTypes.func,
  onSave: PropTypes.func,
};
