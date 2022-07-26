import * as _customTagUtils from './plugin/util/custom-tag-utils';
import * as _envUtils from './utils/env-utils';

// export utils by *.js
export const envUtils = _envUtils;
export const customTagUtils = _customTagUtils;

// export utils with namespace
export * as templateChecker from './utils/template-checker';
export * as pagePathUtils from './utils/page-path-utils';
export * as pathUtils from './utils/path-utils';
export * as pageUtils from './utils/page-utils';

// export all
export * from './interfaces/attachment';
export * from './interfaces/common';
export * from './interfaces/has-object-id';
export * from './interfaces/lang';
export * from './interfaces/page';
export * from './interfaces/revision';
export * from './interfaces/subscription';
export * from './interfaces/tag';
export * from './interfaces/user';
export * from './plugin/interfaces/plugin-definition-v4';
export * from './plugin/service/tag-cache-manager';
export * from './models/devided-page-path';
export * from './service/localstorage-manager';
export * from './utils/basic-interceptor';
export * from './utils/browser-utils';
export * from './utils/with-utils';
