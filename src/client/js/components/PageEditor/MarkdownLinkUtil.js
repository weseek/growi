/**
 * Utility for markdown link
 */
class MarkdownLinkUtil {

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

}

// singleton pattern
const instance = new MarkdownLinkUtil();
Object.freeze(instance);
export default instance;
