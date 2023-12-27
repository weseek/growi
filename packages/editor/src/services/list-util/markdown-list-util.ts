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

export const newlineAndIndentContinueMarkdownList = (editor: EditorView): void => {
  const strFromBol = getStrFromBol(editor);

  const matchResult = strFromBol.match(indentAndMarkRE);

  if (matchResult != null) {
    // continue list
    const indentAndMark = matchResult[0];
    insertText(editor, indentAndMark);
  }
};
