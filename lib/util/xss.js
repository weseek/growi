export default class Xss {

  constructor(xssOption) {
    const xss = require('xss');

    const isXssPrevented = xssOption.isXssPrevented;
    const tagWhiteList = xssOption.tagWhiteList;
    const attrWhiteList = xssOption.attrWhiteList;

    let whiteListContent = {};

    // default
    let option = {
      stripIgnoreTag: true,
      stripIgnoreTagBody: false,
      css: false,
      whiteList: whiteListContent,
      escapeHtml: (html) => html,   // resolve https://github.com/weseek/growi/issues/221
    };

    if (isXssPrevented) {
      tagWhiteList.forEach(tag => {
        whiteListContent[tag] = attrWhiteList;
      });
    }
    else {
      option['stripIgnoreTag'] = false;
    }

    // create the XSS Filter instance
    this.myxss = new xss.FilterXSS(option);
  }

  process(markdown) {
    return this.myxss.process(markdown);
  }

}
