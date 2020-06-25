/**
 * Utility for markdown link
 */
class MarkdownLinkUtil {

  constructor() {
    this.isInLink = this.isInLink.bind(this);
    this.getBeginningAndEndOfTheClosestLinkToCursor = this.getBeginningAndEndOfTheClosestLinkToCursor.bind(this);
  }

  // return text as markdown link if the cursor on markdown link else return text as default label of new link.
  getMarkdownLink(editor) {
    console.log(this.isInLink(editor));
    if (!this.isInLink(editor)) {
      return editor.getDoc().getSelection();
    }
    const curPos = editor.getCursor();

    const { beginningOfLink, endOfLink } = this.getBeginningAndEndOfTheClosestLinkToCursor(editor);
    console.log(editor.getDoc().getLine(curPos.line).subString(beginningOfLink, endOfLink));
    return editor.getDoc().getLine(curPos.line).subString(beginningOfLink, endOfLink);
  }


  /**
   * return the postion of the BOL(beginning of link)
   * (If the cursor is not in a link, return its position)
   */
  getBot(editor) {
    const curPos = editor.getCursor();
    if (!this.isInLink(editor)) {
      return { line: curPos.line, ch: curPos.ch };
    }

    const firstLine = editor.getDoc().firstLine();
    let line = curPos.line - 1;
    for (; line >= firstLine; line--) {
      const strLine = editor.getDoc().getLine(line);
      if (!this.linePartOfTableRE.test(strLine)) {
        break;
      }
    }
    const botLine = Math.max(firstLine, line + 1);
    return { line: botLine, ch: 0 };
  }

  /**
   * return the postion of the EOT(end of table)
   * (If the cursor is not in a table, return its position)
   */
  getEot(editor) {
    const curPos = editor.getCursor();
    if (!this.isInTable(editor)) {
      return { line: curPos.line, ch: curPos.ch };
    }

    const lastLine = editor.getDoc().lastLine();
    let line = curPos.line + 1;
    for (; line <= lastLine; line++) {
      const strLine = editor.getDoc().getLine(line);
      if (!this.linePartOfTableRE.test(strLine)) {
        break;
      }
    }
    const eotLine = Math.min(line - 1, lastLine);
    const lineLength = editor.getDoc().getLine(eotLine).length;
    return { line: eotLine, ch: lineLength };
  }

  getSelectedTextInEditor(editor) {
    return editor.getDoc().getSelection();
  }

  replaceFocusedMarkdownLinkWithEditor(editor, link) {
    editor.getDoc().replaceSelection(link);
  }

  isInLink(editor) {
    const curPos = editor.getCursor();
    const { endOfLink } = this.getBeginningAndEndOfTheClosestLinkToCursor(editor);
    return curPos < endOfLink;
  }

  // return beginning index and end index of the closest link to cursor
  // if there is no link, return { beginningOfLink: -1, endOfLink: -1}
  getBeginningAndEndOfTheClosestLinkToCursor(editor) {
    const curPos = editor.getCursor();
    const line = editor.getDoc().getLine(curPos.line);
    let beginningOfLink = line.lastIndexOf('[', curPos.ch);
    let endOfLink = line.indexOf(']', beginningOfLink);
    if (line.charAt(endOfLink + 1) === '(') {
      endOfLink = line.indexOf(')', endOfLink);
    }
    else if (line.charAt(beginningOfLink - 1) === '[' && line.charAt(endOfLink + 1) === ']') { // todo 先頭が[一つの時にえらーにならないか調査する
      beginningOfLink -= 1;
      endOfLink += 1;
    }

    return { beginningOfLink, endOfLink };
  }

}

// singleton pattern
const instance = new MarkdownLinkUtil();
Object.freeze(instance);
export default instance;
