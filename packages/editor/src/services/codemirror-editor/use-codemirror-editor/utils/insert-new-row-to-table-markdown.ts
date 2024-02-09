import type {
  ChangeSpec, EditorState, StateCommand, Transaction,
} from '@codemirror/state';

import MarkdownTable from '~/client/models/MarkdownTable';

// https://regex101.com/r/7BN2fR/10
const linePartOfTableRE = /^([^\r\n|]*)\|(([^\r\n|]*\|)+)$/;
// https://regex101.com/r/1UuWBJ/3
export const emptyLineOfTableRE = /^([^\r\n|]*)\|((\s*\|)+)$/;

type ArgType = {
  state: EditorState,
  dispatch: (transaction: Transaction) => boolean
}

const getCurPos = (editorState: EditorState): number => {
  return editorState.selection.main.head;
};

const isInTable = (editorState: EditorState): boolean => {
  const curPos = getCurPos(editorState);
  const lineText = editorState.doc.lineAt(curPos).text;
  return linePartOfTableRE.test(lineText);
};

const getBot = (editorState: EditorState): number => {
  if (!isInTable(editorState)) {
    return getCurPos(editorState);
  }

  const doc = editorState.doc;
  const firstLine = 1;
  let line = doc.lineAt(getCurPos(editorState)).number - 1;
  for (; line >= firstLine; line--) {
    const strLine = doc.line(line).text;
    if (!linePartOfTableRE.test(strLine)) {
      break;
    }
  }
  const botLine = Math.max(firstLine, line + 1);
  return doc.line(botLine).from;
};

const getEot = (editorState: EditorState): number => {
  if (!isInTable(editorState)) {
    return getCurPos(editorState);
  }

  const doc = editorState.doc;
  const lastLine = doc.lines;

  let line = doc.lineAt(getCurPos(editorState)).number + 1; // 常に1行先を監視する

  for (; line <= lastLine; line++) {
    const strLine = doc.line(line).text;
    if (!linePartOfTableRE.test(strLine)) {
      break;
    }
  }

  const eotLine = line - 1;

  return doc.line(eotLine).to;
};

const getStrFromBot = (editorState: EditorState): string => {
  return editorState.sliceDoc(getBot(editorState), getCurPos(editorState));
};

const getStrToEot = (editorState: EditorState): string => {
  return editorState.sliceDoc(getCurPos(editorState), getEot(editorState));
};

const addRow = ({ state, dispatch }: ArgType) => {
  const strFromBot = getStrFromBot(state);

  const table = getMarkdownTable(); // MarkdownTable instance

  addRowToMarkdownTable();

  const strToEot = getStrToEot(state);

  const tableBottom = table.toString();

};

const removeRow = () => {};

const reformTable = () => {};

export const insertNewRowToMarkdownTable: StateCommand = ({ state, dispatch }: ArgType) => {

  const curPos = getCurPos(state);

  const curLine = state.doc.lineAt(curPos).number;

  const bolPos = state.doc.line(curLine).from;
  const eolPos = state.doc.line(curLine).to;

  const strFromBol = state.sliceDoc(bolPos, curPos);
  const strToEol = state.sliceDoc(curPos, eolPos);

  const isLastRow = getStrToEot(state) === strToEol;
  const isEndOfLine = curPos === eolPos;

  if (isInTable(state)) {

    if (isEndOfLine) {
      addRow();
    }

    else if (isLastRow && emptyLineOfTableRE.test(strFromBol + strToEol)) {
      removeRow();
    }

    else {
      reformTable();
    }

  }

};
