const xss = require('xss');

const commonmarkSpec = require('./commonmark-spec');


const REPETITIONS_NUM = 50;

class Xss {

  constructor(xssOption) {

    xssOption = xssOption || {}; // eslint-disable-line no-param-reassign

    const tagWhitelist = xssOption.tagWhitelist || [];
    const attrWhitelist = xssOption.attrWhitelist || [];

    const whitelistContent = {};

    // default
    const option = {
      stripIgnoreTag: true,
      stripIgnoreTagBody: false, // see https://github.com/weseek/growi/pull/505
      css: false,
      whitelist: whitelistContent,
      escapeHtml: (html) => { return html }, // resolve https://github.com/weseek/growi/issues/221
      onTag: (tag, html, options) => {
        // pass autolink
        if (tag.match(commonmarkSpec.uriAutolinkRegexp) || tag.match(commonmarkSpec.emailAutolinkRegexp)) {
          return html;
        }
      },
    };

    tagWhitelist.forEach((tag) => {
      whitelistContent[tag] = attrWhitelist;
    });

    // create the XSS Filter instance
    this.myxss = new xss.FilterXSS(option);
  }

  process(document) {
    let count = 0;
    let currDoc = document;
    let prevDoc = document;

    do {
      count += 1;
      // stop running infinitely
      if (count > REPETITIONS_NUM) {
        return '--filtered--';
      }

      prevDoc = currDoc;
      currDoc = this.myxss.process(currDoc);
    }
    while (currDoc !== prevDoc);

    return currDoc;
  }

}

module.exports = Xss;
