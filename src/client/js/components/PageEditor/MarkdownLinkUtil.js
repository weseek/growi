/**
 * Utility for markdown link
 */
class MarkdownLinkUtil {

  constructor() {
    // TODO Regular expression for link
    this.linePartOfLink = /^([^\r\n|]*)\|(([^\r\n|]*\|)+)$/;
    this.isInTable = this.isInTable.bind(this);
  }

  getSelectedTextInEditor(editor) {
    return editor.getDoc().getSelection();
  }

  replaceFocusedMarkdownLinkWithEditor(editor, link) {
    editor.getDoc().replaceSelection(link);
  }

  isInTable(editor) {
    const curPos = editor.getCursor();
    return this.linePartOfTableRE.test(editor.getDoc().getLine(curPos.line));
  }

}

// singleton pattern
const instance = new MarkdownLinkUtil();
Object.freeze(instance);
export default instance;
