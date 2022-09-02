import React, {
  forwardRef, ReactNode, Ref,
} from 'react';

import { Editor } from 'codemirror';
import { ICodeMirror, UnControlled as CodeMirror } from 'react-codemirror2';

import AbstractEditor, { AbstractEditorProps } from '~/components/PageEditor/AbstractEditor';

window.CodeMirror = require('codemirror');
require('codemirror/addon/display/placeholder');
require('~/client/util/codemirror/gfm-growi.mode');

export interface UncontrolledCodeMirrorProps extends AbstractEditorProps {
  value: string;
  options?: ICodeMirror['options'];
  isGfmMode?: boolean;
  lineNumbers?: boolean;
}

interface UncontrolledCodeMirrorCoreProps extends UncontrolledCodeMirrorProps {
  forwardedRef: Ref<UncontrolledCodeMirrorCore>;
}

export class UncontrolledCodeMirrorCore extends AbstractEditor<UncontrolledCodeMirrorCoreProps> {

  editor: Editor;

  // wrapperRef: RefObject<any>;

  constructor(props: UncontrolledCodeMirrorCoreProps) {
    super(props);
    this.editorDidMount = this.editorDidMount.bind(this);
    this.editorWillUnmount = this.editorWillUnmount.bind(this);
  }

  editorDidMount(e: Editor): void {
    this.editor = e;
  }

  editorWillUnmount(): void {
    // workaround to fix editor duplicating by https://github.com/scniro/react-codemirror2/issues/284#issuecomment-1155928554
    (this.editor as any).display.wrapper.remove();
  }

  override render(): ReactNode {

    const {
      value, isGfmMode, lineNumbers, options, forwardedRef,
      ...rest
    } = this.props;

    return (
      <CodeMirror
        ref={forwardedRef}
        value={value}
        options={{
          lineNumbers: lineNumbers ?? true,
          mode: isGfmMode ? 'gfm-growi' : undefined,
          tabSize: 4,
          ...options,
        }}
        editorDidMount={this.editorDidMount}
        editorWillUnmount={this.editorWillUnmount}
        {...rest}
      />
    );
  }

}

export const UncontrolledCodeMirror = forwardRef<UncontrolledCodeMirrorCore, UncontrolledCodeMirrorProps>((props, ref) => {
  return (
    <UncontrolledCodeMirrorCore
      {...props}
      forwardedRef={ref}
    />
  );
});

UncontrolledCodeMirror.displayName = 'UncontrolledCodeMirror';
