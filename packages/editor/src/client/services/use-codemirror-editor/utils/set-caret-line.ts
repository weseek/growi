import { useCallback } from 'react';

import { Compartment, StateEffect } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import type { ViewUpdate } from '@codemirror/view';

export type SetCaretLine = (lineNumber?: number) => void;

const setCaretLine = (view?: EditorView, lineNumber?: number): void => {
  const doc = view?.state.doc;

  if (doc == null || view == null) {
    throw RangeError;
  }

  const posOfLineEnd = doc.line(lineNumber ?? 1).to;
  view?.dispatch({
    selection: {
      anchor: posOfLineEnd,
      head: posOfLineEnd,
    },
    scrollIntoView: true,
    effects: EditorView.scrollIntoView(posOfLineEnd, {
      x: 'start',
      y: 'start',
    }),
  });
  // focus
  view?.focus();

};

export const useSetCaretLine = (view?: EditorView): SetCaretLine => {

  return useCallback((lineNumber) => {

    try {
      setCaretLine(view, lineNumber);
    }
    catch (_: unknown) {
      //
    }

    console.log('Oooops');

    // support Yjs lazy load doc
    const compartment = new Compartment();

    const initDocListenerExtension = EditorView.updateListener.of((v: ViewUpdate) => {

      console.log(v);
      // TODO: change conditional statement
      if (v.docChanged && v.changes.desc.length === 0) {

        try {
          setCaretLine(view, lineNumber);
        }
        catch (_: unknown) {
          // if posOfLineEnd is not found.
        }

        view?.dispatch({
          effects: compartment.reconfigure([]),
        });
      }
    });

    view?.dispatch({
      effects: StateEffect.appendConfig.of(
        compartment.of(initDocListenerExtension),
      ),
    });


  }, [view]);

};
