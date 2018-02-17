import emojiStrategy from '../emojione/emoji_strategy_shrinked.json';

export default class EmojiConfigurer {

  constructor(crowi) {
    this.crowi = crowi;
  }

  configure(md) {
    const emojiShortnameUnicodeMap = {};

    for (let unicode in emojiStrategy) {
      const data = emojiStrategy[unicode];
      const shortname = data.shortname.replace(/\:/g, '');
      emojiShortnameUnicodeMap[shortname] = String.fromCharCode(unicode);
    }

    md.use(require('markdown-it-emoji'), {defs: emojiShortnameUnicodeMap});

    // integrate markdown-it-emoji and emojione
    md.renderer.rules.emoji = (token, idx) => {
      const shortname = `:${token[idx].markup}:`;
      return emojione.shortnameToImage(shortname);
    };
  }

}
