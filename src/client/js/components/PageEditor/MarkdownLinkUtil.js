/**
 * Utility for markdown link
 */
class MarkdownLinkUtil {

  constructor() {
    this.getMarkdownLinkOrSelectedText = this.getMarkdownLinkOrSelectedText.bind(this);
    this.isInLink = this.isInLink.bind(this);
    this.getBeginningAndEndOfTheClosestLinkToCursor = this.getBeginningAndEndOfTheClosestLinkToCursor.bind(this);
    this.replaceFocusedMarkdownLinkWithEditor = this.replaceFocusedMarkdownLinkWithEditor.bind(this);
  }

  // return text as markdown link if the cursor on markdown link else return text as default label of new link.
  getMarkdownLinkOrSelectedText(editor) {
    if (!this.isInLink(editor)) {
      return editor.getDoc().getSelection();
    }
    const { beginningOfLink, endOfLink } = this.getBeginningAndEndOfTheClosestLinkToCursor(editor);
    const curPos = editor.getCursor();
    return editor.getDoc().getLine(curPos.line).substring(beginningOfLink, endOfLink);
  }

  isInLink(editor) {
    const curPos = editor.getCursor();
    const { beginningOfLink, endOfLink } = this.getBeginningAndEndOfTheClosestLinkToCursor(editor);
    return beginningOfLink >= 0 && endOfLink >= 0 && beginningOfLink <= curPos.ch && curPos.ch <= endOfLink;
  }

  // return beginning index and end index of the closest link to cursor
  // if there is no link, return { beginningOfLink: -1, endOfLink: -1}
  getBeginningAndEndOfTheClosestLinkToCursor(editor) {
    const curPos = editor.getCursor();
    const line = editor.getDoc().getLine(curPos.line);

    // get beginning and end of growi link ('[link]')
    let beginningOfLink = line.lastIndexOf('[', curPos.ch);
    let endOfLink = line.indexOf(']', beginningOfLink) + 1;

    // if it is markdown link ('[label](link)'), get beginning and end of it
    if (line.charAt(endOfLink) === '(') {
      endOfLink = line.indexOf(')', endOfLink) + 1;
    }
    // if it is pukiwiki link ('[[link]]'), get beginning and end of it
    else if (line.charAt(beginningOfLink - 1) === '[' && line.charAt(endOfLink) === ']') {
      beginningOfLink -= 1;
      endOfLink += 1;
    }
    return { beginningOfLink, endOfLink };
  }

  replaceFocusedMarkdownLinkWithEditor(editor) {
    // GW-3023
  }

}

// singleton pattern
const instance = new MarkdownLinkUtil();
Object.freeze(instance);
export default instance;
