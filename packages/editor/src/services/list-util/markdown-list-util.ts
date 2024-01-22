import { EditorView } from '@codemirror/view';

// https://regex101.com/r/7BN2fR/5
const indentAndMarkRE = /^(\s*)(>[> ]*|[*+-] \[[x ]\]\s|[*+-]\s|(\d+)([.)]))(\s*)/;

const getBol = (editor: EditorView) => {
  const curPos = editor.state.selection.main.head;
  const aboveLine = editor.state.doc.lineAt(curPos).number;
  return editor.state.doc.line(aboveLine).from;
};

export const getStrFromBol = (editor: EditorView): string => {
  const curPos = editor.state.selection.main.head;
  return editor.state.sliceDoc(getBol(editor), curPos);
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
