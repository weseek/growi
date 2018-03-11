import * as codemirror from 'codemirror';

class MarkdownTableHelper {

  constructor() {
    // https://stackoverflow.com/questions/9837935/regex-for-markdown-table-syntax
    // https://regex101.com/r/7BN2fR/6
    this.tableTitleAndHeaderAndBodyRE = /\|(?:([^\r\n\|]*)\|)+\r?\n\|(?:(\:?-+\:?)\|)+\r?\n(\|(?:([^\r\n\|]*)\|)+\r?\n)+/;

    this.isMatchedContext = this.isMatchedContext.bind(this);
    this.handleNewLine = this.handleNewLine.bind(this);

    this.newlineAndIndentContinueMarkdownTable = this.newlineAndIndentContinueMarkdownTable.bind(this);
    this.pasteText = this.pasteText.bind(this);

    this.getBot = this.getBot.bind(this);
    this.getEot = this.getEot.bind(this);
    this.getBol = this.getBol.bind(this);
    this.getStrFromBot = this.getStrFromBot.bind(this);
    this.getStrFromBol = this.getStrFromBol.bind(this);
  }

  /**
   * return whether context is matched by table
   * @param {any} editor An editor instance of CodeMirror
   */
  isMatchedContext(editor) {
    console.log('MarkdownTableHelper.isMatchedContext');
    // get strings from BOL(beginning of line) to current position
    const strFromBot = this.getStrFromBot(editor);
    console.log('strFromBol: ' + strFromBot);
    console.log('will return ' + (this.tableTitleAndHeaderAndBodyRE.test(strFromBot) ? 'true' : 'false'));
    return this.tableTitleAndHeaderAndBodyRE.test(strFromBot);
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
    if (!this.isMatchedContext(editor)) {
      return;
    }

    // get lines all of table from current position to beginning of table
    const strTableLines = this.getStrFromBot(editor);
    // [TODO] Format table lines
    strTableLinesFormated = strTableLines;
    // replace the lines to strFormatedTableLines
    editor.getDoc().replaceRange(strTableLinesFormated, this.getBot(editor), this.getEot(editor));
    codemirror.commands.newline(editor);
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
   */
  getBot(editor) {
    // [TODO] return the postion of the BOT(beginning of table)
    const curPos = editor.getCursor();
    return { line: curPos.line, ch: 0 };
  }

  /**
   * return the postion of the EOT(end of table)
   */
  getEot(editor) {
    // [TODO] return the postion of the EOT(end of table)
    const curPos = editor.getCursor();
    const lineLength = editor.getDoc().getLine(curPos.line).length;
    return { line: curPos.line, ch: lineLength };
  }

  /**
   * return the postion of the BOL(beginning of line)
   */
  getBol(editor) {
    const curPos = editor.getCursor();
    return { line: curPos.line, ch: 0 };
  }

  /**
   * return strings from current position to BOL(beginning of table)
   */
  getStrFromBot(editor) {
    const curPos = editor.getCursor();
    return editor.getDoc().getRange(this.getBot(editor), curPos);
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
