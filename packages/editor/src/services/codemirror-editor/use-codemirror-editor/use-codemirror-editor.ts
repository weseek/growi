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
import { useInsertPrefix, type InsertPrefix } from './utils/insert-prefix';
import { useInsertText, type InsertText } from './utils/insert-text';
import { useReplaceText, type ReplaceText } from './utils/replace-text';
import { useSetCaretLine, type SetCaretLine } from './utils/set-caret-line';

const markdownHighlighting = HighlightStyle.define([
  { tag: tags.heading1, class: 'cm-header-1 cm-header' },
  { tag: tags.heading2, class: 'cm-header-2 cm-header' },
  { tag: tags.heading3, class: 'cm-header-3 cm-header' },
  { tag: tags.heading4, class: 'cm-header-4 cm-header' },
  { tag: tags.heading5, class: 'cm-header-5 cm-header' },
  { tag: tags.heading6, class: 'cm-header-6 cm-header' },
]);

type UseCodeMirrorEditorUtils = {
  initDoc: InitDoc,
  appendExtensions: AppendExtensions,
  getDoc: GetDoc,
  focus: Focus,
  setCaretLine: SetCaretLine,
  insertText: InsertText,
  replaceText: ReplaceText,
  insertPrefix: InsertPrefix,
}
export type UseCodeMirrorEditor = {
  state: EditorState | undefined;
  view: EditorView | undefined;
} & UseCodeMirrorEditorUtils;


const defaultExtensions: Extension[] = [
  EditorView.lineWrapping,
  markdown({ base: markdownLanguage, codeLanguages: languages }),
  keymap.of([indentWithTab]),
  Prec.lowest(keymap.of(defaultKeymap)),
  syntaxHighlighting(markdownHighlighting),
  Prec.lowest(syntaxHighlighting(defaultHighlightStyle)),
];

export const useCodeMirrorEditor = (props?: UseCodeMirror): UseCodeMirrorEditor => {

  const mergedProps = useMemo<UseCodeMirror>(() => {
    return deepmerge(
      props ?? {},
      {
        extensions: defaultExtensions,
        // Reset settings of react-codemirror.
        // Extensions are defined first will be used if they have the same priority.
        // If extensions conflict, disable them here.
        // And add them to defaultExtensions: Extension[] with a lower priority.
        // ref: https://codemirror.net/examples/config/
        // ------- Start -------
        indentWithTab: false,
        basicSetup: {
          defaultKeymap: false,
          dropCursor: false,
        },
        // ------- End -------
      },
    );
  }, [props]);

  const { state, view } = useCodeMirror(mergedProps);

  const initDoc = useInitDoc(view);
  const appendExtensions = useAppendExtensions(view);
  const getDoc = useGetDoc(view);
  const focus = useFocus(view);
  const setCaretLine = useSetCaretLine(view);
  const insertText = useInsertText(view);
  const replaceText = useReplaceText(view);
  const insertPrefix = useInsertPrefix(view);

  return {
    state,
    view,
    initDoc,
    appendExtensions,
    getDoc,
    focus,
    setCaretLine,
    insertText,
    replaceText,
    insertPrefix,
  };
};
