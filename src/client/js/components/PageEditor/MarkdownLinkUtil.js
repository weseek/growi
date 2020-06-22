import MarkdownTable from '../../models/MarkdownTable';

/**
 * Utility for markdown link
 */
class MarkdownLinkUtil {

  constructor() {
    // TODO Regular expression for link /^([^\r\n|]*)\|(([^\r\n|]*\|)+)$/
    this.linePartOfLink = /^\[/;
    this.isInTable = this.isInTable.bind(this);
  }

  getBot(editor) {
    const curPos = editor.getCursor();
    if (!this.isInTable(editor)) {
      return { line: curPos.line, ch: curPos.ch };
    }

    const firstLine = editor.getDoc().firstLine();
    let line = curPos.line - 1;
    for (; line >= firstLine; line--) {
      const strLine = editor.getDoc().getLine(line);
      if (!this.linePartOfTableRE.test(strLine)) {
        break;
      }
    }
    const botLine = Math.max(firstLine, line + 1);
    return { line: botLine, ch: 0 };
  }

  /**
   * return the postion of the EOT(end of table)
   * (If the cursor is not in a table, return its position)
   */
  getEot(editor) {
    const curPos = editor.getCursor();
    if (!this.isInTable(editor)) {
      return { line: curPos.line, ch: curPos.ch };
    }

    const lastLine = editor.getDoc().lastLine();
    let line = curPos.line + 1;
    for (; line <= lastLine; line++) {
      const strLine = editor.getDoc().getLine(line);
      if (!this.linePartOfTableRE.test(strLine)) {
        break;
      }
    }
    const eotLine = Math.min(line - 1, lastLine);
    const lineLength = editor.getDoc().getLine(eotLine).length;
    return { line: eotLine, ch: lineLength };
  }

  getMarkdownLink(editor) {
    if (!this.isInTable(editor)) {
      return null;
    }

    const strFromBotToEot = editor.getDoc().getRange(this.getBot(editor), this.getEot(editor));
    return MarkdownTable.fromMarkdownString(strFromBotToEot);
  }

  getSelectedTextInEditor(editor) {
    return editor.getDoc().getSelection();
  }

  replaceFocusedMarkdownLinkWithEditor(editor, link) {
    editor.getDoc().replaceSelection(link);
  }

  isInTable(editor) {
    const curPos = editor.getCursor();
    return this.linePartOfLink.test(editor.getDoc().getLine(curPos.line));
  }

}

// singleton pattern
const instance = new MarkdownLinkUtil();
Object.freeze(instance);
export default instance;
