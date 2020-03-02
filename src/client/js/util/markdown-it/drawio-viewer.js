export default class DrawioViewerConfigurer {

  configure(md) {
    md.use(require('markdown-it-drawio-viewer'), {
      marker: ':::',
    });
  }

}
