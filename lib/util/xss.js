class Xss {

  constructor(crowi) {
    const xss = require('xss');

    const config = crowi.config;
    const isXSSPrevented = config.isXSSPrevented;
    const XSSOption = config.XSSOption;
    const tagWhiteList = config.tagWhiteList;
    const attrWhiteList = config.attrWhiteList;

    let whiteListContent = {};
    tagWhiteList.forEach(tag => {
      whiteListContent[tag] = attrWhiteList;
    });

    // create the option object
    let option = {
      stripIgnoreTag: true,
      stripIgnoreTagBody: false,
      css: false,
      whiteList: whiteListContent,
      escapeHtml: (html) => html,   // resolve https://github.com/weseek/growi/issues/221
    };

    //what is this??????????????????? maybe disable this
    // if (crowi) {
    //   // allow all attributes
    //   option.onTagAttr = function(tag, name, value, isWhiteAttr) {
    //     return `${name}="${value}"`;
    //   };
    // }
    // create the XSS Filter instance
    this.myxss = new xss.FilterXSS(option);
  }

  process(markdown) {
    return this.myxss.process(markdown);
  }

}

module.exports = Xss;
