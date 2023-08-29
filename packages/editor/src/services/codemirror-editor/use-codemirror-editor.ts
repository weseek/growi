import { useCallback } from 'react';

import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import {
  EditorState, StateEffect, type EditorStateConfig, type Extension, Compartment,
} from '@codemirror/state';
import { basicSetup, useCodeMirror, type UseCodeMirror } from '@uiw/react-codemirror';

import type { UseCodeMirrorEditorStates } from './interfaces/react-codemirror';

type UseCodeMirrorEditorUtils = {
  initState: (config?: EditorStateConfig) => void,
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

const defaultExtensionsToInit: Extension[] = [
  ...basicSetup(),
  ...defaultExtensions,
];

export const useCodeMirrorEditor = (props?: UseCodeMirror): UseCodeMirrorEditor => {

  const codemirror = useCodeMirror({
    ...props,
    extensions: [
      ...defaultExtensions,
      ...(props?.extensions ?? []),
    ],
  });

  const { view } = codemirror;

  // implement initState method
  const initState = useCallback((config?: EditorStateConfig): void => {
    if (view == null) {
      return;
    }

    const newState = EditorState.create({
      ...config,
      extensions: [
        ...defaultExtensionsToInit,
        ...(props?.extensions ?? []),
      ],
    });

    view.setState(newState);
  }, [props?.extensions, view]);

  // implement initDoc method
  const initDoc = useCallback((doc?: string): void => {
    initState({ doc });
  }, [initState]);

  // implement appendExtension method
  const appendExtension = useCallback((extension: Extension, compartment?: Compartment): CleanupFunction | undefined => {
    view?.dispatch({
      effects: StateEffect.appendConfig.of(
        compartment != null
          ? compartment.of(extension)
          : extension,
      ),
    });

    return compartment != null
      // return cleanup function
      ? () => {
        view?.dispatch({
          effects: compartment?.reconfigure([]),
        });
      }
      : undefined;
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
    initState,
    initDoc,
    appendExtension,
    getDoc,
    focus,
    setCaretLine,
  };
};
