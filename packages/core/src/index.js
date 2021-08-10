import * as _pathUtils from './utils/path-utils';
import * as _pagePathUtils from './utils/page-path-utils';
import * as _templateChecker from './utils/template-checker';

// module.exports = {
//   BasicInterceptor: require('./utils/basic-interceptor'),
//   envUtils: require('./utils/env-utils'),
//   // plugin
//   customTagUtils: require('./plugin/util/custom-tag-utils'),
//   TagCacheManager: require('./plugin/service/tag-cache-manager'),
//   // service
//   LocalStorageManager: require('./service/localstorage-manager'),
// };

export * from './plugin/interfaces/plugin-definition-v4';
export * from './models/devided-page-path';

// export utils
export const pathUtils = _pathUtils;
export const pagePathUtils = _pagePathUtils;
export const templateChecker = _templateChecker;
