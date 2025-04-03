import {
  acceptChunk,
  rejectChunk,
} from '@codemirror/merge';

import type { EditorView } from 'src';

export const acceptChange = (view: EditorView): boolean => {
  return acceptChunk(view);
};

export const rejectChange = (view: EditorView): boolean => {
  return rejectChunk(view);
};
