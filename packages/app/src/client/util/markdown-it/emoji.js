export default class EmojiConfigurer {

  constructor(crowi) {
    this.crowi = crowi;
  }

  configure(md) {
    const emojiStrategy = this.crowi.getEmojiStrategy();

    const emojiShortnameUnicodeMap = {};

    /* eslint-disable guard-for-in, no-restricted-syntax */
    for (const unicode in emojiStrategy) {
      const data = emojiStrategy[unicode];
      const shortname = data.shortname.replace(/:/g, '');
      emojiShortnameUnicodeMap[shortname] = String.fromCharCode(unicode);
    }
    /* eslint-enable guard-for-in, no-restricted-syntax */

    md.use(require('markdown-it-emoji'), { defs: emojiShortnameUnicodeMap });

    // integrate markdown-it-emoji and emojione
    md.renderer.rules.emoji = (token, idx) => {
      const shortname = `:${token[idx].markup}:`;
      return emojione.shortnameToImage(shortname);
    };
  }

}
