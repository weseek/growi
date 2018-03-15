import { BasicInterceptor } from 'crowi-pluginkit';
import * as codemirror from 'codemirror';
import markdownTable from 'markdown-table';

import mtu from '../../util/interceptor/MarkdownTableUtil';

/**
 * Utility for markdown table
 */
export default class MarkdownTableUtil extends BasicInterceptor {

  constructor() {
    super();

    // https://github.com/markdown-it/markdown-it/blob/d29f421927e93e88daf75f22089a3e732e195bd2/lib/rules_block/table.js#L83
    // https://regex101.com/r/7BN2fR/7
    this.tableAlignmentLineRE = /^[-:|][-:|\s]*$/;
    this.linePartOfTableRE = /^\|[^\r\n]*|[^\r\n]*\|$|([^\|\r\n]+\|[^\|\r\n]*)+/; // own idea
  }

  /**
   * @inheritdoc
   */
  isInterceptWhen(contextName) {
    return (
      contextName === 'preHandleEnter'
    );
  }

  /**
   * return boolean value whether processable parallel
   */
  isProcessableParallel() {
    return false;
  }

  /**
   * @inheritdoc
   */
  process(contextName, ...args) {
    const context = Object.assign(args[0]);   // clone
    const editor = context.editor;

    const curPos = editor.getCursor();
    const isEndOfLine = (curPos.ch == editor.getDoc().getLine(curPos.line).length);

    // get strings from BOL(beginning of line) to current position
    const strFromBol = mtu.getStrFromBol(editor);

    if (isEndOfLine && this.linePartOfTableRE.test(strFromBol)) {
      // get lines all of table from current position to beginning of table
      const strTableLines = mtu.getStrFromBot(editor);

      const table = mtu.parseFromTableStringToJSON(editor, mtu.getBot(editor), editor.getCursor());

      let newRow = [];
      table.table[0].forEach(() => { newRow.push('') });
      table.table.push(newRow);

      const curPos = editor.getCursor();
      const nextLineHead = { line: curPos.line + 1, ch: 0 };
      const tableBottom = mtu.parseFromTableStringToJSON(editor, nextLineHead, mtu.getEot(editor));
      if (tableBottom.table.length > 0) {
        table.table = table.table.concat(tableBottom.table);
      }

      // replace the lines to strTableLinesFormated
      const strTableLinesFormated = markdownTable(table.table, { align: table.align });
      editor.getDoc().replaceRange(strTableLinesFormated, mtu.getBot(editor), mtu.getEot(editor));
      editor.getDoc().setCursor(curPos.line + 1, 2);

      // report to manager that handling was done
      context.handlers.push(this.className);
    }

    // resolve
    return Promise.resolve(context);
  }
}
