export default class CommonPluginsConfigurer {

  constructor(crowi) {
    this.crowi = crowi;
  }

  configure(md) {
    md.use(require('markdown-it-footnote'))
      .use(require('markdown-it-task-lists'), {
        enabled: true,
      })
      .use(require('markdown-it-toc-and-anchor').default, {
        anchorLinkBefore: false,
        anchorLinkSymbol: '',
        anchorLinkSymbolClassName: 'fa fa-link',
        anchorClassName: 'revision-head-link',
      })
      ;

    md.set({
      tocCallback: (tocMarkdown, tocArray, tocHtml) => {
        // TODO impl
      },
    });
  }

}
