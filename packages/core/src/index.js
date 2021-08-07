import * as _pathUtils from './utils/path-utils';

// export utils
export const pathUtils = _pathUtils;


module.exports = {
  BasicInterceptor: require('./utils/basic-interceptor'),
  envUtils: require('./utils/env-utils'),
  // plugin
  customTagUtils: require('./plugin/util/custom-tag-utils'),
  TagCacheManager: require('./plugin/service/tag-cache-manager'),
  // service
  LocalStorageManager: require('./service/localstorage-manager'),
};
