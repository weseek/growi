import React, {
  useCallback, useRef, MutableRefObject,
} from 'react';

import { commands, Editor } from 'codemirror';
import { ICodeMirror, UnControlled as CodeMirror } from 'react-codemirror2';

// set save handler
// CommandActions in @types/codemirror does not include 'save' but actualy exists
// https://codemirror.net/5/doc/manual.html#commands
(commands as any).save = (instance) => {
  if (instance.codeMirrorEditor != null) {
    instance.codeMirrorEditor.dispatchSave();
  }
};

window.CodeMirror = require('codemirror');
require('codemirror/addon/display/placeholder');
require('~/client/util/codemirror/gfm-growi.mode');

export interface UncontrolledCodeMirrorProps extends ICodeMirror {
  value: string;
  isGfmMode?: boolean;
  lineNumbers?: boolean;
  onSave?: () => Promise<void>;
  onCtrlEnter?: (event: Event) => void;
  onPasteFiles?: (editor: any, event: Event) => void;
  onScrollCursorIntoView?: (editor: any, event: Event) => void;
}

export const UncontrolledCodeMirror = React.forwardRef<CodeMirror|null, UncontrolledCodeMirrorProps>((props, forwardedRef): JSX.Element => {

  const {
    value, lineNumbers, options,
    onPasteFiles, onScrollCursorIntoView,
    ...rest
  } = props;

  const editorRef = useRef<Editor>();

  const wrapperRef = useRef<CodeMirror|null>();

  const editorDidMountHandler = useCallback((editor: Editor): void => {
    editorRef.current = editor;
    if (onPasteFiles != null) {
      editor.on('paste', onPasteFiles);
    }
    if (onScrollCursorIntoView != null) {
      editor.on('scrollCursorIntoView', onScrollCursorIntoView);
    }
  }, [onPasteFiles, onScrollCursorIntoView]);

  const editorWillUnmountHandler = useCallback((): void => {
    // workaround to fix editor duplicating by https://github.com/scniro/react-codemirror2/issues/284#issuecomment-1155928554
    if (editorRef.current != null) {
      (editorRef.current as any).display.wrapper.remove();
    }
    if (wrapperRef.current != null) {
      (wrapperRef.current as any).hydrated = false;
    }
  }, []);

  // default true
  const isGfmMode = rest.isGfmMode ?? true;

  return (
    <CodeMirror
      ref={(elem) => {
        // register to wrapperRef
        wrapperRef.current = elem;
        // register to forwardedRef
        if (forwardedRef != null) {
          if (typeof forwardedRef === 'function') {
            forwardedRef(elem);
          }
          else {
            (forwardedRef as MutableRefObject<CodeMirror|null>).current = elem;
          }
        }
      }}
      value={value}
      options={{
        lineNumbers: lineNumbers ?? true,
        mode: isGfmMode ? 'gfm-growi' : undefined,
        tabSize: 4,
        ...options,
      }}
      editorDidMount={editorDidMountHandler}
      editorWillUnmount={editorWillUnmountHandler}
      {...rest}
    />
  );

});

UncontrolledCodeMirror.displayName = 'UncontrolledCodeMirror';
