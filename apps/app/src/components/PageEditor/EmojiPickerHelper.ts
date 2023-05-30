import { CSSProperties } from 'react';

import { Position } from 'codemirror';
import i18n from 'i18next';

// https://regex101.com/r/x5LbOZ/1
const EMOJI_PATTERN = new RegExp(/^:[a-z0-9-+_]+$/);

export default class EmojiPickerHelper {

  editor;

  pattern: string;

  constructor(editor) {
    this.editor = editor;
  }

  setStyle = (): CSSProperties => {
    const offset = 20;
    const emojiPickerHeight = 420;
    const cursorPos = this.editor.cursorCoords(true);
    const editorPos = this.editor.getWrapperElement().getBoundingClientRect();
    // Emoji Picker bottom position exceed editor's bottom position
    if (cursorPos.bottom + emojiPickerHeight > editorPos.bottom) {
      return {
        top: editorPos.bottom - emojiPickerHeight,
        left: cursorPos.left + offset,
        position: 'fixed',
      };
    }
    return {
      top: cursorPos.top + offset,
      left: cursorPos.left + offset,
      position: 'fixed',
    };
  };

  shouldModeTurnOn = (char: string): Position | null | undefined => {
    if (char !== ':') {
      return null;
    }

    const currentPos = this.editor.getCursor();
    const sc = this.editor.getSearchCursor(':', currentPos, { multiline: false });
    if (sc.findPrevious()) {
      return sc.pos.from;
    }
  };

  shouldOpen = (startPos: Position): boolean => {
    const currentPos = this.editor.getCursor();
    const rangeStr = this.editor.getRange(startPos, currentPos);

    return EMOJI_PATTERN.test(rangeStr);
  };

  getInitialSearchingText = (startPos: Position): void => {
    const currentPos = this.editor.getCursor();
    const rangeStr = this.editor.getRange(startPos, currentPos);

    return rangeStr.slice(1); // return without the heading ':'
  };

  addEmoji = (emoji: { colons: string }, startPosToReplace: Position|null): void => {
    const currentPos = this.editor.getCursor();

    const from = startPosToReplace ?? currentPos;
    const to = currentPos;

    const doc = this.editor.getDoc();
    doc.replaceRange(`${emoji.colons} `, from, to);
    this.editor.focus();
    this.editor.refresh();
  };

}

export const getEmojiTranslation = () => {

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
