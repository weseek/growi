import markdownTable from 'markdown-table';
import stringWidth from 'string-width';
import csvToMarkdown from 'csv-to-markdown-table';

// https://github.com/markdown-it/markdown-it/blob/d29f421927e93e88daf75f22089a3e732e195bd2/lib/rules_block/table.js#L83
// https://regex101.com/r/7BN2fR/7
const tableAlignmentLineRE = /^[-:|][-:|\s]*$/;
const tableAlignmentLineNegRE = /^[^-:]*$/;  // it is need to check to ignore empty row which is matched above RE
const linePartOfTableRE = /^\|[^\r\n]*|[^\r\n]*\|$|([^|\r\n]+\|[^|\r\n]*)+/; // own idea

/**
 * markdown table class for markdown-table module
 *   ref. https://github.com/wooorm/markdown-table
 */
export default class MarkdownTable {

  constructor(table, options) {
    this.table = table || [];
    this.options = options || {};

    this.toString = this.toString.bind(this);
  }

  toString() {
    return markdownTable(this.table, this.options);
  }

  /**
   * returns cloned Markdowntable instance
   * (This method clones only the table field.)
   */
  clone() {
    let newTable = [];
    for (let i = 0; i < this.table.length; i++) {
      newTable.push([].concat(this.table[i]));
    }
    return new MarkdownTable(newTable, this.options);
  }

  static fromTableTag(str) {
    return null;
  }

  /**
   * return a MarkdownTable instance made from a string of delimiter-separated values
   */
  static fromDSV(str, delimiter) {
    return MarkdownTable.fromMarkdownString(csvToMarkdown(str, delimiter, true));
  }

  /**
   * return a MarkdownTable instance
   *   ref. https://github.com/wooorm/markdown-table
   * @param {string} str markdown string
   */
  static fromMarkdownString(str) {
    const arrMDTableLines = str.split(/(\r\n|\r|\n)/);
    let contents = [];
    let aligns = [];
    for (let n = 0; n < arrMDTableLines.length; n++) {
      const line = arrMDTableLines[n];

      if (tableAlignmentLineRE.test(line) && !tableAlignmentLineNegRE.test(line)) {
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
      else if (linePartOfTableRE.test(line)) {
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
}
