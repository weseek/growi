import { useEffect } from 'react';

import {
  acceptChunk,
  rejectChunk,
} from '@codemirror/merge';
import { EditorView } from '@codemirror/view';

import type { UseCodeMirrorEditor } from '..';

export const acceptChange = (view: EditorView): boolean => {
  return acceptChunk(view);
};

export const rejectChange = (view: EditorView): boolean => {
  return rejectChunk(view);
};


type OnSelected = (selectedText: string, selectedTextFirstLineNumber: number) => void

export const useTextSelectionEffect = (codeMirrorEditor?: UseCodeMirrorEditor, onSelected?: OnSelected): void => {
  useEffect(() => {
    if (codeMirrorEditor == null) {
      return;
    }

    const extension = EditorView.updateListener.of((update) => {
      if (update.selectionSet) {
        const selection = update.state.selection.main;
        const selectedText = update.state.sliceDoc(selection.from, selection.to);
        const selectedTextFirstLineNumber = update.state.doc.lineAt(selection.from).number;
        onSelected?.(selectedText, selectedTextFirstLineNumber);
      }
    });

    const cleanup = codeMirrorEditor?.appendExtensions([extension]);

    return () => {
      cleanup?.();
    };
  }, [codeMirrorEditor, onSelected]);
};
