import urljoin from 'url-join';

export default class PlantUMLConfigurer {

  constructor(crowi) {
    this.crowi = crowi;
    const config = crowi.getConfig();

    this.deflate = require('markdown-it-plantuml/lib/deflate.js');
    this.serverUrl = config.env.PLANTUML_URI || 'http://plantuml.com';

    this.generateSource = this.generateSource.bind(this);
  }

  configure(md) {
    md.use(require('markdown-it-plantuml'), 'name', {
      generateSource: this.generateSource,
    });
  }

  generateSource(umlCode) {
    const zippedCode =
      this.deflate.encode64(this.deflate.zip_deflate('@startuml\n' + umlCode + '\n@enduml', 9));
    return urljoin(this.serverUrl, 'plantuml', 'svg' , zippedCode);
  }
}
