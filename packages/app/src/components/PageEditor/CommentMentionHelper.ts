import { debounce } from 'throttle-debounce';

import { apiv3Get } from '~/client/util/apiv3-client';

const USERNAME_PATTERN = new RegExp(/@[A-Za-z0-9._-]{1,}/);

export default class CommentMentionHelper {

  editor;

  pattern: RegExp;


  constructor(editor) {
    this.editor = editor;
    this.pattern = USERNAME_PATTERN;

  }

  getUsernamHint = () => {
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
      hint: async() => {
        const mention = this.editor.getDoc().getRange(sc.from(), sc.to());
        const username = mention.replace('@', '');
        if (username.length > 0) {
          const users = await this.getUsersList(username);
          return {
            list: users,
            from: sc.from(),
            to: sc.to(),
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
