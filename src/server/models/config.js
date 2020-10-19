const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

module.exports = function(crowi) {

  const configSchema = new mongoose.Schema({
    ns: { type: String, required: true },
    key: { type: String, required: true },
    value: { type: String, required: true },
  });
  // define unique compound index
  configSchema.index({ ns: 1, key: 1 }, { unique: true });
  configSchema.plugin(uniqueValidator);

  /**
   * default values when GROWI is cleanly installed
   */
  function getConfigsForInstalling() {
    // eslint-disable-next-line no-use-before-define
    const config = getDefaultCrowiConfigs();

    // overwrite
    config['app:installed'] = true;
    config['app:fileUpload'] = true;
    config['customize:layout'] = 'growi';
    config['customize:isSavedStatesOfTabChanges'] = false;

    return config;
  }

  /**
   * default values when migrated from Official Crowi
   */
  function getDefaultCrowiConfigs() {
    /* eslint-disable key-spacing */
    return {
      'app:installed'     : false,
      'app:confidential'  : undefined,

      'app:fileUpload'    : false,
      'app:globalLang'    : 'en_US',

      'security:restrictGuestMode'      : 'Deny',

      'security:registrationMode'      : 'Open',
      'security:registrationWhiteList' : [],

      'security:list-policy:hideRestrictedByOwner' : false,
      'security:list-policy:hideRestrictedByGroup' : false,
      'security:pageCompleteDeletionAuthority' : undefined,

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
      'customize:theme' : 'default',
      'customize:layout' : 'growi',
      'customize:isEnabledTimeline' : true,
      'customize:isSavedStatesOfTabChanges' : true,
      'customize:isEnabledAttachTitleHeader' : false,
      'customize:showPageLimitationS' : 20,
      'customize:showPageLimitationM' : 10,
      'customize:showPageLimitationL' : 50,
      'customize:showPageLimitationXL' : 20,
      'customize:isEnabledStaleNotification': false,
      'customize:isAllReplyShown': false,

      'notification:owner-page:isEnabled': false,
      'notification:group-page:isEnabled': false,

      'importer:esa:team_name': undefined,
      'importer:esa:access_token': undefined,
      'importer:qiita:team_name': undefined,
      'importer:qiita:access_token': undefined,
    };
    /* eslint-enable key-spacing */
  }

  function getDefaultMarkdownConfigs() {
    return {
      'markdown:xss:isEnabledPrevention': true,
      'markdown:xss:option': 2,
      'markdown:xss:tagWhiteList': [],
      'markdown:xss:attrWhiteList': [],
      'markdown:isEnabledLinebreaks': false,
      'markdown:isEnabledLinebreaksInComments': true,
      'markdown:presentation:pageBreakSeparator': 1,
      'markdown:presentation:pageBreakCustomSeparator': undefined,
    };
  }

  function getDefaultNotificationConfigs() {
    return {
      'slack:isIncomingWebhookPrioritized': false,
      'slack:incomingWebhookUrl': undefined,
      'slack:token': undefined,
    };
  }

  /**
   * It is deprecated to use this for anything other than AppService#isDBInitialized.
   */
  configSchema.statics.getConfigsObjectForInstalling = function() {
    return getConfigsForInstalling();
  };

  /**
   * It is deprecated to use this for anything other than ConfigLoader#load.
   */
  configSchema.statics.getDefaultCrowiConfigsObject = function() {
    return getDefaultCrowiConfigs();
  };

  /**
   * It is deprecated to use this for anything other than ConfigLoader#load.
   */
  configSchema.statics.getDefaultMarkdownConfigsObject = function() {
    return getDefaultMarkdownConfigs();
  };

  /**
   * It is deprecated to use this for anything other than ConfigLoader#load.
   */
  configSchema.statics.getDefaultNotificationConfigsObject = function() {
    return getDefaultNotificationConfigs();
  };

  configSchema.statics.getLocalconfig = function() {
    const env = process.env;

    const localConfig = {
      crowi: {
        title: crowi.appService.getAppTitle(),
        url: crowi.appService.getSiteUrl(),
        confidential: crowi.appService.getAppConfidential(),
      },
      upload: {
        image: crowi.fileUploadService.getIsUploadable(),
        file: crowi.fileUploadService.getFileUploadEnabled(),
      },
      registrationWhiteList: crowi.configManager.getConfig('crowi', 'security:registrationWhiteList'),
      layoutType: crowi.configManager.getConfig('crowi', 'customize:layout'),
      themeType: crowi.configManager.getConfig('crowi', 'customize:theme'),
      isEnabledLinebreaks: crowi.configManager.getConfig('markdown', 'markdown:isEnabledLinebreaks'),
      isEnabledLinebreaksInComments: crowi.configManager.getConfig('markdown', 'markdown:isEnabledLinebreaksInComments'),
      pageBreakSeparator: crowi.configManager.getConfig('markdown', 'markdown:presentation:pageBreakSeparator'),
      pageBreakCustomSeparator: crowi.configManager.getConfig('markdown', 'markdown:presentation:pageBreakCustomSeparator'),
      isEnabledXssPrevention: crowi.configManager.getConfig('markdown', 'markdown:xss:isEnabledPrevention'),
      isEnabledTimeline: crowi.configManager.getConfig('crowi', 'customize:isEnabledTimeline'),
      isAllReplyShown: crowi.configManager.getConfig('crowi', 'customize:isAllReplyShown'),
      xssOption: crowi.configManager.getConfig('markdown', 'markdown:xss:option'),
      tagWhiteList: crowi.xssService.getTagWhiteList(),
      attrWhiteList: crowi.xssService.getAttrWhiteList(),
      highlightJsStyle: crowi.configManager.getConfig('crowi', 'customize:highlightJsStyle'),
      highlightJsStyleBorder: crowi.configManager.getConfig('crowi', 'customize:highlightJsStyleBorder'),
      customizeTitle: crowi.configManager.getConfig('crowi', 'customize:title'),
      customizeHeader: crowi.configManager.getConfig('crowi', 'customize:header'),
      customizeCss: crowi.configManager.getConfig('crowi', 'customize:css'),
      isSavedStatesOfTabChanges: crowi.configManager.getConfig('crowi', 'customize:isSavedStatesOfTabChanges'),
      isEnabledAttachTitleHeader: crowi.configManager.getConfig('crowi', 'customize:isEnabledAttachTitleHeader'),
      customizeScript: crowi.configManager.getConfig('crowi', 'customize:script'),
      hasSlackConfig: crowi.slackNotificationService.hasSlackConfig(),
      env: {
        PLANTUML_URI: env.PLANTUML_URI || null,
        BLOCKDIAG_URI: env.BLOCKDIAG_URI || null,
        DRAWIO_URI: env.DRAWIO_URI || null,
        HACKMD_URI: env.HACKMD_URI || null,
        MATHJAX: env.MATHJAX || null,
        NO_CDN: env.NO_CDN || null,
      },
      isEnabledStaleNotification: crowi.configManager.getConfig('crowi', 'customize:isEnabledStaleNotification'),
      isAclEnabled: crowi.aclService.isAclEnabled(),
      isSearchServiceConfigured: crowi.searchService.isConfigured,
      isSearchServiceReachable: crowi.searchService.isReachable,
      globalLang: crowi.configManager.getConfig('crowi', 'app:globalLang'),
    };

    return localConfig;
  };

  const Config = mongoose.model('Config', configSchema);

  return Config;
};
