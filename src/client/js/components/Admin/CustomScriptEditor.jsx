import React from 'react';
import PropTypes from 'prop-types';

import { UnControlled as CodeMirror } from 'react-codemirror2';

require('codemirror/addon/lint/javascript-lint');
require('codemirror/addon/hint/javascript-hint');
require('codemirror/addon/hint/show-hint');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/edit/closebrackets');
require('codemirror/mode/javascript/javascript');
require('../../util/codemirror/autorefresh.ext');

require('jquery-ui/ui/widgets/resizable');

export default class CustomScriptEditor extends React.Component {

  render() {

    return (
      <CodeMirror
        value={this.props.value}
        autoFocus
        options={{
          mode: 'javascript',
          lineNumbers: true,
          tabSize: 2,
          indentUnit: 2,
          theme: 'eclipse',
          autoRefresh: { force: true }, // force option is enabled by autorefresh.ext.js -- Yuki Takei
          matchBrackets: true,
          autoCloseBrackets: true,
          extraKeys: { 'Ctrl-Space': 'autocomplete' },
        }}
        editorDidMount={(editor, next) => {
          // resizable with jquery.ui
          $(editor.getWrapperElement()).resizable({
            resize() {
              editor.setSize($(this).width(), $(this).height());
            },
          });
        }}
        onChange={(editor, data, value) => {
          this.props.onChange(value);
        }}
      />
    );
  }

}

CustomScriptEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
