class EmojiPickerHelper {

  constructor(editor) {
    this.editor = editor;
    this.getSearchCursor = this.getSearchCursor.bind(this);
    this.addEmoji = this.addEmoji.bind(this);
  }

  getSearchCursor() {
    const pattern = /:[^:\s]+/;
    const currentPos = this.editor.getCursor();
    const sc = this.editor.getSearchCursor(pattern, currentPos, { multiline: false });
    return sc;
  }

  addEmoji(emoji) {
    const currentPos = this.editor.getCursor();
    const doc = this.editor.getDoc();
    const sc = this.getSearchCursor();
    if (sc.findPrevious()) {
      sc.replace(emoji.colons, this.editor.getTokenAt(currentPos).string);
      this.editor.focus();
    }
    else {
      doc.replaceRange(emoji.colons, currentPos);
      this.editor.focus();
    }

  }


}

export default EmojiPickerHelper;
