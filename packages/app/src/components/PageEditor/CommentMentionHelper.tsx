
export default class CommentMentionHelper {

  editor;

  pattern: RegExp;

  constructor(editor) {
    this.editor = editor;
    this.pattern = /@[A-Za-z0-9._-]*/;
  }

  showUsernameHint = () => {
    const currentPos = this.editor.getCursor();
    const sc = this.editor.getSearchCursor(this.pattern, currentPos, { multiline:  false });
    if (sc.findPrevious()) {
      const isMentioning = (currentPos.line === sc.to().line && currentPos.ch === sc.to().ch);
      if (!isMentioning) {
        return;
      }
    }
    else {
      return;
    }

    this.editor.showHint({
      completeSingle: false,
      hint: () => {
        const mention = this.editor.getDoc().getRange(sc.from(), sc.to());
        const username = mention.replace('@', '');
        return {
          list: ['username1', 'username2'],
          from: sc.from(),
          to: sc.to(),
        };
      },
    });
  }

}
