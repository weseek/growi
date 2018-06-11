export default class BlockdiagConfigurer {

  constructor(crowi) {
    this.crowi = crowi;
    const config = crowi.getConfig();

    this.generateSourceUrl = config.env.BLOCKDIAG_URL || 'https://blockdiag-api.com/';
  }

  configure(md) {
    //// disable temporary because this breaks /Sandbox -- 2018.06.08 Yuki Takei
    // md.use(require('markdown-it-blockdiag'), {
    //   generateSourceUrl: this.generateSourceUrl,
    //   marker: ':::',
    // });
  }
}
