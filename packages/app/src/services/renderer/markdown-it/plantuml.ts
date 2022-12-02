import plantumlEncoder from 'plantuml-encoder';
import urljoin from 'url-join';

import { RendererConfig } from '~/interfaces/services/renderer';

export default class PlantUMLConfigurer {

  serverUrl: string;

  constructor(config: RendererConfig) {
    // Do NOT use HTTPS URL because plantuml.com refuse request except from members
    this.serverUrl = config.plantumlUri || 'http://plantuml.com/plantuml';

    this.generateSource = this.generateSource.bind(this);
  }

  configure(md) {
    // md.use(require('markdown-it-plantuml'), {
    //   generateSource: this.generateSource,
    // });
  }

  generateSource(umlCode) {
    const zippedCode = plantumlEncoder.encode(`@startuml\n${umlCode}\n@enduml`);
    return urljoin(this.serverUrl, 'svg', zippedCode);
  }

}
