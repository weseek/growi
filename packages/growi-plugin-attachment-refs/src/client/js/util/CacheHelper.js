import { LocalStorageManager } from 'growi-commons';

const REFS_STATE_CACHE_NS = 'refs-state-cache';

export default class CacheHelper {

  /**
   * generate cache key for storing to storage
   *
   * @param {TagContext} tagContext
   */
  static generateCacheKey(tagContext) {
    // return `${lsxContext.fromPagePath}__${lsxContext.args}`;
    return `${tagContext.method}__${tagContext.args}`;
  }

  /**
   *
   *
   * @static
   * @param {TagContext} tagContext
   * @returns
   */
  static getStateCache(tagContext) {
    const localStorageManager = LocalStorageManager.getInstance();

    const key = CacheHelper.generateCacheKey(tagContext);
    const stateCache = localStorageManager.retrieveFromSessionStorage(REFS_STATE_CACHE_NS, key);

    // if (stateCache != null && stateCache.nodeTree != null) {
    //   // instanciate PageNode
    //   stateCache.nodeTree = stateCache.nodeTree.map((obj) => {
    //     return PageNode.instanciateFrom(obj);
    //   });
    // }

    return stateCache;
  }

  /**
   * store state object of React Component with specified key
   *
   * @static
   * @param {TagContext} tagContext
   * @param {object} state state object of React Component
   */
  static cacheState(tagContext, state) {
    const localStorageManager = LocalStorageManager.getInstance();
    const key = CacheHelper.generateCacheKey(tagContext);
    localStorageManager.saveToSessionStorage(REFS_STATE_CACHE_NS, key, state);
  }

  /**
   * clear all state caches
   *
   * @static
   *
   * @memberOf LsxCacheHelper
   */
  static clearAllStateCaches() {
    const localStorageManager = LocalStorageManager.getInstance();
    localStorageManager.saveToSessionStorage(REFS_STATE_CACHE_NS, {});
  }

}
