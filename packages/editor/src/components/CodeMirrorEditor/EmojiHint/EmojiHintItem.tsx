
import React, { FC, useState, CSSProperties } from 'react';


import { Emoji } from 'emoji-mart';
import emojiData from 'emoji-mart/data/all.json';

import { useEmojiHintModal } from '~/stores/modal';
import 'emoji-mart/css/emoji-mart.css';

import type { UseCodeMirrorEditor } from 'src';

type EmojiHintItemProps = {
  emojiName: string,
  codeMirrorEditor: UseCodeMirrorEditor | undefined,
}

export const EmojiHintItem: FC<EmojiHintItemProps> = (props) => {
  const { emojiName, codeMirrorEditor } = props;
  const [itemColor, setItemColor] = useState('');

  const view = codeMirrorEditor?.view;

  if (view == null) {
    return;
  }

  const cursorIndex = view.state.selection.main.head;

  const { close: closeEmojiHintModal } = useEmojiHintModal();

  const onClickEmojiHintItemHandler = () => {
    if (cursorIndex == null) {
      return;
    }

    view?.dispatch({
      changes: {
        from: cursorIndex,
        insert: `${emojiName}:`,
      },
    });

    closeEmojiHintModal();
  };

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
        onClick={() => onClickEmojiHintItemHandler()}
      >
        <Emoji emoji={emojiName} size={16} />
        <p className="mb-0 ps-1">:{emojiName}</p>
      </div>
    </div>
  );
};
