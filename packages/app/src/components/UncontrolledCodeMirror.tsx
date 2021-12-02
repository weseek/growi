import React, { forwardRef, ReactNode, Ref } from 'react';
import { ICodeMirror, UnControlled as CodeMirror } from 'react-codemirror2';
import { Container, Subscribe } from 'unstated';
import EditorContainer from '~/client/services/EditorContainer';
import AbstractEditor, { AbstractEditorProps } from '~/components/PageEditor/AbstractEditor';

window.CodeMirror = require('codemirror');
require('codemirror/addon/display/placeholder');
require('~/client/util/codemirror/gfm-growi.mode');

export interface UncontrolledCodeMirrorProps extends AbstractEditorProps {
  value: string;
  options?: ICodeMirror['options'];
  isGfmMode?: boolean;
  indentSize?: number;
  lineNumbers?: boolean;
}

interface UncontrolledCodeMirrorCoreProps extends UncontrolledCodeMirrorProps {
  editorContainer: Container<EditorContainer>;
  forwardedRef: Ref<UncontrolledCodeMirrorCore>;
}

export class UncontrolledCodeMirrorCore extends AbstractEditor<UncontrolledCodeMirrorCoreProps> {

  render(): ReactNode {

    const {
      value, isGfmMode, indentSize, lineNumbers, editorContainer, options, forwardedRef, ...rest
    } = this.props;

    const { editorOptions } = editorContainer.state;

    return (
      <CodeMirror
        ref={forwardedRef}
        value={value}
        options={{
          lineNumbers: lineNumbers ?? true,
          mode: isGfmMode ? 'gfm-growi' : undefined,
          theme: editorOptions.theme,
          styleActiveLine: editorOptions.styleActiveLine,
          tabSize: 4,
          indentUnit: indentSize,
          ...options,
        }}
        {...rest}
      />
    );
  }

}

export const UncontrolledCodeMirror = forwardRef<UncontrolledCodeMirrorCore, UncontrolledCodeMirrorProps>((props, ref) => (
  <Subscribe to={[EditorContainer]}>
    {(EditorContainer: Container<EditorContainer>) => <UncontrolledCodeMirrorCore {...props} forwardedRef={ref} editorContainer={EditorContainer} />}
  </Subscribe>
));
