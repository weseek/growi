import React, { FC, useRef, useEffect } from 'react';
import i18n from 'i18next';
import { Picker } from 'emoji-mart';
import EmojiPickerHelper from './EmojiPickerHelper';

type Props = {
  onClose: () => void,
  emojiSearchText: string,
  editor: any
  emojiPickerHelper: EmojiPickerHelper
}

const EmojiPicker: FC<Props> = (props: Props) => {

  const {
    onClose, emojiSearchText, emojiPickerHelper,
  } = props;

  const emojiPickerContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {

    if (emojiSearchText != null) {
      // Get input element of emoji picker search
      const input = document.querySelector('[id^="emoji-mart-search"]') as HTMLInputElement;
      const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      // Set value to input of emoji picker search and trigger the search
      valueSetter?.call(input, emojiSearchText);
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    }

    function handleClickOutside(event) {
      if (emojiPickerContainer.current && !emojiPickerContainer.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };


  }, [emojiPickerContainer, onClose, emojiSearchText]);


  const selectEmoji = (emoji) => {
    if (emojiSearchText !== null) {
      emojiPickerHelper.addEmojiOnSearch(emoji);
    }
    else {
      emojiPickerHelper.addEmoji(emoji);
    }
    props.onClose();
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
    <div className="overlay">
      <div ref={emojiPickerContainer}>
        <Picker autoFocus onSelect={selectEmoji} i18n={translation} title={translation.title} emojiTooltip />
      </div>
    </div>
  );
};

export default EmojiPicker;
