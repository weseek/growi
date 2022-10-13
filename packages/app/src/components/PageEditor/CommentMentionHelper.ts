import i18n from 'i18next';
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
            list: users.length > 0 ? users : [{ text: '', displayText: i18n.t('page_comment.no_user_found') }],
            from: searchFrom,
            to: searchTo,
          };
        }
      },
    });
  };

  getUsersList = async(q: string) => {
    const limit = 20;
    const { data } = await apiv3Get('/users/usernames', { q, limit });
    return data.activeUser.usernames.map(username => ({
      text: `@${username} `,
      displayText: username,
    }));
  };

  showUsernameHint = debounce(800, () => this.getUsernamHint());

}
