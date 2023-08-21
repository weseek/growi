import { useEffect } from 'react';

import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import type { EditorState, Extension } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import { useCodeMirror, type UseCodeMirror } from '@uiw/react-codemirror';


export type UseCodeMirrorEditor = UseCodeMirror;

export type UseCodeMirrorEditorStates = {
  state: EditorState | undefined;
  setState: import('react').Dispatch<import('react').SetStateAction<EditorState | undefined>>;
  view: EditorView | undefined;
  setView: import('react').Dispatch<import('react').SetStateAction<EditorView | undefined>>;
  container: HTMLDivElement | undefined;
  setContainer: import('react').Dispatch<import('react').SetStateAction<HTMLDivElement | undefined>>;
}

export const defaultExtensions: Extension[] = [
  markdown({ base: markdownLanguage, codeLanguages: languages }),
];

export const useCodeMirrorEditor = (props?: UseCodeMirrorEditor): UseCodeMirrorEditorStates => {

  const codemirror = useCodeMirror({
    extensions: defaultExtensions,
    ...props,
  });

  const { setContainer } = codemirror;

  useEffect(() => {
    if (props?.container != null) {
      setContainer(props.container);
    }
  }, [props?.container, setContainer]);

  return codemirror;
};
