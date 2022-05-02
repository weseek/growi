import React, { FC } from 'react';

import { Picker } from 'emoji-mart';
import { Modal } from 'reactstrap';

import { isDarkMode } from '~/client/util/color-scheme';

import EmojiPickerHelper, { getEmojiTranslation } from './EmojiPickerHelper';

type Props = {
  onClose: () => void,
  emojiSearchText: string,
  emojiPickerHelper: EmojiPickerHelper,
  isOpen: boolean
}

const EmojiPicker: FC<Props> = (props: Props) => {

  const {
    onClose, emojiSearchText, emojiPickerHelper, isOpen,
  } = props;

  // Set search emoji input and trigger search
  const searchEmoji = () => {
    const input = window.document.querySelector('[id^="emoji-mart-search"]') as HTMLInputElement;
    let emojiList;
    if (emojiSearchText !== null) {

      const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      valueSetter?.call(input, emojiSearchText);
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
      input.focus();


    }
    const emojiCategoryList = window.document.querySelector('.emoji-mart-category-list');

    ['keyup', 'focus'].forEach((event) => {
      input.addEventListener(event, () => {
        emojiList = window.document.querySelectorAll('.emoji-mart-category:not([style*="display: none"]) > .emoji-mart-category-list > li');
      });
    });
    console.log(emojiList);

  };

  const selectEmoji = (emoji) => {
    if (emojiSearchText !== null) {
      emojiPickerHelper.addEmojiOnSearch(emoji);
    }
    else {
      emojiPickerHelper.addEmoji(emoji);
    }
    onClose();
  };


  const translation = getEmojiTranslation();
  const theme = isDarkMode() ? 'dark' : 'light';

  return (
    <Modal isOpen={isOpen} toggle={onClose} onOpened={searchEmoji} backdropClassName="emoji-picker-modal" fade={false}>
      <Picker
        onSelect={selectEmoji}
        i18n={translation}
        title={translation.title}
        emojiTooltip
        style={emojiPickerHelper.setStyle()}
        theme={theme}
      />
    </Modal>
  );
};

export default EmojiPicker;
