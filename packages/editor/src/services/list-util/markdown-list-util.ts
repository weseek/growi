import { useCallback } from 'react';

import { EditorView } from '@codemirror/view';

import { useInsertText } from '../codemirror-editor/use-codemirror-editor/utils/insert-text';


export type NewlineAndIndentContinueMarkdownList = ((editor: EditorView) => void) | undefined;

// https://regex101.com/r/7BN2fR/5
const indentAndMarkRE = /^(\s*)(>[> ]*|[*+-] \[[x ]\]\s|[*+-]\s|(\d+)([.)]))(\s*)/;

export const getLineToCursor = (editor: EditorView, lineNumBeforeCursor = 0): string => {
  const curPos = editor.state.selection.main.head;
  const firstLineNumToGet = editor.state.doc.lineAt(curPos).number - lineNumBeforeCursor;

  const fixedFirstLineNumToGet = Math.max(firstLineNumToGet, 0);

  const firstLineToGet = editor.state.doc.line(fixedFirstLineNumToGet).from;

  return editor.state.sliceDoc(firstLineToGet, curPos);
};

export const useNewlineAndIndentContinueMarkdownList = (editor?: EditorView): NewlineAndIndentContinueMarkdownList => {
  const insertText = useInsertText(editor);

  const NewlineAndIndentContinueMarkdownList = useCallback((view: EditorView) => {

    const curPos = view?.state.selection.main.head;
    const lineStartPos = view?.state.doc.lineAt(curPos).from;

    const getStrFromAboveLine = getLineToCursor(view, 1);

    const matchResult = getStrFromAboveLine.match(indentAndMarkRE);

    if (matchResult != null) {
      const indentAndMark = matchResult[0];
      insertText(indentAndMark, lineStartPos, curPos);
    }
  }, [insertText]);

  if (editor == null) {
    return;
  }

  return () => { NewlineAndIndentContinueMarkdownList(editor) };
};

export const adjustPasteData = (strFromBol: string, text: string): string => {

  let adjusted = text;

  if (text.match(indentAndMarkRE)) {
    const matchResult = strFromBol.match(indentAndMarkRE);
    const indent = matchResult ? matchResult[1] : '';

    const lines = text.match(/[^\r\n]+/g);

    const replacedLines = lines?.map((line, index) => {

      if (index === 0 && strFromBol.match(indentAndMarkRE)) {
        return line.replace(indentAndMarkRE, '');
      }

      return indent + line;
    });

    adjusted = replacedLines ? replacedLines.join('\n') : '';
  }

  else if (strFromBol.match(indentAndMarkRE)) {
    const replacedText = text.replace(/(\r\n|\r|\n)/g, `$1${strFromBol}`);

    adjusted = replacedText;
  }

  return adjusted;
};
