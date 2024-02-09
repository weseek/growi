import type { ChangeSpec, EditorState, StateCommand } from '@codemirror/state';

// https://regex101.com/r/7BN2fR/10
const linePartOfTableRE = /^([^\r\n|]*)\|(([^\r\n|]*\|)+)$/;
// https://regex101.com/r/1UuWBJ/3
export const emptyLineOfTableRE = /^([^\r\n|]*)\|((\s*\|)+)$/;

const getCurPos = (editorState: EditorState): number => {
  return editorState.selection.main.head;
}

const isInTable = (editorState: EditorState): boolean => {
  const curPos = getCurPos(editorState);
  const lineText = editorState.doc.lineAt(curPos).text;
  return linePartOfTableRE.test(lineText);
};

const getEot = (editorState: EditorState): number => {
  if (!isInTable(editorState)) {
    return getCurPos(editorState);
  }

  const doc = editorState.doc;
  const lastLine = doc.lines;

  let line = doc.lineAt(getCurPos(editorState)).number + 1;

};

export const insertNewRowToMarkdownTable: StateCommand = ({ state, dispatch }) => {

  const curPos = getCurPos(state);

  const curLine = state.doc.lineAt(curPos).number;

  const bolPos = state.doc.line(curLine).from;
  const eolPos = state.doc.line(curLine).to;

  const strFromBol = state.sliceDoc(bolPos, curPos);
  const strToEol = state.sliceDoc(curPos, eolPos);

  const isLastRow;

  if (isInTable()) {

    if (isEndOfLine()) {
      addRow();
    }

    else if (isLastRow && emptyLineOfTableRE.test(strFromBol + strToEol) {
      removeRow();
    }

    else {
      reformTable();
    }

  }

};
