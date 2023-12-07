/**
 * Utility for markdown drawio
 */
class MarkdownDrawioUtil {

  constructor() {
    this.lineBeginPartOfDrawioRE = /^```(\s.*)drawio$/;
    this.lineEndPartOfDrawioRE = /^```$/;
    this.curPos = this.curPos.bind(this);
    this.doc = this.doc.bind(this);
  }

  // get cursor position from editor
  curPos(editor) {
    return editor.state.selection.main.head;
  }

  // get doc from editor
  doc(editor) {
    return editor.state.doc;
  }

  // get first line number
  firstLineNum() {
    return 1;
  }

  // get last line number
  lastLineNum(editor) {
    return this.doc(editor).lines;
  }

  // get cursor line
  cursorLine(editor) {
    return this.doc(editor).lineAt(this.curPos(editor));
  }

  // get line
  getLine(editor, lineNum) {
    return this.doc(editor).line(lineNum);
  }

  /**
   * return the postion of the BOD(beginning of drawio)
   * (If the BOD is not found after the cursor or the EOD is found before the BOD, return null)
   */
  getBod(editor) {
    if (this.lineBeginPartOfDrawioRE.test(this.cursorLine(editor)).text) {
      // get the beginning of the line where the cursor is located
      return this.cursorLine(editor).from;
    }

    let line = this.cursorLine(editor).number - 1;
    let isFound = false;
    for (; line >= this.firstLineNum(); line--) {
      const strLine = this.getLine(editor, line).text;
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

    const botLine = Math.max(this.firstLineNum(), line);
    return this.getLine(editor, botLine).from;
  }

  /**
   * return the postion of the EOD(end of drawio)
   * (If the EOD is not found after the cursor or the BOD is found before the EOD, return null)
   */
  getEod(editor) {
    if (this.lineEndPartOfDrawioRE.test(this.cursorLine(editor)).text) {
      // get the end of the line where the cursor is located
      return this.cursorLine(editor).to;
    }

    let line = this.cursorLine(editor).number + 1;
    let isFound = false;
    for (; line <= this.lastLineNum(editor); line++) {
      const strLine = this.getLine(editor, line).text;
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

    const eodLine = Math.min(line, this.lastLineNum(editor));
    return this.getLine(editor, eodLine).to;
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
    if (this.isInDrawioBlock(editor)) {
      const bod = this.getBod(editor);
      const eod = this.getEod(editor);

      // skip block begin sesion("``` drawio")
      const bodLineNum = this.doc(editor).lineAt(bod).number + 1;
      const bodLine = this.getLine(editor, bodLineNum).from;
      // skip block end sesion("```")
      const eodLineNum = this.doc(editor).lineAt(eod).number - 1;
      const eodLine = this.getLine(editor, eodLineNum).to;

      return editor.state.sliceDoc(bodLine, eodLine);
    }
    return null;
  }

  replaceFocusedDrawioWithEditor(editor, drawioData) {
    const drawioBlock = ['``` drawio', drawioData.toString(), '```'].join('\n');
    let beginPos;
    let endPos;

    if (this.isInDrawioBlock(editor)) {
      beginPos = this.getBod(editor);
      endPos = this.getEod(editor);
    }
    else {
      beginPos = this.cursorLine(editor).from;
      endPos = this.cursorLine(editor).to;
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
    // refs: https://github.com/codemirror/CodeMirror/blob/5.64.0/addon/fold/foldcode.js#L106-L111
    for (let i = this.firstLineNum(), e = this.lastLineNum(editor); i <= e; i++) {
      const lineText = this.getLine(editor, i + 1).text;
      const match = this.lineBeginPartOfDrawioRE.exec(lineText);
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
