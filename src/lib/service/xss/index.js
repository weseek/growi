class Xss {

  constructor(xssOption) {
    const xss = require('xss');

    xssOption = xssOption || {}; // eslint-disable-line no-param-reassign

    const tagWhiteList = xssOption.tagWhiteList || [];
    const attrWhiteList = xssOption.attrWhiteList || [];

    const whiteListContent = {};

    // default
    const option = {
      stripIgnoreTag: true,
      stripIgnoreTagBody: false, // see https://github.com/weseek/growi/pull/505
      css: false,
      whiteList: whiteListContent,
      escapeHtml: (html) => { return html }, // resolve https://github.com/weseek/growi/issues/221
    };

    tagWhiteList.forEach((tag) => {
      whiteListContent[tag] = attrWhiteList;
    });

    // create the XSS Filter instance
    this.myxss = new xss.FilterXSS(option);
  }

  process(document) {
    return this.myxss.process(document);
  }

}

module.exports = Xss;
