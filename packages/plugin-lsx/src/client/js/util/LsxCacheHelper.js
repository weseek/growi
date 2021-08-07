import { PageNode } from '../components/PageNode';

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
   * @param {object} cacheObj
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
   * @param {LsxContext} lsxContext
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
   * @param {string} key
   * @returns
   *
   * @memberOf LsxCacheHelper
   */
  static getStateCache(key) {
    const cacheObj = LsxCacheHelper.retrieveFromSessionStorage();
    const stateCache = cacheObj[key];

    if (stateCache != null && stateCache.nodeTree != null) {
      // instanciate PageNode
      stateCache.nodeTree = stateCache.nodeTree.map((obj) => {
        return PageNode.instanciateFrom(obj);
      });
    }

    return stateCache;
  }

  /**
   * store state object of React Component with specified key
   *
   * @static
   * @param {string} key
   * @param {object} lsxState state object of React Component
   *
   * @memberOf LsxCacheHelper
   */
  static cacheState(key, lsxState) {
    const cacheObj = LsxCacheHelper.retrieveFromSessionStorage();
    cacheObj[key] = lsxState;

    LsxCacheHelper.saveToSessionStorage(cacheObj);
  }

  /**
   * clear all state caches
   *
   * @static
   *
   * @memberOf LsxCacheHelper
   */
  static clearAllStateCaches() {
    LsxCacheHelper.saveToSessionStorage({});
  }

}
