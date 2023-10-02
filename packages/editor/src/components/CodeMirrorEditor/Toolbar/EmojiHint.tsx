import React from 'react';

import { Emoji } from 'emoji-mart';
import emojiData from 'emoji-mart/data/all.json';
import 'emoji-mart/css/emoji-mart.css';

export const useEmojiAutoCompletion = (inputChar: string): string[] => {
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

  const suggestedEmojiArray = fixedEmojiDataArray.filter((element) => {
    return element.startsWith(inputChar);
  });

  console.dir(suggestedEmojiArray);

  suggestedEmojiArray.sort((a, b) => { return a.length - b.length });

  return suggestedEmojiArray;
};

const EmojiHintItem = (props) => {
  const { emojiName } = props;

  const onClickEmojiHintItemHandler = () => {};

  return (
    <div>
      <div className="d-flex align-items-center mt-2 mb-2">
        <Emoji emoji={emojiName} size={16} />
        <p className="mb-0 ps-1">:{emojiName}</p>
      </div>
    </div>
  );
};

export const EmojiHint = () => {
  const suggestedEmojiArray = useEmojiAutoCompletion('fr');

  return (
    <div>
      {suggestedEmojiArray.map(emojiName => (
        <EmojiHintItem emojiName={emojiName} />
      ))}
    </div>
  );
};
