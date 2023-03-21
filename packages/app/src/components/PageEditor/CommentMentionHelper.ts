import { Editor } from 'codemirror';
import { debounce } from 'throttle-debounce';

import { apiv3Get } from '~/client/util/apiv3-client';


type UsersListForHints = {
  text: string
  displayText: string
}
export default class CommentMentionHelper {

  editor: Editor;

  t;

  constructor(editor: Editor, t) {
    this.editor = editor;
    this.t = t;
  }

  getUsenameHint = (): void => {
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
    const mention = searchMention.slice(1);
    this.editor.showHint({
      completeSingle: false,
      hint: async() => {
        if (mention.length > 0) {
          const users = await this.getUsersList(mention);
          return {
            list: users.length > 0 ? users : [{ text: '', displayText: this.t('page_comment.no_user_found') }],
            from: searchFrom,
            to: searchTo,
          };
        }
      },
    });
  };

  getUsersList = async(q: string): Promise<UsersListForHints[]> => {
    const limit = 20;
    const { data } = await apiv3Get('/users/usernames', { q, limit });
    return data.activeUser.usernames.map((username: string) => ({
      text: `@${username} `,
      displayText: username,
    }));
  };

  showUsernameHint = debounce(800, () => this.getUsenameHint());

}
