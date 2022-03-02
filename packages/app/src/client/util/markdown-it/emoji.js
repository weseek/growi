import { emojiMartData } from './emoji-mart-data';

export default class EmojiConfigurer {

  constructor(crowi) {
    this.crowi = crowi;
  }

  configure(md) {
    emojiMartData().then((data) => {
      md.use(require('markdown-it-emoji-mart'), { defs: data });
    });
  }

}
