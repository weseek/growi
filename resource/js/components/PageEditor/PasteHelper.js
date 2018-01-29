import accepts from 'attr-accept'

class PasteHelper {

  constructor() {
    // https://regex101.com/r/7BN2fR/3
    this.indentAndMarkPattern = /^([ \t]*)(?:>|\-|\+|\*|\d+\.) /;

    this.pasteText = this.pasteText.bind(this);
    this.adjustPastedData = this.adjustPastedData.bind(this);
  }

  /**
   * paste text
   * @param {any} editor An editor instance of CodeMirror
   * @param {any} event
   */
  pasteText(editor, event) {
    // get data in clipboard
    const text = event.clipboardData.getData('text/plain');

    if (text.length == 0) { return; }

    const curPos = editor.getCursor();
    const bol = { line: curPos.line, ch: 0 }; // beginning of line

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

    // list data (starts with indent and mark)
    if (text.match(this.indentAndMarkPattern)) {
      const indent = indentAndMark.match(this.indentAndMarkPattern)[1];

      // splice to an array of line
      const lines = text.match(/[^\r\n]+/g);
      // indent
      const replacedLines = lines.map((line) => {
        return indent + line;
      })

      adjusted = replacedLines.join('\n');
    }
    // listful data
    else if (this.isListfulData(text)) {
      // do nothing (return null)
    }
    // not listful data
    else {
      // append `indentAndMark` at the beginning of all lines (except the first line)
      const replacedText = text.replace(/(\r\n|\r|\n)/g, "$1" + indentAndMark);
      // append `indentAndMark` to the first line
      adjusted = indentAndMark + replacedText;
    }

    return adjusted;
  }

  /**
   * evaluate whether `text` is list like data or not
   * @param {string} text
   */
  isListfulData(text) {
    // return false if includes at least one blank line
    // see https://stackoverflow.com/a/16369725
    if (text.match(/^\s*[\r\n]/m) != null) {
      return false;
    }

    const lines = text.match(/[^\r\n]+/g);
    // count lines that starts with indent and mark
    let isListful = false;
    let count = 0;
    lines.forEach((line) => {
      if (line.match(this.indentAndMarkPattern)) {
        count++;
      }
      // ensure to be true if it is 50% or more
      if (count >= lines.length / 2) {
        isListful = true;
        return;
      }
    });

    return isListful;
  }


  // Firefox versions prior to 53 return a bogus MIME type for every file drag, so dragovers with
  /**
   * transplanted from react-dropzone
   * @see https://github.com/react-dropzone/react-dropzone/blob/master/src/utils/index.js
   *
   * @param {*} file
   * @param {*} accept
   */
  fileAccepted(file, accept) {
    return file.type === 'application/x-moz-file' || accepts(file, accept)
  }
  /**
   * transplanted from react-dropzone
   * @see https://github.com/react-dropzone/react-dropzone/blob/master/src/utils/index.js
   *
   * @param {*} file
   * @param {number} maxSize
   * @param {number} minSize
   */
  fileMatchSize(file, maxSize, minSize) {
    return file.size <= maxSize && file.size >= minSize
  }
}

// singleton pattern
const instance = new PasteHelper();
Object.freeze(instance);
export default instance;
