import React, { FC } from 'react';


import { Emoji } from 'emoji-mart';
import emojiData from 'emoji-mart/data/all.json';

import { useEmojiHintModal } from '~/stores/modal';
import 'emoji-mart/css/emoji-mart.css';

import { EmojiHintItem } from './EmojiHintItem';

import type { UseCodeMirrorEditor } from 'src';

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

const EmojiHintModalStyle = {
  maxHeight: '40vh',
  overflowY: 'auto',
  width: '70vh',
};

type EmojiHintProps = {
  codeMirrorEditor: UseCodeMirrorEditor | undefined,
}

export const EmojiHint: FC<EmojiHintProps> = (props) => {
  const { codeMirrorEditor } = props;

  const { data: emojiHintModalData } = useEmojiHintModal();

  const { isOpened } = emojiHintModalData;

  const suggestedEmojiArray = useEmojiAutoCompletion('f');

  return (
    <>
      {
        isOpened
          ? (
            <div style={EmojiHintModalStyle} className="modal-content">
              {suggestedEmojiArray.map(emojiName => (
                <EmojiHintItem codeMirrorEditor={codeMirrorEditor} emojiName={emojiName} />
              ))}
            </div>
          ) : (
            ''
          )
      }
    </>
  );
};
