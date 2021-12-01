import React, { FC, ReactNode } from 'react';
import { ICodeMirror, UnControlled as CodeMirror } from 'react-codemirror2';
import { Container, Subscribe } from 'unstated';
import EditorContainer from '~/client/services/EditorContainer';
import AbstractEditor, { AbstractEditorProps } from '~/components/PageEditor/AbstractEditor';

window.CodeMirror = require('codemirror');
require('codemirror/addon/display/placeholder');
require('~/client/util/codemirror/gfm-growi.mode');

export interface UncontrolledCodeMirrorProps extends AbstractEditorProps {
  value: string;
  isGfmMode?: boolean;
  indentSize?: number;
  placeholder?: string;
  lineNumbers?: boolean;
  onChange: ICodeMirror['onChange'];
}

interface UncontrolledCodeMirrorCoreProps extends UncontrolledCodeMirrorProps {
  editorContainer: Container<EditorContainer>;
}

class UncontrolledCodeMirrorCore extends AbstractEditor<UncontrolledCodeMirrorCoreProps> {

  render(): ReactNode {
    const { editorOptions } = this.props.editorContainer.state;
    console.log(editorOptions);

    return (
      <CodeMirror
        value={this.props.value}
        options={{
          lineNumbers: this.props.lineNumbers ?? true,
          mode: this.props.isGfmMode ? 'gfm-growi' : undefined,
          theme: editorOptions.theme,
          styleActiveLine: editorOptions.styleActiveLine,
          tabSize: 4,
          indentUnit: this.props.indentSize,
          placeholder: this.props.placeholder,
        }}
        onChange={this.props.onChange}
      />
    );
  }

}


export const UncontrolledCodeMirror: FC<UncontrolledCodeMirrorProps> = props => (
  <Subscribe to={[EditorContainer]}>
    {(EditorContainer: Container<EditorContainer>) => <UncontrolledCodeMirrorCore {...props} editorContainer={EditorContainer} />}
  </Subscribe>
);
