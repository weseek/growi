import React, { useState, CSSProperties } from 'react';

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

  const [itemColor, setItemColor] = useState('');

  const onClickEmojiHintItemHandler = () => {};

  const hoverOnHandler = () => {
    setItemColor('#0d6efd');
  };

  const hoverOutHandler = () => {
    setItemColor('');
  };

  return (
    <div>
      <div
        className="d-flex align-items-center pt-2 pb-2 ps-2"
        onMouseEnter={() => hoverOnHandler()}
        onMouseLeave={() => hoverOutHandler()}
        style={{ backgroundColor: itemColor }}
      >
        <Emoji emoji={emojiName} size={16} />
        <p className="mb-0 ps-1">:{emojiName}</p>
      </div>
    </div>
  );
};

const EmojiHintModalStyle = {
  maxHeight: '40vh',
  overflowY: 'auto',
  width: '70vh',
};

export const EmojiHint = () => {
  const suggestedEmojiArray = useEmojiAutoCompletion('f');
  return (
    <div style={EmojiHintModalStyle} className="modal-content">
      {suggestedEmojiArray.map(emojiName => (
        <EmojiHintItem emojiName={emojiName} />
      ))}
    </div>
  );
};
