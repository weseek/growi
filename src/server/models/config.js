// disable no-return-await for model functions
/* eslint-disable no-return-await */

/* eslint-disable no-use-before-define */

module.exports = function(crowi) {
  const mongoose = require('mongoose');

  const configSchema = new mongoose.Schema({
    ns: { type: String, required: true, index: true },
    key: { type: String, required: true, index: true },
    value: { type: String, required: true },
  });

  /**
   * default values when GROWI is cleanly installed
   */
  function getConfigsForInstalling() {
    const config = getDefaultCrowiConfigs();

    // overwrite
    config['app:installed'] = true;
    config['app:fileUpload'] = true;
    config['customize:behavior'] = 'growi';
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
      'app:globalLang'    : 'en-US',

      'security:disableGuestModeOption' : false,
      'security:restrictGuestMode'      : 'Deny',

      'security:registrationMode'      : 'Open',
      'security:registrationWhiteList' : [],

      'security:list-policy:hideRestrictedByOwner' : false,
      'security:list-policy:hideRestrictedByGroup' : false,
      'security:pageCompleteDeletionAuthority' : undefined,

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
      'security:passport-github:isEnabled' : false,
      'security:passport-twitter:isEnabled' : false,
      'security:passport-oidc:isEnabled' : false,
      'security:passport-basic:isEnabled' : false,

      'aws:bucket'          : 'growi',
      'aws:region'          : 'ap-northeast-1',
      'aws:accessKeyId'     : undefined,
      'aws:secretAccessKey' : undefined,

      'mail:from'         : undefined,
      'mail:smtpHost'     : undefined,
      'mail:smtpPort'     : undefined,
      'mail:smtpUser'     : undefined,
      'mail:smtpPassword' : undefined,

      'google:clientId'     : undefined,
      'google:clientSecret' : undefined,

      'plugin:isEnabledPlugins' : true,

      'customize:css' : undefined,
      'customize:script' : undefined,
      'customize:header' : undefined,
      'customize:title' : undefined,
      'customize:highlightJsStyle' : 'github',
      'customize:highlightJsStyleBorder' : false,
      'customize:theme' : 'default',
      'customize:behavior' : 'crowi',
      'customize:layout' : 'crowi',
      'customize:isEnabledTimeline' : true,
      'customize:isSavedStatesOfTabChanges' : true,
      'customize:isEnabledAttachTitleHeader' : false,
      'customize:showRecentCreatedNumber' : 10,

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
      },
      upload: {
        image: crowi.fileUploadService.getIsUploadable(),
        file: crowi.fileUploadService.getFileUploadEnabled(),
      },
      behaviorType: crowi.configManager.getConfig('crowi', 'customize:behavior'),
      layoutType: crowi.configManager.getConfig('crowi', 'customize:layout'),
      isEnabledLinebreaks: crowi.configManager.getConfig('markdown', 'markdown:isEnabledLinebreaks'),
      isEnabledLinebreaksInComments: crowi.configManager.getConfig('markdown', 'markdown:isEnabledLinebreaksInComments'),
      isEnabledXssPrevention: crowi.configManager.getConfig('markdown', 'markdown:xss:isEnabledPrevention'),
      xssOption: crowi.configManager.getConfig('markdown', 'markdown:xss:option'),
      tagWhiteList: crowi.xssService.getTagWhiteList(),
      attrWhiteList: crowi.xssService.getAttrWhiteList(),
      highlightJsStyleBorder: crowi.configManager.getConfig('crowi', 'customize:highlightJsStyleBorder'),
      isSavedStatesOfTabChanges: crowi.configManager.getConfig('crowi', 'customize:isSavedStatesOfTabChanges'),
      hasSlackConfig: crowi.slackNotificationService.hasSlackConfig(),
      env: {
        PLANTUML_URI: env.PLANTUML_URI || null,
        BLOCKDIAG_URI: env.BLOCKDIAG_URI || null,
        HACKMD_URI: env.HACKMD_URI || null,
        MATHJAX: env.MATHJAX || null,
        NO_CDN: env.NO_CDN || null,
      },
      recentCreatedLimit: crowi.configManager.getConfig('crowi', 'customize:showRecentCreatedNumber'),
      isAclEnabled: !crowi.aclService.getIsPublicWikiOnly(),
      globalLang: crowi.configManager.getConfig('crowi', 'app:globalLang'),
    };

    return localConfig;
  };

  const Config = mongoose.model('Config', configSchema);

  return Config;
};
