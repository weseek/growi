import React from 'react';
import PropTypes from 'prop-types';

import { UnControlled as CodeMirror } from 'react-codemirror2';
require('codemirror/addon/display/autorefresh');
require('codemirror/mode/gfm/gfm');
require('codemirror/lib/codemirror.css');

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
          lineNumbers: true,
          autoRefresh: true
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
