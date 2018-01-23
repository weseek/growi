class PasteHelper {

  constructor() {
    // https://regex101.com/r/7BN2fR/2
    this.indentAndMarkPattern = /^([ \t]*)(?:>|\-|\+|\*|\d+\.) /;

    this.pasteHandler = this.pasteHandler.bind(this);
    this.pasteText = this.pasteText.bind(this);
    this.adjustPastedData = this.adjustPastedData.bind(this);
  }

  /**
   * CodeMirror paste event handler
   * see: https://codemirror.net/doc/manual.html#events
   * @param {any} editor An editor instance of CodeMirror
   * @param {any} event
   */
  pasteHandler(editor, event) {
    if (event.clipboardData.types.includes('text/plain') > -1) {
      this.pasteText(editor, event);
    }
  }

  /**
   * paste text
   * @param {any} editor An editor instance of CodeMirror
   * @param {any} event
   */
  pasteText(editor, event) {
    // get data in clipboard
    let text = event.clipboardData.getData('text/plain');

    if (text.length == 0) { return; }

    const curPos = editor.getCursor();
    // calc BOL (beginning of line)
    const bol = { line: curPos.line, ch: 0 };


    // get strings from BOL(beginning of line) to current position
    const strFromBol = editor.getDoc().getRange(bol, curPos);

    const matched = strFromBol.match(this.indentAndMarkPattern);
    // when match completely to pattern
    // (this means the current position is the beginning of the list item)
    if (matched && matched[0] == strFromBol) {
      const adjusted = this.adjustPastedData(strFromBol, text);

      // replace
      if (adjusted != null) {
        event.preventDefault();
        editor.getDoc().replaceRange(adjusted, bol, curPos);
      }
    }
  }

  /**
   * return adjusted pasted data by indentAndMark
   *
   * @param {string} indentAndMark
   * @param {string} text
   * @returns adjusted pasted data
   *      returns null when adjustment is not necessary
   */
  adjustPastedData(indentAndMark, text) {
    let adjusted = null;

    // e.g. '-item ...'
    if (text.match(this.indentAndMarkPattern)) {
      const indent = indentAndMark.match(this.indentAndMarkPattern)[1];

      const lines = text.match(/[^\r\n]+/g);
      const replacedLines = lines.map((line) => {
        return indent + line;
      })

      adjusted = replacedLines.join('\n');
    }

    return adjusted;
  }

}

// singleton pattern
const instance = new PasteHelper();
Object.freeze(instance);
export default instance;
