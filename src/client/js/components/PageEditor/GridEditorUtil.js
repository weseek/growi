/**
 * Utility for grid editor
 */
class GridEditorUtil {

  constructor() {
    this.replaceGridWithHtmlWithEditor = this.replaceGridWithHtmlWithEditor.bind(this);
  }

  replaceGridWithHtmlWithEditor(editor) {
    const curPos = editor.getCursor();
    editor.getDoc().replaceRange(
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
