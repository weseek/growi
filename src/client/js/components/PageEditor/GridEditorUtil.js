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

    let line = curPos.line - 1;
    let isFound = false;
    for (; line >= firstLine; line--) {
      const strLine = editor.getDoc().getLine(line);
      if (this.linePartOfGridRE.test(strLine)) {
        isFound = true;
        break;
      }

      if (this.linePartOfGridRE.test(strLine)) {
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

    let line = curPos.line + 1;
    let isFound = false;
    for (; line <= lastLine; line++) {
      const strLine = editor.getDoc().getLine(line);
      if (this.linePartOfGridRE.test(strLine)) {
        isFound = true;
        break;
      }

      if (this.lineBeginPartOfDrawioRE.test(strLine)) {
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
    // return { line: lastLine, ch: curPos.ch };
  }

  replaceGridWithHtmlWithEditor(editor, grid) {
    const curPos = editor.getCursor();
    console.log('getBog');
    console.log(this.getBog(editor));
    console.log('getEog');
    console.log(this.getEog(editor));
    editor.getDoc().replaceRange(grid.toString(), this.getBog(editor), this.getEog(editor));
    editor.getDoc().setCursor(curPos.line + 1, 2);
  }

}

// singleton pattern
const instance = new GridEditorUtil();
Object.freeze(instance);
export default instance;
