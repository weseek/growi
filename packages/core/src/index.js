const pathUtils = require('./utils/path-utils');
const pagePathUtils = require('./utils/page-path-utils');
const templateChecker = require('./utils/template-checker');

// module.exports = {
//   BasicInterceptor: require('./utils/basic-interceptor'),
//   envUtils: require('./utils/env-utils'),
//   // plugin
//   customTagUtils: require('./plugin/util/custom-tag-utils'),
//   TagCacheManager: require('./plugin/service/tag-cache-manager'),
//   // service
//   LocalStorageManager: require('./service/localstorage-manager'),
// };

const { PluginMetaV4, PluginDefinitionV4 } = require('./plugin/interfaces/plugin-definition-v4');
const DevidedPagePath = require('./models/devided-page-path');
const {
  initMongooseGlobalSettings, getMongoUri, getModelSafely, getOrCreateModel, mongoOptions,
} = require('./utils/mongoose-utils');


// export utils

module.exports = {
  PluginMetaV4,
  PluginDefinitionV4,
  DevidedPagePath,
  initMongooseGlobalSettings,
  getMongoUri,
  getModelSafely,
  getOrCreateModel,
  mongoOptions,
  pathUtils,
  pagePathUtils,
  templateChecker,
};
