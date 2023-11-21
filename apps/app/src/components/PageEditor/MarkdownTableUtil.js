import MarkdownTable from '~/client/models/MarkdownTable';

/**
 * Utility for markdown table
 */
class MarkdownTableUtil {

  constructor() {
    // https://github.com/markdown-it/markdown-it/blob/d29f421927e93e88daf75f22089a3e732e195bd2/lib/rules_block/table.js#L83
    this.tableAlignmentLineRE = /^[-:|][-:|\s]*$/;
    this.tableAlignmentLineNegRE = /^[^-:]*$/; // it is need to check to ignore empty row which is matched above RE
    // https://regex101.com/r/7BN2fR/10
    this.linePartOfTableRE = /^([^\r\n|]*)\|(([^\r\n|]*\|)+)$/;
    // https://regex101.com/r/1UuWBJ/3
    this.emptyLineOfTableRE = /^([^\r\n|]*)\|((\s*\|)+)$/;

    this.getBot = this.getBot.bind(this);
    this.getEot = this.getEot.bind(this);
    this.getStrFromBot = this.getStrFromBot.bind(this);
    this.getStrToEot = this.getStrToEot.bind(this);
    this.isInTable = this.isInTable.bind(this);
    this.replaceFocusedMarkdownTableWithEditor = this.replaceFocusedMarkdownTableWithEditor.bind(this);
    this.replaceMarkdownTableWithReformed = this.replaceFocusedMarkdownTableWithEditor; // alias
  }

  /**
   * return the postion of the BOT(beginning of table)
   * (If the cursor is not in a table, return its position)
   */
  getBot(editor) {
    const curPos = editor.state.selection.main.head;
    if (!this.isInTable(editor)) {
      return curPos;
    }

    const doc = editor.state.doc;
    const firstLine = doc.line(1);
    let line = doc.lineAt(curPos).number - 1;
    for (; line >= firstLine.number; line--) {
      const strLine = doc.line(line);
      if (!this.linePartOfTableRE.test(strLine.text)) {
        break;
      }
    }
    const botLine = doc.line(line + 1);
    return botLine.from;
  }

  /**
   * return the postion of the EOT(end of table)
   * (If the cursor is not in a table, return its position)
   */
  getEot(editor) {
    const curPos = editor.state.selection.main.head;
    if (!this.isInTable(editor)) {
      return curPos;
    }

    const doc = editor.state.doc;
    const lastLine = doc.line(doc.lines);
    let line = doc.lineAt(curPos).number + 1;
    for (; line <= lastLine.number; line++) {
      const strLine = doc.line(line);
      if (!this.linePartOfTableRE.test(strLine.text)) {
        break;
      }
    }
    const eotLine = doc.line(line - 1);
    return eotLine.to;
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

  getMarkdownTableFromLine(markdown, bol, eol) {
    const tableLines = markdown.split(/\r\n|\r|\n/).slice(bol - 1, eol).join('\n');
    return MarkdownTable.fromMarkdownString(tableLines);
  }

  /**
   * return boolean value whether the cursor position is end of line
   */
  isEndOfLine(editor) {
    const curPos = editor.getCursor();
    return (curPos.ch === editor.getDoc().getLine(curPos.line).length);
  }

  /**
   * return boolean value whether the cursor position is in a table
   */
  isInTable(editor) {
    const curPos = editor.state.selection.main.head;
    const lineText = editor.state.doc.lineAt(curPos).text;
    return this.linePartOfTableRE.test(lineText);
  }

  /**
   * add a row at the end
   * (This function overwrite directory markdown table specified as argument.)
   * @param {MarkdownTable} markdown table
   */
  addRowToMarkdownTable(mdtable) {
    const numCol = mdtable.table.length > 0 ? mdtable.table[0].length : 1;
    const newRow = [];
    (new Array(numCol)).forEach(() => { return newRow.push('') }); // create cols
    mdtable.table.push(newRow);
  }

  /**
   * return markdown table that is merged all of markdown table in array
   * (The merged markdown table options are used for the first markdown table.)
   * @param {Array} array of markdown table
   */
  mergeMarkdownTable(mdtableList) {
    if (mdtableList == null || !(mdtableList instanceof Array)) {
      return undefined;
    }

    let newTable = [];
    const options = mdtableList[0].options; // use option of first markdown-table
    mdtableList.forEach((mdtable) => {
      newTable = newTable.concat(mdtable.table);
    });
    return (new MarkdownTable(newTable, options));
  }

  /**
   * replace focused markdown table with editor
   * (A replaced table is reformed by markdown-table.)
   * @param {MarkdownTable} table
   */
  replaceFocusedMarkdownTableWithEditor(editor, table) {
    const botPos = this.getBot(editor);
    const eotPos = this.getEot(editor);
    const curPos = editor.state.selection.main.head;

    editor.dispatch({
      changes: {
        from: botPos,
        to: eotPos,
        insert: table.toString(),
      },
    });
    editor.dispatch({
      selection: { anchor: editor.state.doc.lineAt(curPos).to },
    });
  }

  /**
   * return markdown where the markdown table specified by line number params is replaced to the markdown table specified by table param
   * @param {string} markdown
   * @param {MarkdownTable} table
   * @param beginLineNumber
   * @param endLineNumber
   */
  replaceMarkdownTableInMarkdown(table, markdown, beginLineNumber, endLineNumber) {
    const splitMarkdown = markdown.split(/\r\n|\r|\n/);
    const markdownBeforeTable = splitMarkdown.slice(0, beginLineNumber - 1);
    const markdownAfterTable = splitMarkdown.slice(endLineNumber);

    let newMarkdown = '';
    if (markdownBeforeTable.length > 0) {
      newMarkdown += `${markdownBeforeTable.join('\n')}\n`;
    }
    newMarkdown += table;
    if (markdownAfterTable.length > 0) {
      newMarkdown += `\n${markdownAfterTable.join('\n')}`;
    }

    return newMarkdown;
  }

}

// singleton pattern
const instance = new MarkdownTableUtil();
Object.freeze(instance);
export default instance;
