import { text } from 'stream/consumers';

import type { EditorState } from '@codemirror/state';

// https://regex101.com/r/7BN2fR/5
// const indentAndMarkOnlyRE = /^(\s*)(>[> ]*|[*+-] \[[x ]\]|[*+-]|(\d+)[.)])(\s*)$/;

const numberListMarkdownRE = /^(\s|\d+[.)])\s*/;

const getBol = (editorState: EditorState) => {
  const curPos = editorState.selection.main.head;
  const aboveLine = editorState.doc.lineAt(curPos).number;
  return editorState.doc.line(aboveLine).from;
};

export const getStrFromBol = (editorState: EditorState): string => {
  const curPos = editorState.selection.main.head;
  return editorState.sliceDoc(getBol(editorState), curPos);
};

export const renumberListIndex = ({ state, dispatch }) => {

  const strFromBol = getStrFromBol(state);

  if (strFromBol.match(numberListMarkdownRE)) {

  }

};
