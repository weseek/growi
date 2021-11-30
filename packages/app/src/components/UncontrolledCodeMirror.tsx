import React, { FC, ReactNode } from 'react';
import { ICodeMirror, UnControlled as CodeMirror } from 'react-codemirror2';
import { Subscribe } from 'unstated';
import { withUnstatedContainers } from './UnstatedUtils';
import EditorContainer from '~/client/services/EditorContainer';
import AbstractEditor, { AbstractEditorProps } from '~/components/PageEditor/AbstractEditor';

window.CodeMirror = require('codemirror');
require('codemirror/addon/display/placeholder');
require('~/client/util/codemirror/gfm-growi.mode');

export interface UncontrolledCodeMirrorProps extends AbstractEditorProps {
  value: string;
  // isGfmMode?: boolean;
  // indentSize?: number;
  // placeholder?: string;
  // lineNumbers?: boolean;
  // onChange: ICodeMirror['onChange'];
}

class UncontrolledCodeMirrorCore extends AbstractEditor<UncontrolledCodeMirrorProps> {

  render(): ReactNode {
    // const { editorOptions } = this.props.editorContainer.state;

    return (
      <CodeMirror
        value={this.props.value}
        options={{
          // lineNumbers: this.props.lineNumbers ?? true,
          // mode: this.props.isGfmMode ? 'gfm-growi' : undefined,
          // theme: editorOptions.theme,
          // styleActiveLine: editorOptions.styleActiveLine,
          tabSize: 4,
          // indentUnit: this.props.indentSize,
          // placeholder: this.props.placeholder,
        }}
        // onChange={this.props.onChange}
      />
    );
  }

}

// export default withUnstatedContainers(UncontrolledCodeMirrorCore, [EditorContainer]);

export const UncontrolledCodeMirror: FC<UncontrolledCodeMirrorProps> = props => (
  <Subscribe to={[EditorContainer]}>
    {editor => <UncontrolledCodeMirrorCore {...props} {...editor} />}
  </Subscribe>
);
