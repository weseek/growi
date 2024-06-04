import { useCallback } from 'react';

import { Compartment, StateEffect } from '@codemirror/state';
import type { ViewUpdate } from '@codemirror/view';
import { EditorView } from '@codemirror/view';

export type SetCaretLineInit = (lineNumber?: number) => void;

export const useSetCaretLineInit = (view?: EditorView): SetCaretLineInit => {

  return useCallback((lineNumber) => {

    const compartment = new Compartment();

    const initDocListenerExtension = EditorView.updateListener.of((v: ViewUpdate) => {
      if (v.docChanged && v.changes.desc.length === 0) {

        const doc = v.state.doc;

        try {
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
        }
        catch (_: unknown) {
          // if posOfLineEnd is not found.
        }

        // focus
        view?.focus();

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
