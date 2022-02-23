import i18n from 'i18next';

export default class EmojiPickerHelper {

editor;

pattern: RegExp;

constructor(editor) {
  this.editor = editor;
  this.pattern = /:[^:\s]+/;
}


getSearchCursor() {
  const currentPos = this.editor.getCursor();
  const sc = this.editor.getSearchCursor(this.pattern, currentPos, { multiline: false });
  return sc;
}

// Add emoji when triggered by search
addEmojiOnSearch = (emoji) => {
  const currentPos = this.editor.getCursor();
  const sc = this.getSearchCursor();
  if (sc.findPrevious()) {
    sc.replace(emoji.colons, this.editor.getTokenAt(currentPos).string);
    this.editor.focus();
    this.editor.refresh();
  }
}


// Add emoji when triggered by click emoji icon on top of editor
addEmoji = (emoji) => {
  const currentPos = this.editor.getCursor();
  const doc = this.editor.getDoc();
  doc.replaceRange(emoji.colons, currentPos);
  this.editor.focus();
  this.editor.refresh();
}

getEmoji = () => {
  const sc = this.getSearchCursor();
  const currentPos = this.editor.getCursor();

  if (sc.findPrevious()) {
    const isInputtingEmoji = (currentPos.line === sc.to().line && currentPos.ch === sc.to().ch);
    // current search cursor position
    if (!isInputtingEmoji) {
      return;
    }
    const pos = {
      line: sc.to().line,
      ch: sc.to().ch,
    };
    const currentSearchText = sc.matches(true, pos).match[0];
    const searchValue = currentSearchText.replace(':', '');
    return searchValue;
  }

  return;

}

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
