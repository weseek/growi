export default class DrawioViewerConfigurer {

  constructor(crowi) {
    // this.crowi = crowi;
    // const config = crowi.getConfig();

    this.drawioViewerURL = 'https://www.draw.io/js/viewer.min.js';
  }

  configure(md) {
    md.use(require('markdown-it-drawio-viewer'), {
      drawioViewerURL: this.drawioViewerURL,
      marker: ':::',
    });
  }

}
