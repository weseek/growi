/**
 * Utility for markdown link
 */
class MarkdownLinkUtil {

  constructor() {
    // https://regex101.com/r/1UuWBJ/8
    this.linePartOfLink = /(\[+(.*)+\]){1}(\(+(.*)+\)){1}/;
    this.isInLink = this.isInLink.bind(this);
  }

  getMarkdownLink(editor) {
    const isInLink = true;
    if (isInLink) {
      return; // with param
    }
    return editor.getDoc().getSelection();
  }

  getSelectedTextInEditor(editor) {
    return editor.getDoc().getSelection();
  }

  replaceFocusedMarkdownLinkWithEditor(editor, link) {
    editor.getDoc().replaceSelection(link);
  }

  isInLink(editor) {
    const curPos = editor.getCursor();
    return this.linePartOfLink.test(editor.getDoc().getLine(curPos.line));
  }

}

// singleton pattern
const instance = new MarkdownLinkUtil();
Object.freeze(instance);
export default instance;
