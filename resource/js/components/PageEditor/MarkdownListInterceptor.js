import { BasicInterceptor } from 'crowi-pluginkit';
import * as codemirror from 'codemirror';

import mlu from './MarkdownListUtil';

export default class MarkdownListInterceptor extends BasicInterceptor {

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

    // get strings from current position to EOL(end of line) before break the line
    const strToEol = mlu.getStrToEol(editor);
    if (mlu.indentAndMarkRE.test(strToEol)) {
      codemirror.commands.newlineAndIndent(editor);

      // replace the line with strToEol (abort auto indent)
      editor.getDoc().replaceRange(strToEol, mlu.getBol(editor), mlu.getEol(editor));

      // report to manager that handling was done
      context.handlers.push(this.className);
    }

    // resolve
    return Promise.resolve(context);
  }
}
