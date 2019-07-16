import React from 'react';
import PropTypes from 'prop-types';

import { UnControlled as CodeMirror } from 'react-codemirror2';

require('codemirror/addon/hint/show-hint');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/edit/closebrackets');
require('codemirror/mode/htmlmixed/htmlmixed');
require('../../util/codemirror/autorefresh.ext');

require('jquery-ui/ui/widgets/resizable');

export default class CustomHeaderEditor extends React.Component {

  render() {
    // get initial value from inputElem
    const value = this.props.inputElem.value;

    return (
      <CodeMirror
        value={value}
        autoFocus
        options={{
          mode: 'htmlmixed',
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
          this.props.inputElem.value = value;
        }}
      />
    );
  }

}

CustomHeaderEditor.propTypes = {
  inputElem: PropTypes.object.isRequired,
};
