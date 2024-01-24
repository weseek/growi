import type { EditorView } from '@codemirror/view';

// https://regex101.com/r/7BN2fR/5
const indentAndMarkRE = /^(\s*)(>[> ]*|[*+-] \[[x ]\]\s|[*+-]\s|(\d+)([.)]))(\s*)/;

const getLineAboveCursor = (editor: EditorView) => {
  const curPos = editor.state.selection.main.head;
  const aboveLine = editor.state.doc.lineAt(curPos).number - 1;
  return editor.state.doc.line(aboveLine).from;
};

const getStrFromAboveLine = (editor: EditorView) => {
  const curPos = editor.state.selection.main.head;
  return editor.state.sliceDoc(getLineAboveCursor(editor), curPos);
};

export const getCurrentLine = (editor: EditorView): string => {
  const curPos = editor.state.selection.main.head;
  const curLineNum = editor.state.doc.lineAt(curPos).number;

  const curLine = editor.state.doc.line(curLineNum).from;

  return editor.state.sliceDoc(curLine, curPos);
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
  const strFromBol = getStrFromAboveLine(editor);

  const matchResult = strFromBol.match(indentAndMarkRE);

  if (matchResult != null) {
    const indentAndMark = matchResult[0];
    insertText(editor, indentAndMark);
  }
};

export const adjustPasteData = (indentAndMark: string, text: string): string => {

  let adjusted;

  if (text.match(indentAndMarkRE)) {
    const matchResult = indentAndMark.match(indentAndMarkRE);
    const indent = matchResult ? matchResult[1] : '';

    const lines = text.match(/[^\r\n]+/g);

    const replacedLines = lines?.map((line, index) => {

      if (index === 0 && indentAndMark.match(indentAndMarkRE)) {
        return line.replace(indentAndMarkRE, '');
      }

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
