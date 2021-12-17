let _instance = null;
export class LocalStorageManager {

  static getInstance() {
    if (_instance == null) {
      _instance = new LocalStorageManager();
    }

    return _instance;
  }

  /**
   * retrieve and return parsed JSON object
   * @param {string} namespace
   * @param {string} key
   * @returns {object}
   */
  retrieveFromSessionStorage(namespace, key) {
    const item = JSON.parse(sessionStorage.getItem(namespace)) || {};
    if (key != null) {
      return item[key];
    }
    return item;
  }

  /**
   * save JavaScript object as stringified JSON object
   *
   * @param {string} namespace
   * @param {string | object} cacheObjOrKey cache object or key (if third param is undefined)
   * @param {object} cacheObj
   */
  saveToSessionStorage(namespace, cacheObjOrKey, cacheObj) {
    let item = JSON.parse(sessionStorage.getItem(namespace)) || {};
    if (cacheObj !== undefined) {
      const key = cacheObjOrKey;
      item[key] = cacheObj;
    }
    else {
      item = cacheObjOrKey;
    }
    sessionStorage.setItem(namespace, JSON.stringify(item));
  }

  /**
   * clear all state caches
   *
   * @param {string} namespace
   */
  clearAllStateCaches(namespace) {
    sessionStorage.removeItem(namespace);
  }

}
