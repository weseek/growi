/**
 * Utility for markdown drawio
 */
class MarkdownDrawioUtil {

  constructor() {
    // https://github.com/markdown-it/markdown-it/blob/d29f421927e93e88daf75f22089a3e732e195bd2/lib/rules_block/table.js#L83
    this.tableAlignmentLineRE = /^[-:|][-:|\s]*$/;
    this.tableAlignmentLineNegRE = /^[^-:]*$/; // it is need to check to ignore empty row which is matched above RE
    // https://regex101.com/r/7BN2fR/10
    this.linePartOfTableRE = /^([^\r\n|]*)\|(([^\r\n|]*\|)+)$/;
    // https://regex101.com/r/1UuWBJ/3
    this.emptyLineOfTableRE = /^([^\r\n|]*)\|((\s*\|)+)$/;
  }

  /**
   * return MarkdownTable instance of the table where the cursor is
   * (If the cursor is not in a table, return null)
   */
  getMarkdownDrawioMxfile(editor) {
    const curPos = editor.getCursor();
    return editor.getDoc().getLine(curPos.line);
  }

  replaceFocusedDrawioWithEditor(editor, drawioData) {
    const curPos = editor.getCursor();
    const line = editor.getDoc().getLine(curPos.line);
    editor.getDoc().replaceRange(drawioData.toString(), { line: curPos.line, ch: 0 }, { line: curPos.line, ch: line.length });
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
