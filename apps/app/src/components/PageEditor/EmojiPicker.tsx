import React, { FC, useCallback } from 'react';

import { Picker } from 'emoji-mart';
import { Modal } from 'reactstrap';

import { useNextThemes } from '~/stores/use-next-themes';

import EmojiPickerHelper, { getEmojiTranslation } from './EmojiPickerHelper';


import 'emoji-mart/css/emoji-mart.css';


type Props = {
  onClose: () => void,
  onSelected: (emoji: string) => void,
  emojiSearchText: string,
  emojiPickerHelper: EmojiPickerHelper,
  isOpen: boolean
}

const EmojiPicker: FC<Props> = (props: Props) => {

  const {
    onClose, onSelected, emojiSearchText, emojiPickerHelper, isOpen,
  } = props;

  const { resolvedTheme } = useNextThemes();

  // Set search emoji input and trigger search
  const searchEmoji = useCallback(() => {
    const input = window.document.querySelector('[id^="emoji-mart-search"]') as HTMLInputElement;
    const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    valueSetter?.call(input, emojiSearchText);
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
    input.focus();
  }, [emojiSearchText]);

  const selectEmoji = useCallback((emoji) => {
    onSelected(emoji);
    onClose();
  }, [onClose, onSelected]);


  const translation = getEmojiTranslation();

  return (
    <Modal isOpen={isOpen} toggle={onClose} onOpened={searchEmoji} backdropClassName="emoji-picker-modal" fade={false}>
      <Picker
        onSelect={selectEmoji}
        i18n={translation}
        title={translation.title}
        emojiTooltip
        style={emojiPickerHelper.setStyle()}
        theme={resolvedTheme}
      />
    </Modal>
  );
};

export default EmojiPicker;
