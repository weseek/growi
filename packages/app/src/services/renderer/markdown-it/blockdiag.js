export default class BlockdiagConfigurer {

  constructor(growiConfig) {
    this.generateSourceUrl = growiConfig.env.BLOCKDIAG_URI || 'https://blockdiag-api.com/';
  }

  configure(md) {
    md.use(require('markdown-it-blockdiag'), {
      generateSourceUrl: this.generateSourceUrl,
      marker: ':::',
    });
  }

}
