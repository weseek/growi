// workaround to use ref with dynamically imported components
// see: https://github.com/vercel/next.js/issues/4957#issuecomment-783482041

import React, { Ref } from 'react';

import { IEditorMethods } from '~/interfaces/editor-methods';

import Editor, { EditorPropsType } from './Editor';

type Props = EditorPropsType & {
  editorRef: Ref<IEditorMethods>,
}

const WrappedEditor = (props: Props): JSX.Element => {
  return <Editor {...props} ref={props.editorRef} />;
};

export default WrappedEditor;
