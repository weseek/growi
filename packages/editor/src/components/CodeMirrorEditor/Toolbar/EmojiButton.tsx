import React, { useState } from 'react';

import { Modal } from 'reactstrap';

import { getEmojiTranslation } from '~/components/Emoji/EmojiPickerHelper';

import 'emoji-mart/css/emoji-mart.css';

export const EmojiButton = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  const onClickEmojiButtonHandler = () => {
    setIsOpen(!isOpen);
  };

  const translation = getEmojiTranslation();

  return (
    <>
      <button type="button" className="btn btn-toolbar-button" onClick={onClickEmojiButtonHandler}>
        <span className="material-icons-outlined fs-6">emoji_emotions</span>
      </button>
      <Modal isOpen={isOpen} toggle={setIsOpen(false)}>
        <Picker
          onSelect={emoji => console.log(emoji)}
          i18n={translation}
          title={translation.title}
          emojiTooltip
        />
      </Modal>
    </>
  );
};
