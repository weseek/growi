/**
 * Utility for markdown drawio
 */
class MarkdownDrawioUtil {

  constructor() {
    this.lineBeginPartOfDrawioRE = /^:::(\s.*)drawio$/;
    this.lineEndPartOfDrawioRE = /^:::$/;
  }

  /**
   * return the postion of the BOD(beginning of drawio)
   * (If the cursor is not in a drawio block, return its position)
   */
  getBod(editor) {
    const curPos = editor.getCursor();
    const firstLine = editor.getDoc().firstLine();

    if (this.lineBeginPartOfDrawioRE.test(editor.getDoc().getLine(curPos.line))) {
      return { line: curPos.line, ch: 0 };
    }

    let line = curPos.line - 1;
    let isFound = false;
    for (; line >= firstLine; line--) {
      const strLine = editor.getDoc().getLine(line);
      if (this.lineBeginPartOfDrawioRE.test(strLine)) {
        isFound = true;
        break;
      }

      if (this.lineEndPartOfDrawioRE.test(strLine)) {
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
   * return the postion of the EOD(end of drawio)
   * (If the cursor is not in a drawio block, return its position)
   */
  getEod(editor) {
    const curPos = editor.getCursor();
    const lastLine = editor.getDoc().lastLine();

    if (this.lineEndPartOfDrawioRE.test(editor.getDoc().getLine(curPos.line))) {
      return { line: curPos.line, ch: editor.getDoc().getLine(curPos.line).length };
    }

    let line = curPos.line + 1;
    let isFound = false;
    for (; line <= lastLine; line++) {
      const strLine = editor.getDoc().getLine(line);
      if (this.lineEndPartOfDrawioRE.test(strLine)) {
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
  }

  /**
   * return boolean value whether the cursor position is in a drawio
   */
  isInDrawioBlock(editor) {
    return (this.getBod(editor) !== this.getEod(editor));
  }

  /**
   * return drawioData instance where the cursor is
   * (If the cursor is not in a drawio block, return current line)
   */
  getMarkdownDrawioMxfile(editor) {
    const curPos = editor.getCursor();

    if (this.isInDrawioBlock(editor)) {
      const bod = this.getBod(editor);
      const eod = this.getEod(editor);

      // skip block begin sesion("::: drawio")
      bod.line++;
      // skip block end sesion(":::")
      eod.line--;
      eod.ch = editor.getDoc().getLine(eod.line).length;

      return editor.getDoc().getRange(bod, eod);
    }

    return editor.getDoc().getLine(curPos.line);
  }

  replaceFocusedDrawioWithEditor(editor, drawioData) {
    const curPos = editor.getCursor();
    const drawioBlock = ['::: drawio', drawioData.toString(), ':::'].join('\n');
    let beginPos;
    let endPos;

    if (this.isInDrawioBlock(editor)) {
      beginPos = this.getBod(editor);
      endPos = this.getEod(editor);
    }
    else {
      beginPos = { line: curPos.line, ch: curPos.ch };
      endPos = { line: curPos.line, ch: curPos.ch };
    }

    editor.getDoc().replaceRange(drawioBlock, beginPos, endPos);
  }

  /**
   * return markdown where the drawioData specified by line number params is replaced to the drawioData specified by drawioData param
   * @param {string} drawioData
   * @param {string} markdown
   * @param beginLineNumber
   * @param endLineNumber
   */
  replaceDrawioInMarkdown(drawioData, markdown, beginLineNumber, endLineNumber) {
    const splitMarkdown = markdown.split(/\r\n|\r|\n/);
    const markdownBeforeDrawio = splitMarkdown.slice(0, beginLineNumber);
    const markdownAfterDrawio = splitMarkdown.slice(endLineNumber);

    let newMarkdown = '';
    if (markdownBeforeDrawio.length > 0) {
      newMarkdown += `${markdownBeforeDrawio.join('\n')}\n`;
      newMarkdown += '::: drawio\n';
    }
    newMarkdown += drawioData;
    if (markdownAfterDrawio.length > 0) {
      newMarkdown += '\n:::';
      newMarkdown += `\n${markdownAfterDrawio.join('\n')}`;
    }

    return newMarkdown;
  }

}

// singleton pattern
const instance = new MarkdownDrawioUtil();
Object.freeze(instance);
export default instance;
