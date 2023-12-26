/**
 * Utility for markdown list
 */
class MarkdownListUtil {

  constructor() {
    // https://github.com/codemirror/CodeMirror/blob/c7853a989c77bb9f520c9c530cbe1497856e96fc/addon/edit/continuelist.js#L14
    // https://regex101.com/r/7BN2fR/5
    this.indentAndMarkRE = /^(\s*)(>[> ]*|[*+-] \[[x ]\]\s|[*+-]\s|(\d+)([.)]))(\s*)/;
    this.indentAndMarkOnlyRE = /^(\d+)[.)](\s*)$/;

    this.newlineAndIndentContinueMarkdownList = this.newlineAndIndentContinueMarkdownList.bind(this);
    this.pasteText = this.pasteText.bind(this);
  }

  insertText(editor, text) {
    editor.dispatch({
      changes: {
        insert: text,
      },
    });
  }

  /**
   * return the postion of the BOL(beginning of line)
   */
  getBol(editor) {
    const curPos = editor.state.selection.main.head;
    return editor.state.doc.lineAt(curPos).from;
  }

  getStrFromBol(editor) {
    const curPos = editor.state.selection.main.head;
    return editor.state.sliceDoc(this.getBol(), curPos);
  }

  /**
   * select the upper position of pos1 and pos2
   * @param {{line: number, ch: number}} pos1
   * @param {{line: number, ch: number}} pos2
   */
  selectUpperPos(editor, pos1, pos2) {
    // if both is in same line
    if (editor.state.doc.lineAt(pos1) === editor.state.doc.lineAt(pos2)) {
      return (editor.state.doc.lineAt(pos1).from < editor.state.doc.lineAt(pos1).to) ? pos1 : pos2;
    }
    return (editor.state.doc.lineAt(pos1) < editor.state.doc.lineAt(pos2)) ? pos1 : pos2;
  }

  /**
   * select the lower position of pos1 and pos2
   * @param {{line: number, ch: number}} pos1
   * @param {{line: number, ch: number}} pos2
   */
  selectLowerPos(editor, pos1, pos2) {
    // if both is in same line
    if (editor.state.doc.lineAt(pos1).number === editor.state.doc.lineAt(pos2).number) {
      return (editor.state.doc.lineAt(pos1).from < editor.state.doc.lineAt(pos1).to) ? pos2 : pos1;
    }
    return (editor.state.doc.lineAt(pos1) < editor.state.doc.lineAt(pos2)) ? pos2 : pos1;
  }

  replaceBolToCurrentPos(editor, text) {
    const curPos = editor.state.selection.main.head;
    const pos = this.selectLowerPos(editor.state.doc.lineAt(curPos).from, editor.state.doc.lineAt(curPos).to);
    editor.dispatch({
      changes: {
        from: this.getBol(editor),
        to: pos,
        insert: text,
      },
    });
  }

  getStrFromBolToSelectedUpperPos(editor) {
    const curPos = editor.state.selection.main.head;
    const pos = this.selectUpperPos(editor.state.doc.lineAt(curPos).from, editor.state.doc.lineAt(curPos).to);
    return editor.state.sliceDoc(this.getBol(), pos);
  }

  /**
   * paste text
   * @param {AbstractEditor} editor An instance of AbstractEditor
   * @param {any} event
   * @param {string} text
   */
  pasteText(editor, event, text) {
    // get strings from BOL(beginning of line) to current position
    const strFromBol = this.getStrFromBolToSelectedUpperPos();

    // when match indentAndMarkOnlyRE
    // (this means the current position is the beginning of the list item)
    if (this.indentAndMarkOnlyRE.test(strFromBol)) {
      const adjusted = this.adjustPastedData(strFromBol, text);

      // replace
      if (adjusted != null) {
        event.preventDefault();
        this.replaceBolToCurrentPos(editor, adjusted);
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
    if (text.match(this.indentAndMarkRE)) {
      const indent = indentAndMark.match(this.indentAndMarkRE)[1];

      // splice to an array of line
      const lines = text.match(/[^\r\n]+/g);
      // indent
      const replacedLines = lines.map((line) => {
        return indent + line;
      });

      adjusted = replacedLines.join('\n');
    }
    // listful data
    else if (this.isListfulData(text)) {
      // do nothing (return null)
    }
    // not listful data
    else {
      // append `indentAndMark` at the beginning of all lines (except the first line)
      const replacedText = text.replace(/(\r\n|\r|\n)/g, `$1${indentAndMark}`);
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
      if (line.match(this.indentAndMarkRE)) {
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

}

// singleton pattern
const instance = new MarkdownListUtil();
Object.freeze(instance);
export default instance;
