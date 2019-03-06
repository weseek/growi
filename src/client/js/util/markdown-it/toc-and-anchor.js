export default class TocAndAnchorConfigurer {
  constructor(crowi, renderToc) {
    this.crowi = crowi;
    this.renderToc = renderToc;
  }

  configure(md) {
    md.use(require('markdown-it-toc-and-anchor-with-slugid').default, {
      tocLastLevel: 3,
      anchorLinkBefore: false,
      anchorLinkSymbol: '',
      anchorLinkSymbolClassName: 'icon-link',
      anchorClassName: 'revision-head-link',
    });

    // set toc render function
    if (this.renderToc != null) {
      md.set({
        tocCallback: (tocMarkdown, tocArray, tocHtml) => {
          this.renderToc(tocHtml);
        },
      });
    }
  }
}
