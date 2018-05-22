import markdownTable from 'markdown-table';
import stringWidth from 'string-width';

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

    this.parseFromTableStringToMarkdownTable = this.parseFromTableStringToMarkdownTable.bind(this);
    this.replaceMarkdownTableWithReformed = this.replaceMarkdownTableWithReformed.bind(this);
  }

  /**
   * return the postion of the BOT(beginning of table)
   * (It is assumed that current line is a part of table)
   */
  getBot(editor) {
    const firstLine = editor.getDoc().firstLine();
    const curPos = editor.getCursor();
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
   * (It is assumed that current line is a part of table)
   */
  getEot(editor) {
    const lastLine = editor.getDoc().lastLine();
    const curPos = editor.getCursor();
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
   * returns markdown table whose described by 'markdown-table' format
   *   ref. https://github.com/wooorm/markdown-table
   * @param {string} lines all of table
   */
  parseFromTableStringToMarkdownTable(strMDTable) {
    const arrMDTableLines = strMDTable.split(/(\r\n|\r|\n)/);
    let contents = [];
    let aligns = [];
    for (let n = 0; n < arrMDTableLines.length; n++) {
      const line = arrMDTableLines[n];

      if (this.tableAlignmentLineRE.test(line) && !this.tableAlignmentLineNegRE.test(line)) {
        // parse line which described alignment
        const alignRuleRE = [
          { align: 'c', regex: /^:-+:$/ },
          { align: 'l', regex: /^:-+$/  },
          { align: 'r', regex: /^-+:$/  },
        ];
        let lineText = '';
        lineText = line.replace(/^\||\|$/g, ''); // strip off pipe charactor which is placed head of line and last of line.
        lineText = lineText.replace(/\s*/g, '');
        aligns = lineText.split(/\|/).map(col => {
          const rule = alignRuleRE.find(rule => col.match(rule.regex));
          return (rule != undefined) ? rule.align : '';
        });
      }
      else if (this.linePartOfTableRE.test(line)) {
        // parse line whether header or body
        let lineText = '';
        lineText = line.replace(/\s*\|\s*/g, '|');
        lineText = lineText.replace(/^\||\|$/g, ''); // strip off pipe charactor which is placed head of line and last of line.
        const row = lineText.split(/\|/);
        contents.push(row);
      }
    }
    return (new MarkdownTable(contents, { align: aligns, stringLength: stringWidth }));
  }

  /**
   * return boolean value whether the current position of cursor is end of line
   */
  isEndOfLine(editor) {
    const curPos = editor.getCursor();
    return (curPos.ch == editor.getDoc().getLine(curPos.line).length);
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
   * replace markdown table which is reformed by markdown-table
   * @param {MarkdownTable} markdown table
   */
  replaceMarkdownTableWithReformed(editor, table) {
    const curPos = editor.getCursor();

    // replace the lines to strTableLinesFormated
    const strTableLinesFormated = table.toString();
    editor.getDoc().replaceRange(strTableLinesFormated, this.getBot(editor), this.getEot(editor));

    // set cursor to first column
    editor.getDoc().setCursor(curPos.line + 1, 2);
  }
}

/**
 * markdown table class for markdown-table module
 *   ref. https://github.com/wooorm/markdown-table
 */
class MarkdownTable {

  constructor(table, options) {
    this.table = table || [];
    this.options = options || {};

    this.toString = this.toString.bind(this);
  }

  toString() {
    return markdownTable(this.table, this.options);
  }
}

// singleton pattern
const instance = new MarkdownTableUtil();
Object.freeze(instance);
export default instance;
