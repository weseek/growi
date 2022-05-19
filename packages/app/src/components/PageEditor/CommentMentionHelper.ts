import { debounce } from 'throttle-debounce';

import { apiv3Get } from '~/client/util/apiv3-client';

export default class CommentMentionHelper {

  editor;

  pattern: RegExp;


  constructor(editor) {
    this.editor = editor;
  }

  getUsernamHint = () => {
    // Get word that contains `@` character at the begining
    const currentPos = this.editor.getCursor();
    const wordStart = this.editor.findWordAt(currentPos).anchor.ch - 1;
    const wordEnd = this.editor.findWordAt(currentPos).head.ch;

    const searchFrom = { line: currentPos.line, ch: wordStart };
    const searchTo = { line: currentPos.line, ch: wordEnd };

    const searchMention = this.editor.getRange(searchFrom, searchTo);
    const isMentioning = searchMention.charAt(0) === '@';

    // Return nothing if not mentioning
    if (!isMentioning) {
      return;
    }

    // Get username after `@` character and search username
    const mention = searchMention.substr(1);
    this.editor.showHint({
      completeSingle: false,
      hint: async() => {
        if (mention.length > 0) {
          const users = await this.getUsersList(mention);
          return {
            list: users,
            from: searchFrom,
            to: searchTo,
          };
        }
      },
    });
  }

  getUsersList = async(username) => {
    const { data } = await apiv3Get('/users/list', { username });
    return data.users.map(user => ({
      text: `@${user.username} `,
      displayText: user.username,
    }));
  }

showUsernameHint= debounce(800, () => this.getUsernamHint());

}
