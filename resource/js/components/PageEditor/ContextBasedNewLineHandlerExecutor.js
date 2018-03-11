import * as codemirror from 'codemirror';

import markdownListHelper from './MarkdownListHelper';
import markdownTableHelper from './MarkdownTableHelper';

/**
 * Selector for one new line handler
 */
class ContextBasedNewLineHandlerExecutor {

  /**
   * select one handler from helper
   * @param {any} editor An editor instance of CodeMirror
   */
  execNewLineHandler(editor) {
    let newLineHelpers = [markdownTableHelper, markdownListHelper];
    const helper = newLineHelpers.find( h => h.isMatchedContext(editor));
    if (helper) {
      helper.handleNewLine(editor);
    } else {
      codemirror.commands.newlineAndIndent(editor);
    }
  }
}

// singleton pattern
const instance = new ContextBasedNewLineHandlerExecutor();
Object.freeze(instance);
export default instance;
