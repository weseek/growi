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
