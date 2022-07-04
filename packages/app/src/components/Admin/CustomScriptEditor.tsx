import React from 'react';

import { EditorConfiguration } from 'codemirror';
import { IUnControlledCodeMirror, UnControlled as CodeMirror } from 'react-codemirror2';

require('codemirror/addon/lint/javascript-lint');
require('codemirror/addon/hint/javascript-hint');
require('codemirror/addon/hint/show-hint');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/edit/closebrackets');
require('codemirror/mode/javascript/javascript');
require('~/client/util/codemirror/autorefresh.ext');

require('jquery-ui/ui/widgets/resizable');

interface IMyUnControlledCodeMirror extends IUnControlledCodeMirror {
  options?: EditorConfiguration & {
    autoRefresh: { force: boolean }
  }
}
class CodeMirrorAlpha extends React.Component<IMyUnControlledCodeMirror, any> {
}

type MyUnControled = typeof CodeMirrorAlpha

const CodeMirror2 = CodeMirror as MyUnControled;

type Props = {
  value: string,
  onChange: (value: string) => void,
};

const CustomScriptEditor = (props: Props): JSX.Element => {

  const { value, onChange } = props;

  return (
    <CodeMirror2
      value={value}
      detach
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
        onChange(value);
      }}
    />
  );
};

export default CustomScriptEditor;
