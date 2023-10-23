import { type CompletionContext, type Completion, autocompletion } from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';
import { Extension } from '@codemirror/state';
import { emojiIndex } from 'emoji-mart';
import emojiData from 'emoji-mart/data/all.json';

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
  tag => ({ label: `:${tag}:`, type: tag }),
);

const emojiAutocompletion = (context: CompletionContext) => {
  const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
  const textBefore = context.state.sliceDoc(nodeBefore.from, context.pos);
  const emojiBefore = /:\w{2,}$/.exec(textBefore);

  if (!emojiBefore && !context.explicit) return null;

  return {
    from: emojiBefore ? nodeBefore.from + emojiBefore.index : context.pos,
    options: emojiOptions,
    validFor: /^:\w{2,}$/,
  };
};

const emojiAutocompletionSettings = autocompletion({
  addToOptions: [{
    render: (completion: Completion) => {
      const emojiName = completion.type ?? '';
      const emojiData = emojiIndex.emojis[emojiName];

      const emoji = emojiData.native ?? emojiData[1].native;

      const element = document.createElement('span');
      element.innerHTML = emoji;
      return element;
    },
    position: 20,
  }],
  icons: false,
  override: [emojiAutocompletion],
});

export const useEmojiAutocompletion = (): Extension => {
  return emojiAutocompletionSettings;
};
