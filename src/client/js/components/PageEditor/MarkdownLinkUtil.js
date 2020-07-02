import Linker from '../models/Linker';

/**
 * Utility for markdown link
 */
class MarkdownLinkUtil {

  constructor() {
    this.getMarkdownLink = this.getMarkdownLink.bind(this);
    this.isInLink = this.isInLink.bind(this);
    this.replaceFocusedMarkdownLinkWithEditor = this.replaceFocusedMarkdownLinkWithEditor.bind(this);
  }

  // return text as markdown link if the cursor on markdown link else return text as default label of new link.
  getMarkdownLink(editor) {
    if (!this.isInLink(editor)) {
      return Linker.fromMarkdownString(editor.getDoc().getSelection());
    }
    const curPos = editor.getCursor();
    return Linker.fromLineContainsLink(editor.getDoc().getLine(curPos.line), curPos.ch)
  }

  isInLink(editor) {
    const curPos = editor.getCursor();
    const { beginningOfLink, endOfLink } = Linker.getBeginningAndEndIndexOfLink(editor.getDoc().getLine(curPos.line), curPos.ch);
    return beginningOfLink >= 0 && endOfLink >= 0 && beginningOfLink <= curPos.ch && curPos.ch <= endOfLink;
  }

  replaceFocusedMarkdownLinkWithEditor(editor) {
    // GW-3023
  }

}

// singleton pattern
const instance = new MarkdownLinkUtil();
Object.freeze(instance);
export default instance;
