import { useMemo } from 'react';

import { indentWithTab, defaultKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorState, Prec, type Extension } from '@codemirror/state';
import { keymap, EditorView } from '@codemirror/view';
import { useCodeMirror, type UseCodeMirror } from '@uiw/react-codemirror';
import deepmerge from 'ts-deepmerge';

import { useAppendExtensions, type AppendExtensions } from './utils/append-extensions';
import { useFocus, type Focus } from './utils/focus';
import { useGetDoc, type GetDoc } from './utils/get-doc';
import { useInitDoc, type InitDoc } from './utils/init-doc';
import { useInsertText, type InsertText } from './utils/insert-text';
import { useReplaceText, type ReplaceText } from './utils/replace-text';
import { useSetCaretLine, type SetCaretLine } from './utils/set-caret-line';

type UseCodeMirrorEditorUtils = {
  initDoc: InitDoc,
  appendExtensions: AppendExtensions,
  getDoc: GetDoc,
  focus: Focus,
  setCaretLine: SetCaretLine,
  insertText: InsertText,
  replaceText: ReplaceText,
}
export type UseCodeMirrorEditor = {
  state: EditorState | undefined;
  view: EditorView | undefined;
} & UseCodeMirrorEditorUtils;


const defaultExtensions: Extension[] = [
  markdown({ base: markdownLanguage, codeLanguages: languages }),
  keymap.of([indentWithTab]),
  Prec.lowest(keymap.of(defaultKeymap)),
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
  };
};
