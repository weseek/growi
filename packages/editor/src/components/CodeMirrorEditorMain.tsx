import { useEffect } from 'react';

import type { CompletionContext } from '@codemirror/autocomplete';
import { markdownLanguage } from '@codemirror/lang-markdown';
import { syntaxTree } from '@codemirror/language';
import type { Extension } from '@codemirror/state';
import { keymap, scrollPastEnd } from '@codemirror/view';
import emojiData from 'emoji-mart/data/all.json';

import { GlobalCodeMirrorEditorKey } from '../consts';
import { useCodeMirrorEditorIsolated } from '../stores';

import { CodeMirrorEditor } from '.';


const additionalExtensions: Extension[] = [
  scrollPastEnd(),
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

  return {
    from: emojiBefore ? nodeBefore.from + emojiBefore.index : context.pos,
    options: emojiOptions,
    validFor: /^(:\w*)?$/,
  };
};


type Props = {
  onChange?: (value: string) => void,
  onSave?: () => void,
  indentSize?: number,
}

export const CodeMirrorEditorMain = (props: Props): JSX.Element => {
  const {
    onSave, onChange, indentSize,
  } = props;

  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);

  // setup additional extensions
  useEffect(() => {
    return codeMirrorEditor?.appendExtensions?.(additionalExtensions);
  }, [codeMirrorEditor]);

  // set handler to save with shortcut key
  useEffect(() => {
    if (onSave == null) {
      return;
    }

    const extension = keymap.of([
      {
        key: 'Mod-s',
        preventDefault: true,
        run: () => {
          const doc = codeMirrorEditor?.getDoc();
          if (doc != null) {
            onSave();
          }
          return true;
        },
      },
    ]);

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(extension);

    return cleanupFunction;
  }, [codeMirrorEditor, onSave]);

  markdownLanguage.data.of({
    autocomplete: completeEmojiInput,
  });

  return (
    <CodeMirrorEditor
      editorKey={GlobalCodeMirrorEditorKey.MAIN}
      onChange={onChange}
      indentSize={indentSize}
    />
  );
};
