import { TagCacheManager } from '@growi/core';

const STATE_CACHE_NS = 'refs-state-cache';

let _instance;
export default class TagCacheManagerFactory {

  static getInstance() {
    if (_instance == null) {
      // create generateCacheKey implementation
      const generateCacheKey = (refsContext) => {
        return `${refsContext.method}__${refsContext.fromPagePath}__${refsContext.args}`;
      };

      _instance = new TagCacheManager(STATE_CACHE_NS, generateCacheKey);
    }

    return _instance;
  }

}
