import { BasicInterceptor } from 'growi-pluginkit';

import mtu from './MarkdownTableUtil';
import MarkdownTable from '../../models/MarkdownTable';

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
    const editor = context.editor;            // AbstractEditor instance

    // do nothing if editor is not a CodeMirrorEditor
    if (editor == null || editor.getCodeMirror() == null) {
      return Promise.resolve(context);
    }

    const cm = editor.getCodeMirror();

    // get strings from BOL(beginning of line) to current position
    const strFromBol = editor.getStrFromBol();

    if (mtu.isEndOfLine(cm) && mtu.linePartOfTableRE.test(strFromBol)) {
      // get lines all of table from current position to beginning of table
      const strFromBot = mtu.getStrFromBot(cm);
      let table = MarkdownTable.fromMarkdownString(strFromBot);

      mtu.addRowToMarkdownTable(table);

      const strToEot = mtu.getStrToEot(cm);
      const tableBottom = MarkdownTable.fromMarkdownString(strToEot);
      if (tableBottom.table.length > 0) {
        table = mtu.mergeMarkdownTable([table, tableBottom]);
      }

      mtu.replaceMarkdownTableWithReformed(cm, table);

      // report to manager that handling was done
      context.handlers.push(this.className);
    }

    // resolve
    return Promise.resolve(context);
  }
}
