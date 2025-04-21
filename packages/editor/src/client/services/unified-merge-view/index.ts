import { useEffect } from 'react';

import {
  acceptChunk,
  getChunks,
} from '@codemirror/merge';
import type { ViewUpdate } from '@codemirror/view';
import { EditorView } from '@codemirror/view';

import type { UseCodeMirrorEditor } from '..';


export const acceptAllChunks = (view: EditorView): void => {
  // Get all chunks from the editor state
  const chunkData = getChunks(view.state);
  if (!chunkData || chunkData.chunks.length === 0) {
    return;
  }

  // Get all chunks and sort them in reverse order by position
  const chunks = [...chunkData.chunks].sort((a, b) => b.fromB - a.fromB);

  // Process each chunk from bottom to top
  for (const chunk of chunks) {
    // Use a position inside the chunk (middle point is safe)
    const pos = chunk.fromB + Math.floor((chunk.endB - chunk.fromB) / 2);
    acceptChunk(view, pos);
  }
};


type OnSelected = (selectedText: string, selectedTextFirstLineNumber: number) => void

const processSelectedText = (editorView: EditorView | ViewUpdate, onSelected?: OnSelected) => {
  const selection = editorView.state.selection.main;
  const selectedText = editorView.state.sliceDoc(selection.from, selection.to);
  const selectedTextFirstLineNumber = editorView.state.doc.lineAt(selection.from).number - 1; // 0-based line number;
  onSelected?.(selectedText, selectedTextFirstLineNumber);
};

export const useTextSelectionEffect = (codeMirrorEditor?: UseCodeMirrorEditor, onSelected?: OnSelected): void => {
  useEffect(() => {
    if (codeMirrorEditor == null) {
      return;
    }

    // To handle cases where text is already selected in the editor at the time of first effect firing
    if (codeMirrorEditor.view != null) {
      processSelectedText(codeMirrorEditor.view, onSelected);
    }

    const extension = EditorView.updateListener.of((update) => {
      if (update.selectionSet) {
        processSelectedText(update, onSelected);
      }
    });

    const cleanup = codeMirrorEditor?.appendExtensions([extension]);

    return () => {
      cleanup?.();
    };
  }, [codeMirrorEditor, onSelected]);
};
