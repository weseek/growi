import * as codemirror from 'codemirror';

class MarkdownTableHelper {

  constructor() {
    // https://github.com/markdown-it/markdown-it/blob/d29f421927e93e88daf75f22089a3e732e195bd2/lib/rules_block/table.js#L83
    // https://regex101.com/r/7BN2fR/7
    this.tableAlignmentLineRE = /^[-:|][-:|\s]*$/;
    this.linePartOfTableRE = /^\|[^\r\n]*|[^\r\n]*\|$|([^\|\r\n]+\|[^\|\r\n]*)+/; // own idea

    this.isMatchedContext = this.isMatchedContext.bind(this);
    this.handleNewLine = this.handleNewLine.bind(this);

    this.newlineAndIndentContinueMarkdownTable = this.newlineAndIndentContinueMarkdownTable.bind(this);
    this.pasteText = this.pasteText.bind(this);

    this.getBot = this.getBot.bind(this);
    this.getEot = this.getEot.bind(this);
    this.getBol = this.getBol.bind(this);
    this.getStrFromBot = this.getStrFromBot.bind(this);
    this.getStrToEot = this.getStrToEot.bind(this);
    this.getStrFromBol = this.getStrFromBol.bind(this);
  }

  /**
   * return whether context is matched by table
   * @param {any} editor An editor instance of CodeMirror
   */
  isMatchedContext(editor) {
    console.log('MarkdownTableHelper.isMatchedContext');
    // get strings from BOL(beginning of line) to current position
    const strFromBol = this.getStrFromBol(editor);
    console.log('strFromBol: ' + strFromBol);
    console.log('will return ' + (this.linePartOfTableRE.test(strFromBol) ? 'true' : 'false'));
    return this.linePartOfTableRE.test(strFromBol);
  }

  /**
   * handle new line
   * @param {any} editor An editor instance of CodeMirror
   */
  handleNewLine(editor) {
    console.log('MarkdownTableHelper.handleNewLine');
    this.newlineAndIndentContinueMarkdownTable(editor);
  }

  /**
   * insert new line with auto shaping format of Markdown table
   * @param {any} editor An editor instance of CodeMirror
   */
  newlineAndIndentContinueMarkdownTable(editor) {
    console.log('MarkdownTableHelper.newlineAndIndentContinueMarkdownTable');
    if (!this.isMatchedContext(editor)) return;

    // get lines all of table from current position to beginning of table
    const strTableLines = this.getStrFromBot(editor) + this.getStrToEot(editor);
    console.log('strTableLines: ' + strTableLines);
    // [TODO] Format table lines
    const strTableLinesFormated = strTableLines;
    // replace the lines to strFormatedTableLines
    editor.getDoc().replaceRange(strTableLinesFormated, this.getBot(editor), this.getEot(editor));
    codemirror.commands.newlineAndIndent(editor);
  }

  /**
   * paste text
   * @param {any} editor An editor instance of CodeMirror
   * @param {any} event
   * @param {string} text
   */
  pasteText(editor, event, text) {
    // [TODO] replace to formated table markdown
  }

  /**
   * return the postion of the BOT(beginning of table)
   * (It is assumed that current line is a part of table)
   */
  getBot(editor) {
    const firstLine = editor.getDoc().firstLine();
    const curPos = editor.getCursor();
    let begLine = curPos.line - 1;
    for (; begLine >= firstLine; begLine--) {
      const strLine = editor.getDoc().getLine(begLine);
      if (!this.linePartOfTableRE.test(strLine)) {
        break;
      }
    }
    return { line: begLine, ch: 0 };
  }

  /**
   * return the postion of the EOT(end of table)
   * (It is assumed that current line is a part of table)
   */
  getEot(editor) {
    const lastLine = editor.getDoc().lastLine();
    const curPos = editor.getCursor();
    let endLine = curPos.line + 1;
    for (; endLine <= lastLine; endLine++) {
      const strLine = editor.getDoc().getLine(endLine);
      if (!this.linePartOfTableRE.test(strLine)) {
        break;
      }
    }
    const lineLength = editor.getDoc().getLine(Math.min(endLine, lastLine)).length;
    return { line: endLine, ch: lineLength };
  }

  /**
   * return the postion of the BOL(beginning of line)
   */
  getBol(editor) {
    const curPos = editor.getCursor();
    return { line: curPos.line, ch: 0 };
  }

  /**
   * return strings from BOT(beginning of table) to current position
   */
  getStrFromBot(editor) {
    const curPos = editor.getCursor();
    return editor.getDoc().getRange(this.getBot(editor), curPos);
  }

  /**
   * return strings from current position to EOT(end of table)
   */
  getStrToEot(editor) {
    const curPos = editor.getCursor();
    return editor.getDoc().getRange(curPos, this.getEot(editor));
  }

  /**
   * return strings from BOL(beginning of line) to current position
   */
  getStrFromBol(editor) {
    const curPos = editor.getCursor();
    return editor.getDoc().getRange(this.getBol(editor), curPos);
  }
}

// singleton pattern
const instance = new MarkdownTableHelper();
Object.freeze(instance);
export default instance;
