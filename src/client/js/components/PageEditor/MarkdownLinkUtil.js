import Linker from '../../models/Linker';

/**
 * Utility for markdown link
 */
class MarkdownLinkUtil {

  constructor() {
    this.getMarkdownLink = this.getMarkdownLink.bind(this);
    this.isInLink = this.isInLink.bind(this);
    this.replaceFocusedMarkdownLinkWithEditor = this.replaceFocusedMarkdownLinkWithEditor.bind(this);
  }

  // return an instance of Linker from cursor position or selected text.
  getMarkdownLink(editor) {
    if (!this.isInLink(editor)) {
      return Linker.fromMarkdownString(editor.getDoc().getSelection());
    }
    const curPos = editor.getCursor();
    return Linker.fromLineWithIndex(editor.getDoc().getLine(curPos.line), curPos.ch);
  }

  isInLink(editor) {
    const curPos = editor.getCursor();
    const { beginningOfLink, endOfLink } = Linker.getBeginningAndEndIndexOfLink(editor.getDoc().getLine(curPos.line), curPos.ch);
    return beginningOfLink >= 0 && endOfLink >= 0;
  }

  replaceFocusedMarkdownLinkWithEditor(editor) {
    // GW-3023
  }

}

// singleton pattern
const instance = new MarkdownLinkUtil();
Object.freeze(instance);
export default instance;
