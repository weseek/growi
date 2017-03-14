export class LsxCacheHelper {

  /**
   * @private
   */
  static retrieveFromSessionStorage() {
    return JSON.parse(sessionStorage.getItem('lsx-cache')) || {};
  }

  /**
   * stringify and save obj
   *
   * @static
   * @param {any} cacheObj
   *
   * @memberOf LsxCacheHelper
   */
  static saveToSessionStorage(cacheObj) {
    sessionStorage.setItem('lsx-cache', JSON.stringify(cacheObj));
  }

  /**
   * generate cache key for storing to storage
   *
   * @static
   * @param {any} lsxContext
   * @returns
   *
   * @memberOf LsxCacheHelper
   */
  static generateCacheKeyFromContext(lsxContext) {
    return `${lsxContext.fromPagePath}__${lsxContext.lsxArgs}`;
  }

  /**
   *
   *
   * @static
   * @param {any} key
   * @returns
   *
   * @memberOf LsxCacheHelper
   */
  static getStateCache(key) {
    let cacheObj = LsxCacheHelper.retrieveFromSessionStorage();
    return cacheObj[key];
  }

  /**
   * store state object of React Component with specified key
   *
   * @static
   * @param {any} key
   * @param {any} lsxState state object of React Component
   *
   * @memberOf LsxCacheHelper
   */
  static cacheState(key, lsxState) {
    let cacheObj = LsxCacheHelper.retrieveFromSessionStorage();
    cacheObj[key] = lsxState;

    LsxCacheHelper.saveToSessionStorage(cacheObj);
  }
}
