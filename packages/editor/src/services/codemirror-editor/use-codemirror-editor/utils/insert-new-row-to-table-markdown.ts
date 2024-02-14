import type {
  EditorState, Transaction,
} from '@codemirror/state';
import { MarkdownTable } from '@growi/core/dist/models';

// https://regex101.com/r/7BN2fR/10
const linePartOfTableRE = /^([^\r\n|]*)\|(([^\r\n|]*\|)+)$/;
// https://regex101.com/r/1UuWBJ/3
export const emptyLineOfTableRE = /^([^\r\n|]*)\|((\s*\|)+)$/;

// type ArgType = {
//   state: EditorState,
//   dispatch: (transaction: Transaction) => boolean
// }

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

  let line = doc.lineAt(getCurPos(editorState)).number + 1;

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

const addRowToMarkdownTable = (mdtable: MarkdownTable): any => {
  const numCol = mdtable.table.length > 0 ? mdtable.table[0].length : 1;
  const newRow: string[] = new Array(numCol);

  newRow.fill('');
  // (new Array(numCol)).forEach(() => { return newRow.push('') }); // create cols
  mdtable.table.push(newRow);
};

export const mergeMarkdownTable = (mdtableList: MarkdownTable[]): MarkdownTable => {
  let newTable: any[] = [];
  const options = mdtableList[0].options; // use option of first markdown-table
  mdtableList.forEach((mdtable) => {
    newTable = newTable.concat(mdtable.table);
  });
  return (new MarkdownTable(newTable, options));
};

export const replaceFocusedMarkdownTableWithEditor = (
    state: EditorState, dispatch: (transaction: Transaction) => boolean, table: MarkdownTable,
): void => {
  const botPos = getBot(state);
  const eotPos = getEot(state);

  const nextLine = state.doc.lineAt(getCurPos(state)).number + 1;

  const nextCurPos = state.doc.line(nextLine).from + 2;
  // const nextCurPos = state.doc.lineAt(getCurPos(state) + 2).from + 3;

  dispatch(state.update({
    changes: {
      from: botPos,
      to: eotPos,
      insert: table.toString(),
    },
    // selection: { anchor: nextCurPos },
    // selection: { anchor: state.doc.lineAt(getCurPos(state)).to },
  }));

  // const nextCurPos = state.doc.lineAt(getCurPos(state) + 1).from + 3;

  // dispatch(state.update({
  //   selection: { anchor: 10 },
  // }));
};

const addRow = (state: EditorState, dispatch: (transaction: Transaction) => boolean) => {
  const strFromBot = getStrFromBot(state);

  let table = MarkdownTable.fromMarkdownString(strFromBot);

  addRowToMarkdownTable(table);

  const strToEot = getStrToEot(state);

  const tableBottom = MarkdownTable.fromMarkdownString(strToEot);

  if (tableBottom.table.length > 0) {
    table = mergeMarkdownTable([table, tableBottom]);
  }

  replaceFocusedMarkdownTableWithEditor(state, dispatch, table);
};

const removeRow = (state: EditorState, dispatch: (transaction: Transaction) => boolean) => {

  const curPos = getCurPos(state);

  const curLine = state.doc.lineAt(curPos).number;

  const bolPos = state.doc.line(curLine).from;
  const eolPos = state.doc.line(curLine).to;

  const insert = state.lineBreak;

  const nextCurPos = state.doc.lineAt(getCurPos(state)).to + 1;
  // console.log(nextCurPos);

  dispatch(state.update(
    {
      changes: {
        from: bolPos,
        to: eolPos,
        insert,
      },
      // selection: { anchor: nextCurPos },
    },
  ));
};

const reformTable = (state: EditorState, dispatch: (transaction: Transaction) => boolean) => {
  const tableStr = getStrFromBot(state) + getStrToEot(state);
  const table = MarkdownTable.fromMarkdownString(tableStr);
  replaceFocusedMarkdownTableWithEditor(state, dispatch, table);
};

export const insertNewRowToMarkdownTable = (state: EditorState, dispatch: (transaction: Transaction) => boolean): void => {

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
      addRow(state, dispatch);
    }

    else if (isLastRow && emptyLineOfTableRE.test(strFromBol + strToEol)) {
      removeRow(state, dispatch);
    }

    else {
      reformTable(state, dispatch);
    }
  }

  // const nextCurPos = state.doc.lineAt(getCurPos(state) + 1).from + 3;

  // console.log(nextCurPos);

  // dispatch(state.update({
  //   selection: { anchor: nextCurPos },
  // }));
};
