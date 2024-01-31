import type { EditorView } from '@codemirror/view';

// https://regex101.com/r/7BN2fR/5
const indentAndMarkRE = /^(\s*)(>[> ]*|[*+-] \[[x ]\]\s|[*+-]\s|(\d+)([.)]))(\s*)/;

export const getLineToCursor = (editor: EditorView, lineNumBeforeCursor = 0): string => {
  const curPos = editor.state.selection.main.head;
  const firstLineNumToGet = editor.state.doc.lineAt(curPos).number - lineNumBeforeCursor;

  const fixedFirstLineNumToGet = Math.max(firstLineNumToGet, 0);

  const firstLineToGet = editor.state.doc.line(fixedFirstLineNumToGet).from;

  return editor.state.sliceDoc(firstLineToGet, curPos);
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
  const getStrFromAboveLine = getLineToCursor(editor, 1);

  const matchResult = getStrFromAboveLine.match(indentAndMarkRE);

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

    adjusted = replacedText;
  }

  return adjusted;
};
