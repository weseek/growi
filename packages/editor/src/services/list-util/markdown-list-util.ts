import { EditorView } from '@codemirror/view';

const getBol = (editor: EditorView) => {
  const curPos = editor.state.selection.main.head;
  const aboveLine = editor.state.doc.lineAt(curPos).number - 1;
  return editor.state.doc.line(aboveLine).from;
};

const getStrFromBol = (editor: EditorView) => {
  const curPos = editor.state.selection.main.head;
  return editor.state.sliceDoc(getBol(editor), curPos);
};

const indentAndMarkRE = /^(\s*)(>[> ]*|[*+-] \[[x ]\]\s|[*+-]\s|(\d+)([.)]))(\s*)/;

const insertText = (editor: EditorView, text: string) => {
  const curPos = editor.state.selection.main.head;
  const line = editor.state.doc.lineAt(curPos).from;
  editor.dispatch({
    changes: {
      from: line,
      to: curPos,
      insert: text,
    },
  });
};

// const selectLowerPos = (editor: EditorView, pos1: number, pos2: number) => {
//   // if both is in same line
//   if (editor.state.doc.lineAt(pos1).number === editor.state.doc.lineAt(pos2).number) {
//     return (editor.state.doc.lineAt(pos1).from < editor.state.doc.lineAt(pos1).to) ? pos2 : pos1;
//   }
//   return (editor.state.doc.lineAt(pos1) < editor.state.doc.lineAt(pos2)) ? pos2 : pos1;
// };

// const replaceBolToCurrentPos = (editor: EditorView, text: string) => {
//   const curPos = editor.state.selection.main.head;
//   const pos = selectLowerPos(editor, editor.state.doc.lineAt(curPos).from, editor.state.doc.lineAt(curPos).to);
//   editor.dispatch({
//     changes: {
//       from: getBol(editor),
//       to: pos,
//       insert: text,
//     },
//   });
// };

export const newlineAndIndentContinueMarkdownList = (editor: EditorView): void => {
  const strFromBol = getStrFromBol(editor);

  const matchResult = strFromBol.match(indentAndMarkRE);

  if (matchResult != null) {
    // continue list
    const indentAndMark = matchResult[0];
    insertText(editor, indentAndMark);
  }
};
