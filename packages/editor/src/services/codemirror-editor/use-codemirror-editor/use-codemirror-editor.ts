import { useMemo } from 'react';

import type { CompletionContext } from '@codemirror/autocomplete';
import { indentWithTab, defaultKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { syntaxTree } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { EditorState, Prec, type Extension } from '@codemirror/state';
import { keymap, EditorView } from '@codemirror/view';
import { useCodeMirror, type UseCodeMirror } from '@uiw/react-codemirror';
import emojiData from 'emoji-mart/data/all.json';
import deepmerge from 'ts-deepmerge';

import { useAppendExtensions, type AppendExtensions } from './utils/append-extensions';
import { useFocus, type Focus } from './utils/focus';
import { useGetDoc, type GetDoc } from './utils/get-doc';
import { useInitDoc, type InitDoc } from './utils/init-doc';
import { useSetCaretLine, type SetCaretLine } from './utils/set-caret-line';

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
];

const getEmojiDataArray = (): string[] => {
  const rawEmojiDataArray = emojiData.categories;

  const emojiCategoriesData = [
    'people',
    'nature',
    'foods',
    'activity',
    'places',
    'objects',
    'symbols',
    'flags',
  ];

  const fixedEmojiDataArray: string[] = [];

  emojiCategoriesData.forEach((value) => {
    const tempArray = rawEmojiDataArray.find(obj => obj.id === value)?.emojis;

    if (tempArray == null) {
      return;
    }

    fixedEmojiDataArray.push(...tempArray);
  });

  return fixedEmojiDataArray;
};

const emojiDataArray = getEmojiDataArray();

const emojiOptions = emojiDataArray.map(
  tag => ({ label: `:${tag}:`, type: 'keyword' }),
);

const completeEmojiInput = (context: CompletionContext) => {
  const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
  const textBefore = context.state.sliceDoc(nodeBefore.from, context.pos);
  const emojiBefore = /:\w*$/.exec(textBefore);

  if (!emojiBefore && !context.explicit) return null;

  console.log('kohsei');

  return {
    from: emojiBefore ? nodeBefore.from + emojiBefore.index : context.pos,
    options: emojiOptions,
    validFor: /^(:\w*)?$/,
  };
};

const emojiCompletion = markdownLanguage.data.of({
  autocomplete: completeEmojiInput,
});

export const useCodeMirrorEditor = (props?: UseCodeMirror): UseCodeMirrorEditor => {

  const mergedProps = useMemo(() => {
    return deepmerge(
      props ?? {},
      {
        extensions: [
          defaultExtensions,
          emojiCompletion,
        ],
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
