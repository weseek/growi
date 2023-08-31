import { useEffect, useMemo } from 'react';

import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorState, type Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { useCodeMirror, type UseCodeMirror } from '@uiw/react-codemirror';
import deepmerge from 'ts-deepmerge';

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
export type UseCodeMirrorEditor = {
  state: EditorState | undefined;
  view: EditorView | undefined;
} & UseCodeMirrorEditorUtils;


const defaultExtensions: Extension[] = [
  markdown({ base: markdownLanguage, codeLanguages: languages }),
];

export const useCodeMirrorEditor = (props?: UseCodeMirror): UseCodeMirrorEditor => {

  const mergedProps = useMemo<UseCodeMirror>(() => {
    return deepmerge(
      props ?? {},
      { extensions: defaultExtensions },
    );
  }, [props]);

  const { state, view } = useCodeMirror(mergedProps);

  const initDoc = useInitDoc(view);
  const appendExtension = useAppendExtension(view);
  const getDoc = useGetDoc(view);
  const focus = useFocus(view);
  const setCaretLine = useSetCaretLine(view);

  // workaround to fix the doc initialization not working issue -- 2023.08.31 Yuki Takei
  useEffect(() => {
    initDoc(' ');
  }, [initDoc]);

  return {
    state,
    view,
    initDoc,
    appendExtension,
    getDoc,
    focus,
    setCaretLine,
  };
};
