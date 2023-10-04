import { useMemo } from 'react';

import { indentWithTab, defaultKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { syntaxHighlighting, HighlightStyle, defaultHighlightStyle } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { EditorState, Prec, type Extension } from '@codemirror/state';
import { keymap, EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import { useCodeMirror, type UseCodeMirror } from '@uiw/react-codemirror';
import deepmerge from 'ts-deepmerge';

import { useAppendExtensions, type AppendExtensions } from './utils/append-extensions';
import { useFocus, type Focus } from './utils/focus';
import { useGetDoc, type GetDoc } from './utils/get-doc';
import { useInitDoc, type InitDoc } from './utils/init-doc';
import { useSetCaretLine, type SetCaretLine } from './utils/set-caret-line';

const markdownHighlighting = HighlightStyle.define([
  { tag: tags.heading1, fontSize: '1.9em', textDecoration: 'none' },
  { tag: tags.heading2, fontSize: '1.6em', textDecoration: 'none' },
  { tag: tags.heading3, fontSize: '1.4em', textDecoration: 'none' },
  { tag: tags.heading4, fontSize: '1.35em', textDecoration: 'none' },
  { tag: tags.heading5, fontSize: '1.25em', textDecoration: 'none' },
  { tag: tags.heading6, fontSize: '1.2em', textDecoration: 'none' },
]);

type UseCodeMirrorEditorUtils = {
  initDoc: InitDoc,
  appendExtensions: AppendExtensions,
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
  keymap.of([indentWithTab]),
  Prec.lowest(keymap.of(defaultKeymap)),
  Prec.highest(syntaxHighlighting(markdownHighlighting)),
  Prec.lowest(syntaxHighlighting(defaultHighlightStyle)),
];

export const useCodeMirrorEditor = (props?: UseCodeMirror): UseCodeMirrorEditor => {

  const mergedProps = useMemo<UseCodeMirror>(() => {
    return deepmerge(
      props ?? {},
      {
        extensions: defaultExtensions,
        // Reset settings of react-codemirror.
        // The extension defined first will be used, so it must be disabled here.
        indentWithTab: false,
        basicSetup: {
          defaultKeymap: false,
        },
      },
    );
  }, [props]);

  const { state, view } = useCodeMirror(mergedProps);

  const initDoc = useInitDoc(view);
  const appendExtensions = useAppendExtensions(view);
  const getDoc = useGetDoc(view);
  const focus = useFocus(view);
  const setCaretLine = useSetCaretLine(view);

  return {
    state,
    view,
    initDoc,
    appendExtensions,
    getDoc,
    focus,
    setCaretLine,
  };
};
