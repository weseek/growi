import uslug from 'uslug';

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
        anchorLinkSymbolClassName: 'fa fa-link',
        anchorClassName: 'revision-head-link',
        slugify: this.customSlugify,
      })
      ;

    // set toc render function
    if (this.renderToc != null) {
      md.set({
        tocCallback: (tocMarkdown, tocArray, tocHtml) => {
          this.renderToc(tocHtml);
        },
      });
    }
  }

  /**
   * create Base64 encoded id
   * @param {string} header
   */
  customSlugify(header) {
    return encodeURIComponent(uslug(header.trim()));
  }
}
