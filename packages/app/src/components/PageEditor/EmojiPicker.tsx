import React, { FC, useRef, useEffect } from 'react';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import EmojiPickerHelper, { getEmojiTranslation } from './EmojiPickerHelper';

type Props = {
  close: () => void,
  emojiSearchText: string,
  editor: any
}

const EmojiPicker: FC<Props> = (props: Props) => {

  const { close, emojiSearchText, editor } = props;

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
        close();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };


  }, [emojiPickerContainer, close, emojiSearchText]);

  const emojiPickerHelper = new EmojiPickerHelper(editor);

  const selectEmoji = (emoji) => {
    if (emojiSearchText !== null) {
      emojiPickerHelper.addEmojiOnSearch(emoji);
    }
    else {
      emojiPickerHelper.addEmoji(emoji);
    }
    props.close();
  };

  const translation = getEmojiTranslation();

  return (
    <div className="overlay">
      <div ref={emojiPickerContainer}>
        <Picker onSelect={selectEmoji} i18n={translation} title={translation.title} emojiTooltip />
      </div>
    </div>
  );
};

export default EmojiPicker;
