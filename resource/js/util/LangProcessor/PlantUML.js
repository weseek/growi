import plantuml from 'plantuml-encoder';
import crypto from 'crypto';

export default class PlantUML {

  constructor(crowi) {
    this.crowi = crowi;

  }

  generateId(token) {
    const hasher = require('crypto').createHash('md5');
    hasher.update(token);
    return hasher.digest('hex');
  }

  process(code, lang) {
    const config = crowi.getConfig();
    if (!config.env.PLANTUML_URI) {
      return `<pre class="wiki-code"><code>${Crowi.escape(code, true)}\n</code></pre>`;
    }

    let plantumlUri = config.env.PLANTUML_URI;
    if (plantumlUri.substr(-1) !== '/') {
      plantumlUri += '/';
    }
    const id = this.generateId(code + lang);
    const encoded = plantuml.encode(`@startuml

skinparam monochrome true

${code}
@enduml`);

    return `
      <div id="${id}" class="plantuml noborder">
        <img src="${plantumlUri}svg/${encoded}">
      </div>
    `;
  }
}

