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

  replaceFocusedMarkdownLinkWithEditor(editor, linkStr) {
    const curPos = editor.getCursor();
    const line = editor.getDoc().getLine(curPos.line);
    const { beginningOfLink, endOfLink } = getBeginningAndEndIndexOfLink(line, curPos.ch)
    editor.getDoc().replaceRange(linkStr, { line, ch: beginningOfLink }, { line, ch: endOfLink });
    editor.getDoc().setCursor(curPos.line + 1, 2);
    // 洗濯中テキスト内の改行対策
  }

}

// singleton pattern
const instance = new MarkdownLinkUtil();
Object.freeze(instance);
export default instance;
