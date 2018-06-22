class Xss {

  constructor(crowi) {
    const xss = require('xss');

    const config = crowi.config;
    const isXSSPrevented = config.isXSSPrevented;
    const XSSOption = config.XSSOption;
    let tagWhiteList = config.tagWhiteList;
    let attrWhiteList = config.attrWhiteList;

    /**
     * reference: https://meta.stackexchange.com/questions/1777/what-html-tags-are-allowed-on-stack-exchange-sites
     */
    const recommendedTagWhiteList = [
      'a', 'b', 'blockquote', 'blockquote', 'code', 'del', 'dd', 'dl', 'dt', 'em',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'i', 'img', 'kbd', 'li', 'ol', 'p', 'pre',
      's', 'sup', 'sub', 'strong', 'strike', 'ul', 'br', 'hr'
    ];
    const recommendedAttrWhiteList = ['src', 'width', 'height', 'alt', 'title', 'href'];
    let whiteListContent = {};

    // default
    let option = {
      stripIgnoreTag: true,
      stripIgnoreTagBody: true,
      css: false,
      whiteList: whiteListContent,
      escapeHtml: (html) => html,   // resolve https://github.com/weseek/growi/issues/221
    };

    if (isXSSPrevented) {
      switch (XSSOption) {
        case 1: // ignore all: use default option
          break;

        case 2: // recommended
          recommendedTagWhiteList.forEach(tag => {
            whiteListContent[tag] = recommendedAttrWhiteList;
          });
          option['whiteList'] = whiteListContent;
          break;

        case 3: // custom white list
          tagWhiteList.forEach(tag => {
            whiteListContent[tag] = attrWhiteList;
          });
          option['whiteList'] = whiteListContent;
          break;

        default:
      }
    }
    else {
      option['stripIgnoreTag'] = false;
      option['stripIgnoreTagBody'] = false;
    }

    // create the XSS Filter instance
    this.myxss = new xss.FilterXSS(option);
  }

  process(markdown) {
    return this.myxss.process(markdown);
  }

}

module.exports = Xss;
