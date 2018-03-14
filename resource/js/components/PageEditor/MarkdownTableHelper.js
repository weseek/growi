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
    console.log(performance.now() + ': ReformMarkdownTableInterceptor.process is started');

    const orgContext = args[0];
    const editor = orgContext.editor;

    // get strings from BOL(beginning of line) to current position
    const strFromBol = mtu.getStrFromBol(editor);

    if (this.linePartOfTableRE.test(strFromBol)) {
      const context = Object.assign(args[0]);   // clone
      const editor = context.editor;

      console.log('MarkdownTableHelper.process');

      // get lines all of table from current position to beginning of table
      const strTableLines = mtu.getStrFromBot(editor);
      console.log('strTableLines: ' + strTableLines);

      const table = mtu.parseFromTableStringToJSON(editor, mtu.getBot(editor), editor.getCursor());
      console.log('table: ' + JSON.stringify(table));
      const strTableLinesFormated = table;
      console.log('strTableLinesFormated: ' + strTableLinesFormated);

      // replace the lines to strFormatedTableLines
      editor.getDoc().replaceRange(strTableLinesFormated, mtu.getBot(editor), editor.getCursor());
      codemirror.commands.newlineAndIndent(editor);

      // report to manager that handling was done
      context.handlers.push(this.className);
    }

    console.log(performance.now() + ': ReformMarkdownTableInterceptor.process is finished');

    // resolve
    // return Promise.resolve(context);
    return Promise.resolve(orgContext);
  }
}
