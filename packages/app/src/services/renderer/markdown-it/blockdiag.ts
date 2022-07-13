import { GrowiRendererConfig } from '~/interfaces/services/renderer';

export default class BlockdiagConfigurer {

  generateSourceUrl: string;

  constructor(growiConfig: GrowiRendererConfig) {
    this.generateSourceUrl = growiConfig.blockdiagUri || 'https://blockdiag-api.com/';
  }

  configure(md) {
    md.use(require('markdown-it-blockdiag'), {
      generateSourceUrl: this.generateSourceUrl,
      marker: ':::',
    });
  }

}
