import React from 'react';

import { UnControlled as CodeMirror, IUnControlledCodeMirror } from 'react-codemirror2';
import { EditorConfiguration } from 'codemirror';

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
  autoFocus?: boolean
}
export declare class UnControlled2 extends React.Component<IMyUnControlledCodeMirror, any> {
}

type Props = {
  value: string,
  onChange: (value: string) => void,
};

const CustomScriptEditor = (props: Props): JSX.Element => {

  const { value, onChange } = props;

  return (
    <UnControlled2
      value={value}
      detach
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
        onChange(value);
      }}
    />
  );
};

export default CustomScriptEditor;
