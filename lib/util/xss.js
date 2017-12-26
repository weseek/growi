class Xss {

  constructor(isAllowAllAttrs) {
    const xss = require('xss');

    // create the option object
    let option = {
      stripIgnoreTag: true,
      css: false,
      escapeHtml: (html) => html,
    };
    if (isAllowAllAttrs) {
      // allow all attributes
      option.onTagAttr = function(tag, name, value, isWhiteAttr) {
        return `${name}="${value}"`;
      }
    }
    // create the XSS Filter instance
    this.myxss = new xss.FilterXSS(option);
  }

  process(markdown) {
    return this.myxss.process(markdown);
  }

}

module.exports = Xss;
