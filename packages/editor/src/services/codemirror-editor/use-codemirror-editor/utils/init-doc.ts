import { useCallback, useEffect } from 'react';

import { foldEffect } from '@codemirror/language';
import { Transaction } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

export type InitDoc = (doc?: string) => void;

export const useInitDoc = (view?: EditorView): InitDoc => {
  useEffect(() => {
    if (view != null) {
      /**
       * return an array of the starting line numbers of the drawio sections found in markdown
       */
      const findAllDrawioSection = (editor: EditorView): number[] => {
        const lineBeginPartOfDrawioRE = /^```(\s.*)drawio$/;
        const lineNumbers: number[] = [];
        for (let i = 1, e = editor.state.doc.lines; i <= e; i++) {
          const lineTxt = editor.state.doc.line(i).text;
          const match = lineBeginPartOfDrawioRE.exec(lineTxt);
          if (match) {
            lineNumbers.push(i);
          }
        }
        return lineNumbers;
      };

      // fold draw.io section (``` drawio ~ ```)
      const foldDrawioSection = (editor: EditorView): void => {
        const lineNumbers = findAllDrawioSection(editor);
        lineNumbers.forEach((lineNumber) => {
          const from = editor.state.doc.line(lineNumber).to;
          const to = editor.state.doc.line(lineNumber + 2).to;
          editor.dispatch({
            effects: foldEffect.of({
              from, to,
            }),
          });
        });
      };
      foldDrawioSection(view);
    }
  });

  return useCallback((doc) => {
    view?.dispatch({
      changes: {
        from: 0,
        to: view?.state.doc.length,
        insert: doc,
      },
      annotations: Transaction.addToHistory.of(false),
    });
  }, [view]);

};
