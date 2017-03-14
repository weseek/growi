export class LsxCacheHelper {

  static retrieveFromSessionStorage() {
    return JSON.parse(sessionStorage.getItem('lsx-cache')) || {};
  }

  static saveToSessionStorage(cacheObj) {
    sessionStorage.setItem('lsx-cache', JSON.stringify(cacheObj));
  }

  static generateCacheKeyFromContext(lsxContext) {
    return `${lsxContext.fromPagePath}__${lsxContext.lsxArgs}`;
  }

  static getStateCache(key) {
    let cacheObj = LsxCacheHelper.retrieveFromSessionStorage();
    return cacheObj[key];
  }

  static cacheState(key, lsxState) {
    let cacheObj = LsxCacheHelper.retrieveFromSessionStorage();
    cacheObj[key] = lsxState;

    LsxCacheHelper.saveToSessionStorage(cacheObj);
  }
}
