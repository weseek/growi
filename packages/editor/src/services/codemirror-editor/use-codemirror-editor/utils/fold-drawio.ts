import { useEffect } from 'react';

import { foldEffect } from '@codemirror/language';
import { EditorView } from '@codemirror/view';

export type FoldDrawio = void;

const findAllDrawioSection = (view?: EditorView) => {
  if (view == null) {
    return;
  }
  const lineBeginPartOfDrawioRE = /^```(\s.*)drawio$/;
  const lineNumbers: number[] = [];
  for (let i = 1, e = view.state.doc.lines; i <= e; i++) {
    const lineTxt = view.state.doc.line(i).text;
    const match = lineBeginPartOfDrawioRE.exec(lineTxt);
    if (match) {
      lineNumbers.push(i);
    }
  }
  return lineNumbers;
};

const foldDrawioSection = (lineNumbers?: number[], view?: EditorView) => {
  if (view == null || lineNumbers == null) {
    return;
  }
  lineNumbers.forEach((lineNumber) => {
    const from = view.state.doc.line(lineNumber).to;
    const to = view.state.doc.line(lineNumber + 2).to;
    view?.dispatch({
      effects: foldEffect.of({
        from,
        to,
      }),
    });
  });
};

export const useFoldDrawio = (view?: EditorView): FoldDrawio => {
  const lineNumbers = findAllDrawioSection(view);

  useEffect(() => {
    foldDrawioSection(lineNumbers, view);
  }, [view, lineNumbers]);
};
