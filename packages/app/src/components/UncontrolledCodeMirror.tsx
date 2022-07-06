import React, { forwardRef, ReactNode, Ref } from 'react';

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

class UncontrolledCodeMirrorCore extends AbstractEditor<UncontrolledCodeMirrorCoreProps> {

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
