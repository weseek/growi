import * as codemirror from 'codemirror';

/**
 * Utility for markdown table
 */
class MarkdownTableUtil {

  constructor() {
    // https://github.com/markdown-it/markdown-it/blob/d29f421927e93e88daf75f22089a3e732e195bd2/lib/rules_block/table.js#L83
    // https://regex101.com/r/7BN2fR/7
    this.tableAlignmentLineRE = /^[-:|][-:|\s]*$/;
    this.tableAlignmentLineNegRE = /^[^-:]*$/;  // it is need to check to ignore empty row which is matched above RE
    this.linePartOfTableRE = /^\|[^\r\n]*|[^\r\n]*\|$|([^\|\r\n]+\|[^\|\r\n]*)+/; // own idea

    this.getBot = this.getBot.bind(this);
    this.getEot = this.getEot.bind(this);
    this.getBol = this.getBol.bind(this);
    this.getStrFromBot = this.getStrFromBot.bind(this);
    this.getStrToEot = this.getStrToEot.bind(this);
    this.getStrFromBol = this.getStrFromBol.bind(this);
    this.parseFromTableStringToJSON = this.parseFromTableStringToJSON.bind(this);
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
   * return strings from BOL(beginning of line) to current position
   */
  getStrFromBol(editor) {
    const curPos = editor.getCursor();
    return editor.getDoc().getRange(this.getBol(editor), curPos);
  }

  /**
   * returns JSON whose described by 'markdown-table' format
   *   ref. https://github.com/wooorm/markdown-table
   * @param {string} lines all of table
   */
  parseFromTableStringToJSON(editor, posBeg, posEnd) {
    let contents = [];
    let aligns = [];
    for (let pos = posBeg; pos.line <= posEnd.line; pos.line++) {
      const line = editor.getDoc().getLine(pos.line);

      if (this.tableAlignmentLineRE.test(line) && !this.tableAlignmentLineNegRE.test(line)) {
        // parse line which described alignment
        const alignRuleRE = [
          { align: 'c', regex: /^:-+:$/ },
          { align: 'l', regex: /^:-+$/  },
          { align: 'r', regex: /^-+:$/  },
        ];
        let lineText = "";
        lineText = line.replace(/^\||\|$/g, ''); // strip off pipe charactor which is placed head of line and last of line.
        lineText = lineText.replace(/\s*/g, '');
        aligns = lineText.split(/\|/).map(col => {
          const rule = alignRuleRE.find(rule => col.match(rule.regex));
          return (rule != undefined) ? rule.align : '';
        });
      } else {
        // parse line whether header or body
        let lineText = "";
        lineText = line.replace(/\s*\|\s*/g, '|');
        lineText = lineText.replace(/^\||\|$/g, ''); // strip off pipe charactor which is placed head of line and last of line.
        const row = lineText.split(/\|/);
        contents.push(row);
      }
    }
    return { table: contents, align: aligns };
  }
}

// singleton pattern
const instance = new MarkdownTableUtil();
Object.freeze(instance);
export default instance;
