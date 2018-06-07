export default class BlockdiagConfigurer {

  constructor(crowi) {
    this.crowi = crowi;
    const config = crowi.getConfig();

    this.generateSourceUrl = config.env.BLOCKDIAG_URL || 'https://blockdiag-api.com/';
  }

  configure(md) {
    md.use(require('markdown-it-blockdiag'), {
      generateSourceUrl: this.generateSourceUrl,
    });
  }
}
