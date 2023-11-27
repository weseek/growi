import { BasicInterceptor } from '@growi/core/dist/utils';

import MarkdownTable from '~/client/models/MarkdownTable';

import {
  getStrFromBot, addRowToMarkdownTable, getStrToEot, isEndOfLine, mergeMarkdownTable,
} from './MarkdownTableUtilForView';

/**
 * Interceptor for markdown table
 */
export default class MarkdownTableInterceptor extends BasicInterceptor {

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

  addRow(cm) {
    // get lines all of table from current position to beginning of table
    const strFromBot = getStrFromBot(cm);
    let table = MarkdownTable.fromMarkdownString(strFromBot);

    addRowToMarkdownTable(table);

    const strToEot = getStrToEot(cm);
    const tableBottom = MarkdownTable.fromMarkdownString(strToEot);
    if (tableBottom.table.length > 0) {
      table = mergeMarkdownTable([table, tableBottom]);
    }

    replaceMarkdownTableWithReformed(cm, table);
  }

  reformTable(cm) {
    const tableStr = getStrFromBot(cm) + getStrToEot(cm);
    const table = MarkdownTable.fromMarkdownString(tableStr);
    replaceMarkdownTableWithReformed(cm, table);
  }

  removeRow(editor) {
    editor.replaceLine('\n');
  }

  /**
   * @inheritdoc
   */
  async process(contextName, ...args) {
    const context = Object.assign(args[0]); // clone
    const editor = context.editor; // AbstractEditor instance
    // "autoFormatMarkdownTable" may be undefined, so it is compared to true and converted to bool.
    const noIntercept = (context.autoFormatMarkdownTable === false);
    // https://regex101.com/r/1UuWBJ/3
    const emptyLineOfTableRE = /^([^\r\n|]*)\|((\s*\|)+)$/;

    // do nothing if editor is not a CodeMirrorEditor or no intercept
    if (editor == null || editor.getCodeMirror() == null || noIntercept) {
      return context;
    }

    const cm = editor.getCodeMirror();

    const isInTable = isInTable(cm);
    const isLastRow = getStrToEot(cm) === editor.getStrToEol();

    if (isInTable) {
      // at EOL in the table
      if (isEndOfLine(cm)) {
        this.addRow(cm);
      }
      // last empty row
      else if (isLastRow && emptyLineOfTableRE.test(editor.getStrFromBol() + editor.getStrToEol())) {
        this.removeRow(editor);
      }
      else {
        this.reformTable(cm);
      }

      // report to manager that handling was done
      context.handlers.push(this.className);
      return context;
    }

  }

}
