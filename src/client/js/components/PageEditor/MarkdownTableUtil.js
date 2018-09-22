import MarkdownTable from '../../models/MarkdownTable';

/**
 * Utility for markdown table
 */
class MarkdownTableUtil {

  constructor() {
    // https://github.com/markdown-it/markdown-it/blob/d29f421927e93e88daf75f22089a3e732e195bd2/lib/rules_block/table.js#L83
    // https://regex101.com/r/7BN2fR/7
    this.tableAlignmentLineRE = /^[-:|][-:|\s]*$/;
    this.tableAlignmentLineNegRE = /^[^-:]*$/;  // it is need to check to ignore empty row which is matched above RE
    this.linePartOfTableRE = /^\|[^\r\n]*|[^\r\n]*\|$|([^|\r\n]+\|[^|\r\n]*)+/; // own idea

    this.getBot = this.getBot.bind(this);
    this.getEot = this.getEot.bind(this);
    this.getBol = this.getBol.bind(this);
    this.getStrFromBot = this.getStrFromBot.bind(this);
    this.getStrToEot = this.getStrToEot.bind(this);
    this.isInTable = this.isInTable.bind(this);
    this.replaceMarkdownTable = this.replaceMarkdownTable.bind(this);
    this.replaceMarkdownTableWithReformed = this.replaceMarkdownTable; // alias
  }

  /**
   * return the postion of the BOT(beginning of table)
   * (If the cursor is not in a table, return its position)
   */
  getBot(editor) {
    const curPos = editor.getCursor();
    if (!this.isInTable(editor)) {
      return { line: curPos.line, ch: curPos.ch};
    }

    const firstLine = editor.getDoc().firstLine();
    let line = curPos.line - 1;
    for (; line >= firstLine; line--) {
      const strLine = editor.getDoc().getLine(line);
      if (!this.linePartOfTableRE.test(strLine)) {
        break;
      }
    }
    const botLine = Math.max(firstLine, line + 1);
    return { line: botLine, ch: 0 };
  }

  /**
   * return the postion of the EOT(end of table)
   * (If the cursor is not in a table, return its position)
   */
  getEot(editor) {
    const curPos = editor.getCursor();
    if (!this.isInTable(editor)) {
      return { line: curPos.line, ch: curPos.ch};
    }

    const lastLine = editor.getDoc().lastLine();
    let line = curPos.line + 1;
    for (; line <= lastLine; line++) {
      const strLine = editor.getDoc().getLine(line);
      if (!this.linePartOfTableRE.test(strLine)) {
        break;
      }
    }
    const eotLine = Math.min(line - 1, lastLine);
    const lineLength = editor.getDoc().getLine(eotLine).length;
    return { line: eotLine, ch: lineLength };
  }

  /**
   * return the postion of the BOL(beginning of line)
   */
  getBol(editor) {
    const curPos = editor.getCursor();
    return { line: curPos.line, ch: 0 };
  }

  /**
   * return strings from BOT(beginning of table) to the cursor position
   */
  getStrFromBot(editor) {
    const curPos = editor.getCursor();
    return editor.getDoc().getRange(this.getBot(editor), curPos);
  }

  /**
   * return strings from the cursor position to EOT(end of table)
   */
  getStrToEot(editor) {
    const curPos = editor.getCursor();
    return editor.getDoc().getRange(curPos, this.getEot(editor));
  }

  /**
   * return MarkdownTable instance of the table where the cursor is
   * (If the cursor is not in a table, return null)
   */
  getMarkdownTable(editor) {
    if (!this.isInTable(editor)) {
      return null;
    }

    const strFromBotToEot = editor.getDoc().getRange(this.getBot(editor), this.getEot(editor));
    return MarkdownTable.fromMarkdownString(strFromBotToEot);
  }

  /**
   * return boolean value whether the cursor position is end of line
   */
  isEndOfLine(editor) {
    const curPos = editor.getCursor();
    return (curPos.ch == editor.getDoc().getLine(curPos.line).length);
  }

  /**
   * return boolean value whether the cursor position is in a table
   */
  isInTable(editor) {
    const curPos = editor.getCursor();
    return this.linePartOfTableRE.test(editor.getDoc().getLine(curPos.line));
  }

  /**
   * add a row at the end
   * (This function overwrite directory markdown table specified as argument.)
   * @param {MarkdownTable} markdown table
   */
  addRowToMarkdownTable(mdtable) {
    const numCol = mdtable.table.length > 0 ? mdtable.table[0].length : 1;
    let newRow = [];
    (new Array(numCol)).forEach(() => newRow.push('')); // create cols
    mdtable.table.push(newRow);
  }

  /**
   * returns markdown table that is merged all of markdown table in array
   * (The merged markdown table options are used for the first markdown table.)
   * @param {Array} array of markdown table
   */
  mergeMarkdownTable(mdtable_list) {
    if (mdtable_list == undefined
        || !(mdtable_list instanceof Array)) {
      return undefined;
    }

    let newTable = [];
    const options = mdtable_list[0].options; // use option of first markdown-table
    mdtable_list.forEach((mdtable) => {
      newTable = newTable.concat(mdtable.table);
    });
    return (new MarkdownTable(newTable, options));
  }

  /**
   * replace markdown table
   * (A replaced table is reformed by markdown-table.)
   * @param {MarkdownTable} markdown table
   */
  replaceMarkdownTable(editor, table) {
    const curPos = editor.getCursor();
    editor.getDoc().replaceRange(table.toString(), this.getBot(editor), this.getEot(editor));
    editor.getDoc().setCursor(curPos.line + 1, 2);
  }
}

// singleton pattern
const instance = new MarkdownTableUtil();
Object.freeze(instance);
export default instance;
