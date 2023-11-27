import { EditorView } from '@codemirror/view';

import MarkdownTable from '~/client/models/MarkdownTable';

/**
 * Utility for markdown table
 */

// https://regex101.com/r/7BN2fR/10
const linePartOfTableRE = /^([^\r\n|]*)\|(([^\r\n|]*\|)+)$/;

const curPos = (editor: EditorView): number => {
  return editor.state.selection.main.head;
};

/**
   * return boolean value whether the cursor position is in a table
   */
export const isInTable = (editor: EditorView): boolean => {
  const lineText = editor.state.doc.lineAt(curPos(editor)).text;
  return linePartOfTableRE.test(lineText);
};

/**
   * return the postion of the BOT(beginning of table)
   * (If the cursor is not in a table, return its position)
   */
export const getBot = (editor: EditorView): number => {
  if (!isInTable(editor)) {
    return curPos(editor);
  }

  const doc = editor.state.doc;
  const firstLine = doc.line(1);
  let line = doc.lineAt(curPos(editor)).number - 1;
  for (; line >= firstLine.number; line--) {
    const strLine = doc.line(line);
    if (!linePartOfTableRE.test(strLine.text)) {
      break;
    }
  }
  const botLine = doc.line(line + 1);
  return botLine.from;
};

/**
   * return the postion of the EOT(end of table)
   * (If the cursor is not in a table, return its position)
   */
export const getEot = (editor: EditorView): number => {
  if (!isInTable(editor)) {
    return curPos(editor);
  }

  const doc = editor.state.doc;
  const lastLine = doc.line(doc.lines);
  let line = doc.lineAt(curPos(editor)).number + 1;
  for (; line <= lastLine.number; line++) {
    const strLine = doc.line(line);
    if (!linePartOfTableRE.test(strLine.text)) {
      break;
    }
  }
  const eotLine = doc.line(line - 1);
  return eotLine.to;
};

/**
   * return strings from BOT(beginning of table) to the cursor position
   */
export const getStrFromBot = (editor: EditorView): string => {
  return editor.state.sliceDoc(getBot(editor), curPos(editor));
};

/**
   * return strings from the cursor position to EOT(end of table)
   */
export const getStrToEot = (editor: EditorView): string => {
  return editor.state.sliceDoc(curPos(editor), getEot(editor));
};

/**
   * return MarkdownTable instance of the table where the cursor is
   * (If the cursor is not in a table, return null)
   */
export const getMarkdownTable = (editor: EditorView): MarkdownTable | undefined => {
  if (!isInTable(editor)) {
    return;
  }

  const strFromBotToEot = editor.state.sliceDoc(getBot(editor), getEot(editor));
  return MarkdownTable.fromMarkdownString(strFromBotToEot);
};

export const getMarkdownTableFromLine = (markdown: string, bol: number, eol: number): MarkdownTable => {
  const tableLines = markdown.split(/\r\n|\r|\n/).slice(bol - 1, eol).join('\n');
  return MarkdownTable.fromMarkdownString(tableLines);
};

/**
   * return boolean value whether the cursor position is end of line
   */
export const isEndOfLine = (editor: EditorView): boolean => {
  return (curPos(editor) === editor.state.doc.lineAt(curPos(editor)).number);
};

/**
   * add a row at the end
   * (This function overwrite directory markdown table specified as argument.)
   * @param {MarkdownTable} markdown table
   */
export const addRowToMarkdownTable = (mdtable: MarkdownTable): any => {
  const numCol = mdtable.table.length > 0 ? mdtable.table[0].length : 1;
  const newRow: string[] = [];
  (new Array(numCol)).forEach(() => { return newRow.push('') }); // create cols
  mdtable.table.push(newRow);
};

/**
   * return markdown table that is merged all of markdown table in array
   * (The merged markdown table options are used for the first markdown table.)
   * @param {Array} array of markdown table
   */
export const mergeMarkdownTable = (mdtableList: MarkdownTable): MarkdownTable | undefined => {
  if (mdtableList == null || !(mdtableList instanceof Array)) {
    return undefined;
  }

  let newTable = [];
  const options = mdtableList[0].options; // use option of first markdown-table
  mdtableList.forEach((mdtable) => {
    newTable = newTable.concat(mdtable.table);
  });
  return (new MarkdownTable(newTable, options));
};

/**
   * replace focused markdown table with editor
   * (A replaced table is reformed by markdown-table.)
   * @param {MarkdownTable} table
   */
export const replaceFocusedMarkdownTableWithEditor = (editor: EditorView, table: MarkdownTable): void => {
  const botPos = getBot(editor);
  const eotPos = getEot(editor);

  editor.dispatch({
    changes: {
      from: botPos,
      to: eotPos,
      insert: table.toString(),
    },
  });
  editor.dispatch({
    selection: { anchor: editor.state.doc.lineAt(curPos(editor)).to },
  });
};

/**
   * return markdown where the markdown table specified by line number params is replaced to the markdown table specified by table param
   * @param {string} markdown
   * @param {MarkdownTable} table
   * @param beginLineNumber
   * @param endLineNumber
   */
export const replaceMarkdownTableInMarkdown = (table: MarkdownTable, markdown: string, beginLineNumber: number, endLineNumber: number): string => {
  const splitMarkdown = markdown.split(/\r\n|\r|\n/);
  const markdownBeforeTable = splitMarkdown.slice(0, beginLineNumber - 1);
  const markdownAfterTable = splitMarkdown.slice(endLineNumber);

  let newMarkdown = '';
  if (markdownBeforeTable.length > 0) {
    newMarkdown += `${markdownBeforeTable.join('\n')}\n`;
  }
  newMarkdown += table;
  if (markdownAfterTable.length > 0) {
    newMarkdown += `\n${markdownAfterTable.join('\n')}`;
  }

  return newMarkdown;
};
