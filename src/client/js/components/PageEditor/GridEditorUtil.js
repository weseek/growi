/**
 * Utility for grid editor
 */
class GridEditorUtil {

  constructor() {
    // https://regex101.com/r/7BN2fR/11
    this.lineBeginPartOfGridRE = /^:::(\s.*)editable-row$/;
    this.lineEndPartOfGridRE = /^:::$/;
    this.replaceGridWithHtmlWithEditor = this.replaceGridWithHtmlWithEditor.bind(this);
  }

  /**
   * return the postion of the BOD(beginning of grid)
   */
  getBog(editor) {
    const curPos = editor.getCursor();
    const firstLine = editor.getDoc().firstLine();

    if (this.lineBeginPartOfGridRE.test(editor.getDoc().getLine(curPos.line))) {
      return { line: curPos.line, ch: 0 };
    }

    let line = curPos.line - 1;
    let isFound = false;
    for (; line >= firstLine; line--) {
      const strLine = editor.getDoc().getLine(line);
      if (this.lineBeginPartOfGridRE.test(strLine)) {
        isFound = true;
        break;
      }

      if (this.lineEndPartOfGridRE.test(strLine)) {
        isFound = false;
        break;
      }
    }

    if (!isFound) {
      return { line: curPos.line, ch: curPos.ch };
    }

    const bodLine = Math.max(firstLine, line);
    return { line: bodLine, ch: 0 };
  }

  /**
   * return the postion of the EOD(end of grid)
   */
  getEog(editor) {
    const curPos = editor.getCursor();
    const lastLine = editor.getDoc().lastLine();

    if (this.lineEndPartOfGridRE.test(editor.getDoc().getLine(curPos.line))) {
      return { line: curPos.line, ch: editor.getDoc().getLine(curPos.line).length };
    }

    let line = curPos.line + 1;
    let isFound = false;
    for (; line <= lastLine; line++) {
      const strLine = editor.getDoc().getLine(line);
      if (this.lineEndPartOfGridRE.test(strLine)) {
        isFound = true;
        break;
      }

      if (this.lineBeginPartOfGridRE.test(strLine)) {
        isFound = false;
        break;
      }
    }

    if (!isFound) {
      return { line: curPos.line, ch: curPos.ch };
    }

    const eodLine = Math.min(line, lastLine);
    const lineLength = editor.getDoc().getLine(eodLine).length;
    return { line: eodLine, ch: lineLength };
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
