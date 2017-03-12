/**
 * for storing cache to sessionStorage
 */
export class LsxCache {

  cache = {};

  getItem(tagExpression) {
    return cache[tagExpression];
  }

  setItem(tagExpression, html) {
    cache[tagExpression] = html;
  }

}
