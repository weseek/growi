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

  // replace link(link is an instance of Linker)
  replaceFocusedMarkdownLinkWithEditor(editor, link) {
    const curPos = editor.getCursor();
    const linkStr = link.generateMarkdownText();
    if (!this.isInLink(editor)) {
      editor.getDoc().replaceSelection(linkStr);
    }
    else {
      const line = editor.getDoc().getLine(curPos.line);
      const { beginningOfLink, endOfLink } = Linker.getBeginningAndEndIndexOfLink(line, curPos.ch);
      editor.getDoc().replaceRange(linkStr, { line: curPos.line, ch: beginningOfLink }, { line: curPos.line, ch: endOfLink });
    }
  }

}

// singleton pattern
const instance = new MarkdownLinkUtil();
Object.freeze(instance);
export default instance;
