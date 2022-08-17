import { TagCacheManager } from '@growi/core';

import { LsxContext } from './lsx-context';

const LSX_STATE_CACHE_NS = 'lsx-state-cache';


let _instance;

export function getInstance(): TagCacheManager {
  if (_instance == null) {
    // create generateCacheKey implementation
    const generateCacheKey = (lsxContext: LsxContext) => {
      return `${lsxContext.pagePath}__${lsxContext.getStringifiedAttributes('_')}`;
    };

    _instance = new TagCacheManager(LSX_STATE_CACHE_NS, generateCacheKey);
  }

  return _instance;
}
