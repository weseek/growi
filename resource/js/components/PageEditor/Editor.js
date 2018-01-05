import React from 'react';
import PropTypes from 'prop-types';

import { UnControlled as CodeMirror } from 'react-codemirror2';
require('codemirror/lib/codemirror.css');
require('codemirror/addon/display/autorefresh');
require('codemirror/addon/edit/matchtags');
require('codemirror/addon/edit/closetag');
require('codemirror/addon/edit/continuelist');
require('codemirror/addon/edit/indentlist');
require('codemirror/mode/gfm/gfm');
require('codemirror/theme/eclipse.css');


export default class Editor extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value,
    };
  }

  render() {
    return (
      <CodeMirror
        value={this.state.value}
        autoFocus={true}
        options={{
          mode: 'gfm',
          theme: 'eclipse',
          lineNumbers: true,
          tabSize: 4,
          indentUnit: 4,
          autoRefresh: true,
          autoCloseTags: true,
          matchTags: {bothTags: true},
          lineWrapping: true,
          // markdown mode options
          highlightFormatting: true,
          // continuelist, indentlist
          extraKeys: {
            "Enter": "newlineAndIndentContinueMarkdownList",
            "Tab": "autoIndentMarkdownList",
            "Shift-Tab": "autoUnindentMarkdownList"
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
};
