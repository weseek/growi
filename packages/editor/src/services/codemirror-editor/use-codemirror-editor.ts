import { useCallback, useEffect } from 'react';

import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorState, type EditorStateConfig, type Extension } from '@codemirror/state';
import { basicSetup, useCodeMirror, type UseCodeMirror } from '@uiw/react-codemirror';

import { UseCodeMirrorEditorStates } from './interfaces/react-codemirror';

export type UseCodeMirrorEditor = UseCodeMirror;

type UseCodeMirrorEditorUtils = {
  initState: (config?: EditorStateConfig) => void,
  initDoc: (doc?: string) => void,
  setCursor: (lineNumber?: number) => void,
}

export type UseCodeMirrorEditorResponse = UseCodeMirrorEditorStates & UseCodeMirrorEditorUtils;

const defaultExtensions: Extension[] = [
  markdown({ base: markdownLanguage, codeLanguages: languages }),
];

const defaultExtensionsToInit: Extension[] = [
  ...basicSetup(),
  ...defaultExtensions,
];

export const useCodeMirrorEditor = (props?: UseCodeMirrorEditor): UseCodeMirrorEditorResponse => {

  const codemirror = useCodeMirror({
    extensions: defaultExtensions,
    ...props,
  });

  const { view, setContainer } = codemirror;

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

  // implement setCursor method
  const setCursor = useCallback((lineNumber?: number): void => {
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

  useEffect(() => {
    if (props?.container != null) {
      setContainer(props.container);
    }
  }, [props?.container, setContainer]);

  return {
    ...codemirror,
    initState,
    initDoc,
    setCursor,
  };
};
