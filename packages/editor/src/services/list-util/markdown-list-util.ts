import { EditorView } from '@codemirror/view';

const indentAndMarkRE = /^(\s*)(>[> ]*|[*+-] \[[x ]\]\s|[*+-]\s|(\d+)([.)]))(\s*)/;

const getBol = (editor: EditorView) => {
  const curPos = editor.state.selection.main.head;
  const aboveLine = editor.state.doc.lineAt(curPos).number;
  return editor.state.doc.line(aboveLine).from;
};

export const getStrFromBol = (editor: EditorView) => {
  const curPos = editor.state.selection.main.head;
  return editor.state.sliceDoc(getBol(editor), curPos);
};

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

  console.log(strFromBol);

  const matchResult = strFromBol.match(indentAndMarkRE);

  if (matchResult != null) {
    // continue list
    const indentAndMark = matchResult[0];
    insertText(editor, indentAndMark);
  }
};

const selectUpperPos = (editor: EditorView, pos1: number, pos2: number) => {

  const pos1Line = editor.state.doc.lineAt(pos1);
  const pos2Line = editor.state.doc.lineAt(pos2);

  const pos1Ch = pos1 - editor.state.doc.lineAt(pos1).from;
  const pos2Ch = pos2 - editor.state.doc.lineAt(pos2).from;

  console.log(pos1);
  console.log(pos2);
  console.log(pos1Line);
  console.log(pos2Line);
  console.log(pos1Ch);
  console.log(pos2Ch);


  if (pos1Line === pos2Line) {
    return (pos1Ch < pos2Ch) ? pos1 : pos2;
  }
  return (pos1Line < pos2Line) ? pos1 : pos2;
};

export const getStrFromBolToSelectedUpperPos = (editor: EditorView): string => {
  const pos = selectUpperPos(editor, editor.state.selection.main.from, editor.state.selection.main.to);
  // ここでエラー起きてそう

  return editor.state.sliceDoc(getBol(editor), pos);
};

// ここを作っていこう！
export const adjustPasteData = (indentAndMark: string, text: string): string => {

  let adjusted = '';

  if (text.match(indentAndMarkRE)) {
    const matchResult = indentAndMark.match(indentAndMarkRE);
    const indent = matchResult ? matchResult[1] : '';

    const lines = text.match(/[^\r\n]+/g);

    const replacedLines = lines?.map((line) => {
      return indent + line;
    });

    adjusted = replacedLines ? replacedLines.join('\n') : '';
  }

  else {
    const replacedText = text.replace(/(\r\n|\r|\n)/g, `$1${indentAndMark}`);

    adjusted = indentAndMark + replacedText;
  }

  return adjusted;
};
