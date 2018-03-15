import { BasicInterceptor } from 'crowi-pluginkit';

import mtu from './MarkdownTableUtil';

/**
 * Interceptor for markdown table
 */
export default class MarkdownTableInterceptor extends BasicInterceptor {

  constructor() {
    super();
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

    // get strings from BOL(beginning of line) to current position
    const strFromBol = mtu.getStrFromBol(editor);

    if (mtu.isEndOfLine(editor) && mtu.linePartOfTableRE.test(strFromBol)) {
      // get lines all of table from current position to beginning of table
      const strTableLines = mtu.getStrFromBot(editor);

      let table = mtu.parseFromTableStringToMarkdownTable(editor, mtu.getBot(editor), editor.getCursor());

      mtu.addRowToMarkdownTable(table);

      const curPos = editor.getCursor();
      const nextLineHead = { line: curPos.line + 1, ch: 0 };
      const tableBottom = mtu.parseFromTableStringToMarkdownTable(editor, nextLineHead, mtu.getEot(editor));
      if (tableBottom.table.length > 0) {
        table = mtu.mergeMarkdownTable([table, tableBottom]);
      }

      // replace the lines to strTableLinesFormated
      const strTableLinesFormated = table.toString();
      editor.getDoc().replaceRange(strTableLinesFormated, mtu.getBot(editor), mtu.getEot(editor));
      editor.getDoc().setCursor(curPos.line + 1, 2);

      // report to manager that handling was done
      context.handlers.push(this.className);
    }

    // resolve
    return Promise.resolve(context);
  }
}
