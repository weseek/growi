import { Types, Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

import { GrowiThemes } from '~/interfaces/theme';

import { getOrCreateModel } from '../util/mongoose-utils';


export interface Config {
  _id: Types.ObjectId;
  ns: string;
  key: string;
  value: string;
}

/*
 * define methods type
 */
interface ModelMethods { any }


const schema = new Schema<Config>({
  ns: { type: String, required: true },
  key: { type: String, required: true },
  value: { type: String, required: true },
});
// define unique compound index
schema.index({ ns: 1, key: 1 }, { unique: true });
schema.plugin(uniqueValidator);

/**
 * default values when GROWI is cleanly installed
 */
export const generateConfigsForInstalling = (): { [key: string]: any } => {
  // eslint-disable-next-line no-use-before-define
  const config = defaultCrowiConfigs;

  // overwrite
  config['app:installed'] = true;
  config['app:fileUpload'] = true;
  config['app:isV5Compatible'] = true;

  return config;
};

/**
 * default values when migrated from Official Crowi
 */
export const defaultCrowiConfigs: { [key: string]: any } = {
  /* eslint-disable key-spacing */
  'app:installed'     : false,
  'app:confidential'  : undefined,

  'app:fileUpload'    : false,
  'app:globalLang'    : 'en_US',

  'security:restrictGuestMode'      : 'Deny',

  'security:registrationMode'      : 'Open',
  'security:registrationWhiteList' : [],

  'security:list-policy:hideRestrictedByOwner' : false,
  'security:list-policy:hideRestrictedByGroup' : false,
  // DEPRECATED: 'security:pageCompleteDeletionAuthority' : undefined,
  'security:pageDeletionAuthority' : undefined,
  'security:pageCompleteDeletionAuthority' : undefined,
  'security:pageRecursiveDeletionAuthority' : undefined,
  'security:pageRecursiveCompleteDeletionAuthority' : undefined,
  'security:disableLinkSharing' : false,

  'security:passport-local:isEnabled' : true,
  'security:passport-ldap:isEnabled' : false,
  'security:passport-ldap:serverUrl' : undefined,
  'security:passport-ldap:isUserBind' : undefined,
  'security:passport-ldap:bindDN' : undefined,
  'security:passport-ldap:bindDNPassword' : undefined,
  'security:passport-ldap:searchFilter' : undefined,
  'security:passport-ldap:attrMapUsername' : undefined,
  'security:passport-ldap:attrMapName' : undefined,
  'security:passport-ldap:attrMapMail' : undefined,
  'security:passport-ldap:groupSearchBase' : undefined,
  'security:passport-ldap:groupSearchFilter' : undefined,
  'security:passport-ldap:groupDnProperty' : undefined,
  'security:passport-ldap:isSameUsernameTreatedAsIdenticalUser': false,
  'security:passport-saml:isEnabled' : false,
  'security:passport-saml:isSameEmailTreatedAsIdenticalUser': false,

  'security:passport-google:isEnabled' : false,
  'security:passport-google:clientId': undefined,
  'security:passport-google:clientSecret': undefined,
  'security:passport-google:isSameUsernameTreatedAsIdenticalUser': false,

  'security:passport-github:isEnabled' : false,
  'security:passport-github:clientId': undefined,
  'security:passport-github:clientSecret': undefined,
  'security:passport-github:isSameUsernameTreatedAsIdenticalUser': false,

  'security:passport-twitter:isEnabled' : false,
  'security:passport-twitter:consumerKey': undefined,
  'security:passport-twitter:consumerSecret': undefined,
  'security:passport-twitter:isSameUsernameTreatedAsIdenticalUser': false,

  'security:passport-oidc:isEnabled' : false,

  'security:passport-basic:isEnabled' : false,
  'security:passport-basic:isSameUsernameTreatedAsIdenticalUser': false,

  'aws:s3Bucket'          : 'growi',
  'aws:s3Region'          : 'ap-northeast-1',
  'aws:s3AccessKeyId'     : undefined,
  'aws:s3SecretAccessKey' : undefined,
  'aws:s3CustomEndpoint'  : undefined,

  'mail:from'         : undefined,
  'mail:smtpHost'     : undefined,
  'mail:smtpPort'     : undefined,
  'mail:smtpUser'     : undefined,
  'mail:smtpPassword' : undefined,

  'plugin:isEnabledPlugins' : true,

  'customize:css' : undefined,
  'customize:script' : undefined,
  'customize:header' : undefined,
  'customize:title' : undefined,
  'customize:highlightJsStyle' : 'github',
  'customize:highlightJsStyleBorder' : false,
  'customize:theme' : GrowiThemes.DEFAULT,
  'customize:isContainerFluid' : false,
  'customize:isEnabledTimeline' : true,
  'customize:isEnabledAttachTitleHeader' : false,
  'customize:showPageLimitationS' : 20,
  'customize:showPageLimitationM' : 10,
  'customize:showPageLimitationL' : 50,
  'customize:showPageLimitationXL' : 20,
  'customize:isEnabledStaleNotification': false,
  'customize:isAllReplyShown': false,
  'customize:isSearchScopeChildrenAsDefault': false,
  'customize:isSidebarDrawerMode': false,
  'customize:isSidebarClosedAtDockMode': false,

  'notification:owner-page:isEnabled': false,
  'notification:group-page:isEnabled': false,

  'importer:esa:team_name': undefined,
  'importer:esa:access_token': undefined,
  'importer:qiita:team_name': undefined,
  'importer:qiita:access_token': undefined,
  /* eslint-enable key-spacing */
};

export const defaultMarkdownConfigs: { [key: string]: any } = {
  'markdown:xss:isEnabledPrevention': true,
  'markdown:xss:option': 2,
  'markdown:xss:tagWhiteList': [],
  'markdown:xss:attrWhiteList': [],
  'markdown:isEnabledLinebreaks': false,
  'markdown:isEnabledLinebreaksInComments': true,
  'markdown:adminPreferredIndentSize': 4,
  'markdown:isIndentSizeForced': false,
  'markdown:presentation:pageBreakSeparator': 1,
  'markdown:presentation:pageBreakCustomSeparator': undefined,
};

export const defaultNotificationConfigs: { [key: string]: any } = {
  'slack:isIncomingWebhookPrioritized': false,
  'slack:incomingWebhookUrl': undefined,
  'slack:token': undefined,
};

/**
 * It is deprecated to use this for anything other than ConfigLoader#load.
 */
// configSchema.statics.getDefaultCrowiConfigsObject = function() {
//   return getDefaultCrowiConfigs();
// };

/**
 * It is deprecated to use this for anything other than ConfigLoader#load.
 */
// configSchema.statics.getDefaultMarkdownConfigsObject = function() {
//   return getDefaultMarkdownConfigs();
// };

/**
 * It is deprecated to use this for anything other than ConfigLoader#load.
 */
// configSchema.statics.getDefaultNotificationConfigsObject = function() {
//   return getDefaultNotificationConfigs();
// };

schema.statics.getLocalconfig = function(crowi) {
  const env = process.env;

  const isDefaultLogo = crowi.configManager.getConfig('crowi', 'customize:isDefaultLogo');

  const localConfig = {
    crowi: {
      title: crowi.appService.getAppTitle(),
      url: crowi.appService.getSiteUrl(),
      confidential: crowi.appService.getAppConfidential(),
      version: crowi.version,
    },
    upload: {
      image: crowi.fileUploadService.getIsUploadable(),
      file: crowi.fileUploadService.getFileUploadEnabled(),
    },
    registrationWhiteList: crowi.configManager.getConfig('crowi', 'security:registrationWhiteList'),
    disableLinkSharing: crowi.configManager.getConfig('crowi', 'security:disableLinkSharing'),
    themeType: crowi.configManager.getConfig('crowi', 'customize:theme'),
    isEnabledLinebreaks: crowi.configManager.getConfig('markdown', 'markdown:isEnabledLinebreaks'),
    isEnabledLinebreaksInComments: crowi.configManager.getConfig('markdown', 'markdown:isEnabledLinebreaksInComments'),
    adminPreferredIndentSize: crowi.configManager.getConfig('markdown', 'markdown:adminPreferredIndentSize'),
    isIndentSizeForced: crowi.configManager.getConfig('markdown', 'markdown:isIndentSizeForced'),
    pageBreakSeparator: crowi.configManager.getConfig('markdown', 'markdown:presentation:pageBreakSeparator'),
    pageBreakCustomSeparator: crowi.configManager.getConfig('markdown', 'markdown:presentation:pageBreakCustomSeparator'),
    isEnabledXssPrevention: crowi.configManager.getConfig('markdown', 'markdown:xss:isEnabledPrevention'),
    isEnabledTimeline: crowi.configManager.getConfig('crowi', 'customize:isEnabledTimeline'),
    isAllReplyShown: crowi.configManager.getConfig('crowi', 'customize:isAllReplyShown'),
    isSearchScopeChildrenAsDefault: crowi.configManager.getConfig('crowi', 'customize:isSearchScopeChildrenAsDefault'),
    xssOption: crowi.configManager.getConfig('markdown', 'markdown:xss:option'),
    tagWhiteList: crowi.xssService.getTagWhiteList(),
    attrWhiteList: crowi.xssService.getAttrWhiteList(),
    highlightJsStyle: crowi.configManager.getConfig('crowi', 'customize:highlightJsStyle'),
    highlightJsStyleBorder: crowi.configManager.getConfig('crowi', 'customize:highlightJsStyleBorder'),
    customizeTitle: crowi.configManager.getConfig('crowi', 'customize:title'),
    customizeHeader: crowi.configManager.getConfig('crowi', 'customize:header'),
    customizeCss: crowi.configManager.getConfig('crowi', 'customize:css'),
    isEnabledAttachTitleHeader: crowi.configManager.getConfig('crowi', 'customize:isEnabledAttachTitleHeader'),
    customizeScript: crowi.configManager.getConfig('crowi', 'customize:script'),
    isSlackConfigured: crowi.slackIntegrationService.isSlackConfigured,
    env: {
      PLANTUML_URI: env.PLANTUML_URI || null,
      BLOCKDIAG_URI: env.BLOCKDIAG_URI || null,
      DRAWIO_URI: env.DRAWIO_URI || null,
      HACKMD_URI: env.HACKMD_URI || null,
      MATHJAX: env.MATHJAX || null,
      NO_CDN: env.NO_CDN || null,
      GROWI_CLOUD_URI: env.GROWI_CLOUD_URI || null,
      GROWI_APP_ID_FOR_GROWI_CLOUD: env.GROWI_APP_ID_FOR_GROWI_CLOUD || null,
    },
    isEnabledStaleNotification: crowi.configManager.getConfig('crowi', 'customize:isEnabledStaleNotification'),
    isAclEnabled: crowi.aclService.isAclEnabled(),
    isSearchServiceConfigured: crowi.searchService.isConfigured,
    isSearchServiceReachable: crowi.searchService.isReachable,
    isMailerSetup: crowi.mailService.isMailerSetup,
    globalLang: crowi.configManager.getConfig('crowi', 'app:globalLang'),
    pageLimitationL: crowi.configManager.getConfig('crowi', 'customize:showPageLimitationL'),
    pageLimitationXL: crowi.configManager.getConfig('crowi', 'customize:showPageLimitationXL'),
    customizedLogoSrc: isDefaultLogo != null && !isDefaultLogo
      ? crowi.configManager.getConfig('crowi', 'customize:customizedLogoSrc')
      : null,
    auditLogEnabled: crowi.configManager.getConfig('crowi', 'app:auditLogEnabled'),
    activityExpirationSeconds: crowi.configManager.getConfig('crowi', 'app:activityExpirationSeconds'),
    auditLogAvailableActions: crowi.activityService.getAvailableActions(false),
    isSidebarDrawerMode: crowi.configManager.getConfig('crowi', 'customize:isSidebarDrawerMode'),
    isSidebarClosedAtDockMode: crowi.configManager.getConfig('crowi', 'customize:isSidebarClosedAtDockMode'),
  };

  return localConfig;
};

export default getOrCreateModel<Config, ModelMethods>('Config', schema);
