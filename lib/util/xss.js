class Xss {

  constructor(crowi) {
    const xss = require('xss');

    const config = crowi.config;
    const isXSSPrevented = config.isXSSPrevented;
    const tagWhiteList = config.tagWhiteList;
    const attrWhiteList = config.attrWhiteList;

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
      tagWhiteList.forEach(tag => {
        whiteListContent[tag] = attrWhiteList;
      });
      option['whiteList'] = whiteListContent;
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
