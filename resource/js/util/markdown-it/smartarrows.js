//
// Sample for implement Markdown-it plugin
//  ==> , -->
//
export default class SmartArrowConfigurer {

  constructor(crowi) {
    this.crowi = crowi;
    //const config = crowi.getConfig();

  }

  configure(md) {
    md.use(require('markdown-it-smartarrows'));
  }
}
