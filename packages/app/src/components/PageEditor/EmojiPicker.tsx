import React, { FC, useState } from 'react';

import { Picker } from 'emoji-mart';
import i18n from 'i18next';
import { Modal } from 'reactstrap';

import { isDarkMode } from '~/client/util/color-scheme';

import EmojiPickerHelper from './EmojiPickerHelper';

type Props = {
  onClose: () => void,
  emojiSearchText: string,
  editor: any
  emojiPickerHelper: EmojiPickerHelper,
  isOpen: boolean
}

const EmojiPicker: FC<Props> = (props: Props) => {

  const {
    onClose, emojiSearchText, emojiPickerHelper, isOpen,
  } = props;

  const [style, setStyle] = useState({});
  // Set search emoji input and trigger search
  const searchEmoji = () => {
    if (emojiSearchText !== null) {
      const input = window.document.querySelector('[id^="emoji-mart-search"]') as HTMLInputElement;
      const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      valueSetter?.call(input, emojiSearchText);
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
      input.focus();
      const emojiPickerHeight = window.document.querySelector('[id^="emoji-mart-search"]')?.clientHeight;
      setStyle(emojiPickerHelper.getCursorCoords(emojiPickerHeight));
    }
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


  const getEmojiTranslation = () => {

    const categories = {};
    [
      'search',
      'recent',
      'smileys',
      'people',
      'nature',
      'foods',
      'activity',
      'places',
      'objects',
      'symbols',
      'flags',
      'custom',
    ].forEach((category) => {
      categories[category] = i18n.t(`emoji.categories.${category}`);
    });

    const skintones = {};
    (Array.from(Array(6).keys())).forEach((tone) => {
      skintones[tone + 1] = i18n.t(`emoji.skintones.${tone + 1}`);
    });

    const translation = {
      search: i18n.t('emoji.search'),
      clear: i18n.t('emoji.clear'),
      notfound: i18n.t('emoji.notfound'),
      skintext: i18n.t('emoji.skintext'),
      categories,
      categorieslabel: i18n.t('emoji.categorieslabel'),
      skintones,
      title: i18n.t('emoji.title'),
    };

    return translation;
  };

  const translation = getEmojiTranslation();
  const theme = isDarkMode() ? 'dark' : 'light';

  return Object.keys(style).length !== 0 ? (
    <Modal isOpen={isOpen} toggle={onClose} onOpened={searchEmoji}>
      <Picker
        onSelect={selectEmoji}
        i18n={translation}
        title={translation.title}
        emojiTooltip
        style={{ position: 'absolute' }}
        theme={theme}
      />
    </Modal>
  ) : <></>;
};

export default EmojiPicker;
