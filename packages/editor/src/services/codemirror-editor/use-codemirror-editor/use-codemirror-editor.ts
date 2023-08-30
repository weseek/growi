import { useMemo } from 'react';

import { indentWithTab } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { type Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { useCodeMirror, type UseCodeMirror } from '@uiw/react-codemirror';

import type { UseCodeMirrorEditorStates } from '../interfaces/react-codemirror';

import { AppendExtension, useAppendExtension } from './utils/append-extension';
import { useFocus, type Focus } from './utils/focus';
import { useGetDoc, type GetDoc } from './utils/get-doc';
import { useInitDoc, type InitDoc } from './utils/init-doc';
import { useSetCaretLine, type SetCaretLine } from './utils/set-caret-line';

type UseCodeMirrorEditorUtils = {
  initDoc: InitDoc,
  appendExtension: AppendExtension,
  getDoc: GetDoc,
  focus: Focus,
  setCaretLine: SetCaretLine,
}
export type UseCodeMirrorEditor = UseCodeMirrorEditorStates & UseCodeMirrorEditorUtils;


const defaultExtensions: Extension[] = [
  markdown({ base: markdownLanguage, codeLanguages: languages }),
  keymap.of([indentWithTab]),
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
  const getDoc = useGetDoc(view);
  const focus = useFocus(view);
  const setCaretLine = useSetCaretLine(view);

  return {
    ...codemirror,
    initDoc,
    appendExtension,
    getDoc,
    focus,
    setCaretLine,
  };
};
