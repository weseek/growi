import { TagContext } from '../model/tag-context';

/**
 * @private
 *
 * create random strings
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
 * @typedef FindTagAndReplaceResult
 * @property {string} html - HTML string
 * @property {Object} tagContextMap - Object.<string, [TagContext]{@link ../model/tag-context.html#TagContext}>
 *
 * @memberof customTagUtils
 */
/**
 * @param {RegExp} tagPattern
 * @param {string} html
 * @param {function} replace replace function
 * @return {FindTagAndReplaceResult}
 *
 * @memberof customTagUtils
 */
export function findTagAndReplace(tagPattern, html, replace) {
  let replacedHtml = html;
  const tagContextMap = {};

  if (tagPattern == null || html == null) {
    return { html: replacedHtml, tagContextMap };
  }

  // see: https://regex101.com/r/NQq3s9/9
  const pattern = new RegExp(`\\$(${tagPattern.source})\\((.*?)\\)(?=[<\\[\\s\\$])|\\$(${tagPattern.source})\\((.*)\\)(?![<\\[\\s\\$])`, 'g');

  replacedHtml = html.replace(pattern, (all, group1, group2, group3, group4) => {
    const tagExpression = all;
    const method = (group1 || group3).trim();
    const args = (group2 || group4 || '').trim();

    // create contexts
    const tagContext = new TagContext({ tagExpression, method, args });

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
