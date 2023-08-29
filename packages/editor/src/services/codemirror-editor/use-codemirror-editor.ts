import { useCallback, useMemo } from 'react';

import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import {
  StateEffect, type Extension, Compartment, Transaction,
} from '@codemirror/state';
import { useCodeMirror, type UseCodeMirror } from '@uiw/react-codemirror';

import type { UseCodeMirrorEditorStates } from './interfaces/react-codemirror';

type UseCodeMirrorEditorUtils = {
  initDoc: (doc?: string) => void,
  appendExtension: (extension: Extension, compartment?: Compartment) => CleanupFunction | undefined,
  getDoc: () => string | undefined,
  focus: () => void,
  setCaretLine: (lineNumber?: number) => void,
}
export type UseCodeMirrorEditor = UseCodeMirrorEditorStates & UseCodeMirrorEditorUtils;

type CleanupFunction = () => void;

const defaultExtensions: Extension[] = [
  markdown({ base: markdownLanguage, codeLanguages: languages }),
];

export const useCodeMirrorEditor = (props?: UseCodeMirror): UseCodeMirrorEditor => {

  const mergedProps = useMemo<UseCodeMirror>(() => {
    return {
      ...props,
      extensions: [
        ...defaultExtensions,
        ...(props?.extensions ?? []),
      ],
    };
  }, [props]);

  const codemirror = useCodeMirror(mergedProps);

  const { view } = codemirror;

  // implement initDoc method
  const initDoc = useCallback((doc?: string): void => {
    view?.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: doc,
      },
      annotations: Transaction.addToHistory.of(false),
    });
  }, [view]);

  // implement appendExtension method
  const appendExtension = useCallback((extension: Extension): CleanupFunction | undefined => {
    const compartment = new Compartment();
    view?.dispatch({
      effects: StateEffect.appendConfig.of(
        compartment.of(extension),
      ),
    });

    // return cleanup function
    return () => {
      view?.dispatch({
        effects: compartment?.reconfigure([]),
      });
    };
  }, [view]);

  // implement getDoc method
  const getDoc = useCallback((): string | undefined => {
    return view?.state.doc.toString();
  }, [view]);

  // implement focus method
  const focus = useCallback((): void => {
    view?.focus();
  }, [view]);

  // implement setCaretLine method
  const setCaretLine = useCallback((lineNumber?: number): void => {
    if (view == null) {
      return;
    }

    const posOfLineEnd = view.state.doc.line(lineNumber ?? 1).to;
    view.dispatch({
      selection: {
        anchor: posOfLineEnd,
        head: posOfLineEnd,
      },
    });
    // focus
    view.focus();
  }, [view]);

  return {
    ...codemirror,
    initDoc,
    appendExtension,
    getDoc,
    focus,
    setCaretLine,
  };
};
