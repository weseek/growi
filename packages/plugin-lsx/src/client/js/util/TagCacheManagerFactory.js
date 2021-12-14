import { TagCacheManager } from 'growi-commons';

const LSX_STATE_CACHE_NS = 'lsx-state-cache';


// validate growi-commons version
function validateGrowiCommonsVersion() {
  // TagCacheManager was created on growi-commons@4.0.7
  if (TagCacheManager == null) {
    throw new Error(
      'This version of \'growi-plugin-lsx\' requires \'growi-commons >= 4.0.7\'.\n'
      + 'To resolve this, please process  either a) or b).\n'
      + '\n'
      + 'a) Use \'growi-plugin-lsx@3.0.0\'\n'
      + 'b) Edit \'package.json\' of growi and upgrade \'growi-commons\' to v4.0.7 or above.',
    );
  }
}


let _instance;
export class TagCacheManagerFactory {

  static getInstance() {
    validateGrowiCommonsVersion();

    if (_instance == null) {
      // create generateCacheKey implementation
      const generateCacheKey = (lsxContext) => {
        return `${lsxContext.fromPagePath}__${lsxContext.args}`;
      };

      _instance = new TagCacheManager(LSX_STATE_CACHE_NS, generateCacheKey);
    }

    return _instance;
  }

}
