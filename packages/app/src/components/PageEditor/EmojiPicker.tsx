import React, {
  FC, useRef, useEffect, useState,
} from 'react';
import { Picker } from 'emoji-mart';
import EmojiPickerHelper, { getEmojiTranslation } from './EmojiPickerHelper';
import { isDarkMode as isDarkModeByUtil } from '~/client/util/color-scheme';

type Props = {
  close: () => void,
  emojiSearchText: string,
  editor: any
}

const EmojiPicker: FC<Props> = (props: Props) => {

  const { close, emojiSearchText, editor } = props;

  const emojiPickerContainer = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(isDarkModeByUtil());
  useEffect(() => {
    setIsDarkMode(isDarkModeByUtil());
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
  };

  const translation = getEmojiTranslation();
  const theme = isDarkMode ? 'dark' : 'light';
  return (
    <div className="overlay">
      <div ref={emojiPickerContainer}>
        <Picker set="apple" autoFocus onSelect={selectEmoji} i18n={translation} title={translation.title} theme={theme} />
      </div>
    </div>
  );
};

export default EmojiPicker;
