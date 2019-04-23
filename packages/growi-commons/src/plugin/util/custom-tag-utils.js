const TagContext = require('../model/tag-context');

/**
 * @see http://qiita.com/ryounagaoka/items/4736c225bdd86a74d59c
 *
 * @param {number} length
 * @return {string} random strings
 */
function createRandomStr(length) {
  const bag = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let generated = '';
  for (let i = 0; i < length; i++) {
    generated += bag[Math.floor(Math.random() * bag.length)];
  }
  return generated;
}

/**
 * @param {RegExp} tagPattern
 * @param {string} html
 * @param {function} replace replace function
 * @return {{html: string, tagContextMap: Object.<string, TagContext>}}
 */
function findTagAndReplace(tagPattern, html, replace) {
  // see: https://regex101.com/r/NQq3s9/9
  const pattern = new RegExp(`\\$(${tagPattern.source})\\((.*?)\\)(?=[<\\[\\s\\$])|\\$(${tagPattern.source})\\((.*)\\)(?![<\\[\\s\\$])`, 'g');

  const tagContextMap = {};
  const replacedHtml = html.replace(pattern, (all, group1, group2, group3, group4) => {
    const tagExpression = all;
    const method = (group1 || group3).trim();
    const args = (group2 || group4 || '').trim();

    // create contexts
    const tagContext = new TagContext();
    tagContext.tagExpression = tagExpression;
    tagContext.method = method;
    tagContext.args = args;

    if (replace != null) {
      return replace(tagContext);
    }

    // replace with empty dom
    const domId = `${method}-${createRandomStr(8)}`;
    tagContextMap[domId] = tagContext;
    return `<div id="${domId}"></div>`;
  });

  return { html: replacedHtml, tagContextMap };
}

module.exports = {
  findTagAndReplace,
  TagContext,
  ArgsParser: require('./args-parser'),
  OptionParser: require('./option-parser'),
};
