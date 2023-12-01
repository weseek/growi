/**
 * Utility for markdown drawio
 */
class MarkdownDrawioUtil {

  constructor() {
    this.lineBeginPartOfDrawioRE = /^```(\s.*)drawio$/;
    this.lineEndPartOfDrawioRE = /^```$/;
  }

  /**
   * return the postion of the BOD(beginning of drawio)
   * (If the BOD is not found after the cursor or the EOD is found before the BOD, return null)
   */
  getBod(editor) {
    const curPos = editor.state.selection.main.head;
    const firstLine = 1;

    if (this.lineBeginPartOfDrawioRE.test(editor.getDoc().getLine(curPos.line))) {
      return { line: curPos.line, ch: 0 };
    }

    const doc = editor.state.doc;
    let line = doc.lineAt(curPos(editor)).number - 1;
    let isFound = false;
    for (; line >= firstLine; line--) {
      const strLine = doc.line(line).text;
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
      return null;
    }

    const botLine = Math.max(firstLine, line);
    return doc.line(botLine).from;
  }

  /**
   * return the postion of the EOD(end of drawio)
   * (If the EOD is not found after the cursor or the BOD is found before the EOD, return null)
   */
  getEod(editor) {
    const curPos = editor.state.selection.main.head;
    const doc = editor.state.doc;
    const lastLine = doc.lines;

    if (this.lineEndPartOfDrawioRE.test(editor.getDoc().getLine(curPos.line))) {
      return { line: curPos.line, ch: editor.getDoc().getLine(curPos.line).length };
    }

    let line = doc.lineAt(curPos(editor)).number + 1;
    let isFound = false;
    for (; line <= lastLine; line++) {
      const strLine = doc.line(line).text;
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
      return null;
    }

    const eodLine = Math.min(line, lastLine);
    return doc.line(eodLine).to;
  }

  /**
   * return boolean value whether the cursor position is in a drawio
   */
  isInDrawioBlock(editor) {
    const bod = this.getBod(editor);
    const eod = this.getEod(editor);
    if (bod === null || eod === null) {
      return false;
    }
    return JSON.stringify(bod) !== JSON.stringify(eod);
  }

  /**
   * return drawioData instance where the cursor is
   * (If the cursor is not in a drawio block, return null)
   */
  getMarkdownDrawioMxfile(editor) {
    const doc = editor.state.doc;
    if (this.isInDrawioBlock(editor)) {
      const bod = this.getBod(editor);
      const eod = this.getEod(editor);

      // skip block begin sesion("``` drawio")
      doc.lineAt(bod).number++;
      // skip block end sesion("```")
      doc.lineAt(eod).number--;

      return editor.state.sliceDoc(bod, eod);
    }
    return null;
  }

  replaceFocusedDrawioWithEditor(editor, drawioData) {
    const curPos = editor.state.selection.main.head;
    const doc = editor.state.doc;
    const drawioBlock = ['``` drawio', drawioData.toString(), '```'].join('\n');
    let beginPos;
    let endPos;

    if (this.isInDrawioBlock(editor)) {
      beginPos = this.getBod(editor);
      endPos = this.getEod(editor);
    }
    else {
      beginPos = doc.lineAt(curPos);
      endPos = doc.lineAt(curPos);
    }

    editor.dispatch({
      changes: {
        from: beginPos,
        to: endPos,
        insert: drawioBlock,
      },
    });
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
    const markdownBeforeDrawio = splitMarkdown.slice(0, beginLineNumber - 1);
    const markdownAfterDrawio = splitMarkdown.slice(endLineNumber);

    let newMarkdown = '';
    if (markdownBeforeDrawio.length > 0) {
      newMarkdown += `${markdownBeforeDrawio.join('\n')}\n`;
    }
    newMarkdown += '``` drawio\n';
    newMarkdown += drawioData;
    newMarkdown += '\n```';
    if (markdownAfterDrawio.length > 0) {
      newMarkdown += `\n${markdownAfterDrawio.join('\n')}`;
    }

    return newMarkdown;
  }

  /**
   * return an array of the starting line numbers of the drawio sections found in markdown
   */
  findAllDrawioSection(editor) {
    const lineNumbers = [];
    const doc = editor.state.doc;
    // refs: https://github.com/codemirror/CodeMirror/blob/5.64.0/addon/fold/foldcode.js#L106-L111
    for (let i = 1, e = doc.lines; i <= e; i++) {
      const line = doc.line(i + 1).text;
      const match = this.lineBeginPartOfDrawioRE.exec(line);
      if (match) {
        lineNumbers.push(i);
      }
    }
    return lineNumbers;
  }

}

// singleton pattern
const instance = new MarkdownDrawioUtil();
Object.freeze(instance);
export default instance;
