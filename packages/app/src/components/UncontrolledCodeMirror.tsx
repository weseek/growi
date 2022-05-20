import React, { forwardRef, ReactNode, Ref } from 'react';

import { ICodeMirror, UnControlled as CodeMirror } from 'react-codemirror2';

import AbstractEditor, { AbstractEditorProps } from '~/components/PageEditor/AbstractEditor';
import { DEFAULT_THEME } from '~/interfaces/editor-settings';
import { useEditorSettings } from '~/stores/editor';

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
  theme?: string,
  styleActiveLine?: boolean,
}

class UncontrolledCodeMirrorCore extends AbstractEditor<UncontrolledCodeMirrorCoreProps> {

  render(): ReactNode {

    const {
      value, isGfmMode, lineNumbers, options, forwardedRef,
      theme, styleActiveLine,
      ...rest
    } = this.props;

    return (
      <CodeMirror
        ref={forwardedRef}
        value={value}
        options={{
          lineNumbers: lineNumbers ?? true,
          mode: isGfmMode ? 'gfm-growi' : undefined,
          theme: theme ?? DEFAULT_THEME,
          styleActiveLine,
          tabSize: 4,
          ...options,
        }}
        {...rest}
      />
    );
  }

}

export const UncontrolledCodeMirror = forwardRef<UncontrolledCodeMirrorCore, UncontrolledCodeMirrorProps>((props, ref) => {
  const { data: editorSettings } = useEditorSettings();

  return (
    <UncontrolledCodeMirrorCore
      {...props}
      forwardedRef={ref}
      theme={editorSettings?.theme}
      styleActiveLine={editorSettings?.styleActiveLine}
    />
  );
});
