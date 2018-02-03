export default class TocAndAnchorConfigurer {

  constructor(crowi, renderToc) {
    this.crowi = crowi;
    this.renderToc = renderToc;
  }

  configure(md) {
    md.use(require('markdown-it-toc-and-anchor').default, {
        anchorLinkBefore: false,
        anchorLinkSymbol: '',
        anchorLinkSymbolClassName: 'fa fa-link',
        anchorClassName: 'revision-head-link',
      })
      .use(require('markdown-it-named-headers'), {  // overwrite id defined by markdown-it-toc-and-anchor
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
   * @see https://qiita.com/satokaz/items/64582da4640898c4bf42
   * @param {string} header
   */
  customSlugify(header) {
    return encodeURIComponent(header.trim()
      .toLowerCase()
      .replace(/[\]\[\!\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\\\^\_\{\|\}\~]/g, '')
      .replace(/\s+/g, '-')) // Replace spaces with hyphens
      .replace(/\-+$/, ''); // Replace trailing hyphen
  }
}
