import { useEffect, useState } from 'react';

import { ViewUpdate } from '@codemirror/view';
import { EditorView } from 'codemirror';


import { UseCodeMirrorEditor } from '../codemirror-editor';

import { isInTable } from './insert-new-row-to-table-markdown';

const markdownTableActivatedClass = 'markdown-table-activated';

export const useShowTableIcon = (codeMirrorEditor?: UseCodeMirrorEditor): { editorClass: string } => {

  const [editorClass, setEditorClass] = useState('');

  const editor = codeMirrorEditor?.view;

  useEffect(() => {

    const handleFocusChanged = () => {
      if (editor == null) {
        return;
      }
      if (isInTable(editor)) {
        setEditorClass(markdownTableActivatedClass);
      }
      else {
        setEditorClass('');
      }
    };

    const cursorPositionListener = EditorView.updateListener.of((v: ViewUpdate) => {
      if (v.transactions.some(tr => tr.selection || tr.docChanged)) {
        handleFocusChanged();
      }
    });

    // const extension = editor?.dispatch({
    //   effects: StateEffect.appendConfig.of(cursorPositionListener),
    // });

    const cleanupFunction = codeMirrorEditor?.appendExtensions(cursorPositionListener);

    return cleanupFunction;

  }, [codeMirrorEditor, editor]);

  return { editorClass };

};
