import { useCallback } from 'react';

import { Compartment, StateEffect } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import type { ViewUpdate } from '@codemirror/view';

export type SetCaretLine = (lineNumber?: number, schedule?: boolean) => void;

const setCaretLine = (view?: EditorView, lineNumber?: number): void => {
  const doc = view?.state.doc;

  if (doc == null) {
    return;
  }

  try {
    const posOfLineEnd = doc.line(lineNumber ?? 1).to;
    view?.dispatch({
      selection: {
        anchor: posOfLineEnd,
        head: posOfLineEnd,
      },
      scrollIntoView: true,
      effects: EditorView.scrollIntoView(posOfLineEnd, { x: 'end', y: 'center' }),
    });
    // focus
    view?.focus();
  }
  catch (_: unknown) {
    // if posOfLineEnd is not found.
  }

};

const setCaretLineSchedule = (view?: EditorView, lineNumber?: number): void => {

  // support Yjs lazy load doc
  const compartment = new Compartment();

  const initDocListenerExtension = EditorView.updateListener.of((v: ViewUpdate) => {

    // TODO: use ySyncAnnotation for if statement and remove "currentPageYjsData?.hasRevisionBodyDiff === false" in Header.tsx
    // Ref: https://github.com/yjs/y-codemirror.next/pull/30
    if (v.docChanged && v.changes.desc.length === 0) {

      setCaretLine(view, lineNumber);

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
};

export const useSetCaretLine = (view?: EditorView): SetCaretLine => {

  return useCallback((lineNumber?: number, schedule?: boolean) => {

    if (schedule) {
      setCaretLineSchedule(view, lineNumber);
    }
    else {
      setCaretLine(view, lineNumber);
    }

  }, [view]);

};
