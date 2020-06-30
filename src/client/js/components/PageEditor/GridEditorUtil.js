/**
 * Utility for grid editor
 */
class GridEditorUtil {

  constructor() {
    // TODO url
    this.lineBeginPartOfGridRE = /(<[^/].*>)/;
    this.lineEndPartOfGridRE = /(<\/.*>)/;
    this.linePartOfGridRE = /(<.*>)[\s\S]*<\/.*>$/;
    this.replaceGridWithHtmlWithEditor = this.replaceGridWithHtmlWithEditor.bind(this);
  }

  /**
   * return the postion of the BOD(beginning of grid)
   */
  getBog(editor) {
    const curPos = editor.getCursor();
    const firstLine = editor.getDoc().firstLine();
    return { line: firstLine, ch: curPos.ch };
  }

  /**
   * return the postion of the EOD(end of grid)
   */
  getEog(editor) {
    const curPos = editor.getCursor();
    const lastLine = editor.getDoc().lastLine();
    return { line: lastLine, ch: curPos.ch };
  }

  replaceGridWithHtmlWithEditor(editor, grid) {
    const curPos = editor.getCursor();
    editor.getDoc().replaceRange(grid.toString(), this.getBog(editor), this.getEog(editor));
    editor.getDoc().setCursor(curPos.line + 1, 2);
  }

}

// singleton pattern
const instance = new GridEditorUtil();
Object.freeze(instance);
export default instance;
