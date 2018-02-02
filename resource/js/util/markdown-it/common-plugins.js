export default class CommonPluginsConfigurer {

  constructor(crowi) {
    this.crowi = crowi;
  }

  configure(md) {
    md.use(require('markdown-it-footnote'))
      .use(require('markdown-it-task-lists'), {
        enabled: true,
      })
      ;
  }

}
