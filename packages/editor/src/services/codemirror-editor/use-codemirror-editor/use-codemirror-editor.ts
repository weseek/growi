import { useCallback, useMemo } from 'react';

import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { type Extension } from '@codemirror/state';
import { useCodeMirror, type UseCodeMirror } from '@uiw/react-codemirror';

import type { UseCodeMirrorEditorStates } from '../interfaces/react-codemirror';

import { AppendExtension, useAppendExtension } from './utils/append-extension';
import { useInitDoc, type InitDoc } from './utils/init-doc';

type UseCodeMirrorEditorUtils = {
  initDoc: InitDoc,
  appendExtension: AppendExtension,
  getDoc: () => string | undefined,
  focus: () => void,
  setCaretLine: (lineNumber?: number) => void,
}
export type UseCodeMirrorEditor = UseCodeMirrorEditorStates & UseCodeMirrorEditorUtils;


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

  const initDoc = useInitDoc(view);
  const appendExtension = useAppendExtension(view);

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
