export default class EmojiConfigurer {

  constructor(crowi) {
    this.crowi = crowi;
  }

  configure(md) {
    md.use(require('markdown-it-emoji'));

    // integrate markdown-it-emoji and emojione
    md.renderer.rules.emoji = (token, idx) => {
      const shortname = `:${token[idx].markup}:`;
      return emojione.shortnameToImage(shortname);
    };
  }

}
