import type { EditorView } from '@codemirror/view';

// https://regex101.com/r/r9plEA/1
const indentAndMarkRE = /^(\s*)(>[> ]*|[*+-] \[[x ]\]\s|[*+-]\s|(\d+)([.)]\s))(\s*)/;
// https://regex101.com/r/HFYoFN/1
const indentAndMarkOnlyRE = /^(\s*)(>[> ]*|[*+-] \[[x ]\]|[*+-]|(\d+)[.)])(\s*)$/;

const getBol = (editor: EditorView) => {
  const curPos = editor.state.selection.main.head;
  const aboveLine = editor.state.doc.lineAt(curPos).number;
  return editor.state.doc.line(aboveLine).from;
};

export const getStrFromBol = (editor: EditorView): string => {
  const curPos = editor.state.selection.main.head;
  return editor.state.sliceDoc(getBol(editor), curPos);
};

export const adjustPasteData = (strFromBol: string, text: string): string => {

  let adjusted = text;

  if (text.match(indentAndMarkRE)) {
    const matchResult = strFromBol.match(indentAndMarkRE);
    const indent = matchResult ? matchResult[1] : '';

    const lines = text.match(/[^\r\n]+/g);

    const replacedLines = lines?.map((line, index) => {

      if (index === 0 && strFromBol.match(indentAndMarkOnlyRE)) {
        return line.replace(indentAndMarkRE, '');
      }

      return indent + line;
    });

    if (replacedLines == null) {
      adjusted = '';
    }
    else if (replacedLines.length === 1 && !matchResult) {
      adjusted = `${replacedLines.join('')}\n`;
    }
    else {
      adjusted = replacedLines.join('\n');
    }
  }

  else if (strFromBol.match(indentAndMarkRE)) {
    const replacedText = text.replace(/(\r\n|\r|\n)/g, `$1${strFromBol}`);

    adjusted = replacedText;
  }

  return adjusted;
};
