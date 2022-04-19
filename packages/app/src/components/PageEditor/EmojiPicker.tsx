import React, { FC } from 'react';

import { Picker } from 'emoji-mart';
import i18n from 'i18next';
import { Modal } from 'reactstrap';

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
  return (
    <Modal isOpen={isOpen} toggle={onClose}>
      <Picker autoFocus onSelect={selectEmoji} i18n={translation} title={translation.title} emojiTooltip />
    </Modal>
  );
};

export default EmojiPicker;
