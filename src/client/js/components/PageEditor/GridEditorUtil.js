/**
 * Utility for grid editor
 */
class GridEditorUtil {
  constructor() {
    // regex101 の url
    this.linePartOfTableRE = /(<div>.*)(</div>)$/;
    this.isInRow = this.isInRow.bind(this);
    this.replaceGridWithHtmlWithEditor = this.replaceGridWithHtmlWithEditor.bind(this);
  }
  /**
   * return boolean value whether the cursor position is in a row
   */
  isInRow(editor) {
    const curPos = editor.getCursor();
    // return this.linePartOfTableRE.test(editor.getDoc().getLine(curPos.line));
    return this.linePartOfRow.test(editor.getDoc().getLine(curPos.line));
  }

  replaceGridWithHtmlWithEditor(editor) {
    const curPos = editor.getCursor();
    editor.getDoc().replaceRange(
      // dummy data
      '<div class="container"><div class="row"><div class="col-sm-6 col-md-5 col-lg-12">dummy</div></div></div>',
      { line: editor.getDoc().getCursor().line, ch: editor.getDoc().getCursor().ch },
    );
    editor.getDoc().setCursor(curPos.line + 1, 2);
  }
}
// singleton pattern
const instance = new GridEditorUtil();
Object.freeze(instance);
export default instance;