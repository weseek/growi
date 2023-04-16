import { RendererConfig } from '~/interfaces/services/renderer';

export default class BlockdiagConfigurer {

  generateSourceUrl: string;

  constructor(config: RendererConfig) {
    this.generateSourceUrl = config.blockdiagUri || 'https://blockdiag-api.com/';
  }

  configure(md) {
    // md.use(require('markdown-it-blockdiag'), {
    //   generateSourceUrl: this.generateSourceUrl,
    //   marker: ':::',
    // });
  }

}
