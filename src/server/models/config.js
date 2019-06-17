// disable no-return-await for model functions
/* eslint-disable no-return-await */

/* eslint-disable no-use-before-define */

module.exports = function(crowi) {
  const mongoose = require('mongoose');
  const debug = require('debug')('growi:models:config');
  const recommendedWhitelist = require('@commons/service/xss/recommended-whitelist');

  const SECURITY_RESTRICT_GUEST_MODE_DENY = 'Deny';
  const SECURITY_RESTRICT_GUEST_MODE_READONLY = 'Readonly';
  const SECURITY_REGISTRATION_MODE_OPEN = 'Open';
  const SECURITY_REGISTRATION_MODE_RESTRICTED = 'Resricted';
  const SECURITY_REGISTRATION_MODE_CLOSED = 'Closed';

  let Config;

  const configSchema = new mongoose.Schema({
    ns: { type: String, required: true, index: true },
    key: { type: String, required: true, index: true },
    value: { type: String, required: true },
  });

  function validateCrowi() {
    if (crowi == null) {
      throw new Error('"crowi" is null. Init Config model with "crowi" argument first.');
    }
  }

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

      'security:restrictGuestMode'      : 'Deny',

      'security:registrationMode'      : 'Open',
      'security:registrationWhiteList' : [],

      'security:list-policy:hideRestrictedByOwner' : false,
      'security:list-policy:hideRestrictedByGroup' : false,

      'security:isEnabledPassport' : true,
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

  function getValueForCrowiNS(config, key) {
    crowi.configManager.getConfig('crowi', key);
    // // return the default value if undefined
    // if (undefined === config.crowi || undefined === config.crowi[key]) {
    //   return getDefaultCrowiConfigs()[key];
    // }

    // return config.crowi[key];
  }

  function getValueForMarkdownNS(config, key) {
    crowi.configManager.getConfig('markdown', key);
    // // return the default value if undefined
    // if (undefined === config.markdown || undefined === config.markdown[key]) {
    //   return getDefaultMarkdownConfigs()[key];
    // }

    // return config.markdown[key];
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

  configSchema.statics.getRestrictGuestModeLabels = function() {
    const labels = {};
    labels[SECURITY_RESTRICT_GUEST_MODE_DENY] = 'security_setting.guest_mode.deny';
    labels[SECURITY_RESTRICT_GUEST_MODE_READONLY] = 'security_setting.guest_mode.readonly';

    return labels;
  };

  configSchema.statics.getRegistrationModeLabels = function() {
    const labels = {};
    labels[SECURITY_REGISTRATION_MODE_OPEN] = 'security_setting.registration_mode.open';
    labels[SECURITY_REGISTRATION_MODE_RESTRICTED] = 'security_setting.registration_mode.restricted';
    labels[SECURITY_REGISTRATION_MODE_CLOSED] = 'security_setting.registration_mode.closed';

    return labels;
  };

  configSchema.statics.updateConfigCache = function(ns, config) {
    validateCrowi();

    // const originalConfig = crowi.getConfig();
    // const newNSConfig = originalConfig[ns] || {};
    // Object.keys(config).forEach((key) => {
    //   if (config[key] || config[key] === '' || config[key] === false) {
    //     newNSConfig[key] = config[key];
    //   }
    // });

    // originalConfig[ns] = newNSConfig;
    // crowi.setConfig(originalConfig);

    // // initialize custom css/script
    // Config.initCustomCss(originalConfig);
    // Config.initCustomScript(originalConfig);
  };

  // Execute only once for installing application
  // configSchema.statics.applicationInstall = function(callback) {
  //   const Config = this;
  //   Config.count({ ns: 'crowi' }, (err, count) => {
  //     if (count > 0) {
  //       return callback(new Error('Application already installed'), null);
  //     }
  //     Config.updateNamespaceByArray('crowi', getArrayForInstalling(), (err, configs) => {
  //       Config.updateConfigCache('crowi', configs);
  //       return callback(err, configs);
  //     });
  //   });
  // };

  configSchema.statics.updateNamespaceByArray = function(ns, configs, callback) {
    const Config = this;
    if (configs.length < 0) {
      return callback(new Error('Argument #1 is not array.'), null);
    }

    Object.keys(configs).forEach((key) => {
      const value = configs[key];

      Config.findOneAndUpdate(
        { ns, key },
        { ns, key, value: JSON.stringify(value) },
        { upsert: true },
        (err, config) => {
          debug('Config.findAndUpdate', err, config);
        },
      );
    });

    return callback(null, configs);
  };

  configSchema.statics.findOneAndUpdateByNsAndKey = async function(ns, key, value) {
    return this.findOneAndUpdate(
      { ns, key },
      { ns, key, value: JSON.stringify(value) },
      { upsert: true },
    );
  };

  configSchema.statics.getConfig = function(callback) {
  };

  // configSchema.statics.loadAllConfig = function(callback) {
  //   const Config = this;


  //   const config = {};
  //   config.crowi = {}; // crowi namespace

  //   Config.find()
  //     .sort({ ns: 1, key: 1 })
  //     .exec((err, doc) => {
  //       doc.forEach((el) => {
  //         if (!config[el.ns]) {
  //           config[el.ns] = {};
  //         }
  //         config[el.ns][el.key] = JSON.parse(el.value);
  //       });

  //       debug('Config loaded', config);

  //       // initialize custom css/script
  //       Config.initCustomCss(config);
  //       Config.initCustomScript(config);

  //       return callback(null, config);
  //     });
  // };

  configSchema.statics.isGuestAllowedToRead = function(config) {
    // return true if puclic wiki mode
    if (crowi.aclService.getIsPublicWikiOnly()) {
      return true;
    }

    const restrictGuestMode = crowi.configManager.getConfig('crowi', 'security:restrictGuestMode');
    // return false if undefined
    if (undefined === config.crowi || undefined === restrictGuestMode) {
      return false;
    }

    return SECURITY_RESTRICT_GUEST_MODE_READONLY === restrictGuestMode;
  };

  configSchema.statics.isEnabledLinebreaks = function(config) {
    const key = 'markdown:isEnabledLinebreaks';
    return getValueForMarkdownNS(config, key);
  };

  configSchema.statics.isEnabledLinebreaksInComments = function(config) {
    const key = 'markdown:isEnabledLinebreaksInComments';
    return getValueForMarkdownNS(config, key);
  };
  configSchema.statics.isPublicWikiOnly = function(config) {
    const publicWikiOnly = process.env.PUBLIC_WIKI_ONLY;
    if (publicWikiOnly === 'true' || publicWikiOnly === 1) {
      return true;
    }
    return false;
  };

  configSchema.statics.pageBreakSeparator = function(config) {
    const key = 'markdown:presentation:pageBreakSeparator';
    return getValueForMarkdownNS(config, key);
  };

  configSchema.statics.pageBreakCustomSeparator = function(config) {
    const key = 'markdown:presentation:pageBreakCustomSeparator';
    return getValueForMarkdownNS(config, key);
  };

  configSchema.statics.isEnabledXssPrevention = function(config) {
    const key = 'markdown:xss:isEnabledPrevention';
    return getValueForMarkdownNS(config, key);
  };

  configSchema.statics.xssOption = function(config) {
    const key = 'markdown:xss:option';
    return getValueForMarkdownNS(config, key);
  };

  configSchema.statics.tagWhiteList = function(config) {
    const key = 'markdown:xss:tagWhiteList';

    if (this.isEnabledXssPrevention(config)) {
      switch (this.xssOption(config)) {
        case 1: // ignore all: use default option
          return [];

        case 2: // recommended
          return recommendedWhitelist.tags;

        case 3: // custom white list
          return config.markdown[key];

        default:
          return [];
      }
    }
    else {
      return [];
    }
  };

  configSchema.statics.attrWhiteList = function(config) {
    const key = 'markdown:xss:attrWhiteList';

    if (this.isEnabledXssPrevention(config)) {
      switch (this.xssOption(config)) {
        case 1: // ignore all: use default option
          return [];

        case 2: // recommended
          return recommendedWhitelist.attrs;

        case 3: // custom white list
          return config.markdown[key];

        default:
          return [];
      }
    }
    else {
      return [];
    }
  };

  configSchema.statics.hasSlackConfig = function(config) {
    return Config.hasSlackToken(config) || Config.hasSlackIwhUrl(config);
  };

  /**
   * for Slack Incoming Webhooks
   */
  configSchema.statics.hasSlackIwhUrl = function(config) {
    if (!config.notification) {
      return false;
    }
    return (!!config.notification['slack:incomingWebhookUrl']);
  };

  configSchema.statics.isIncomingWebhookPrioritized = function(config) {
    if (!config.notification) {
      return false;
    }
    return (!!config.notification['slack:isIncomingWebhookPrioritized']);
  };

  configSchema.statics.hasSlackToken = function(config) {
    if (!config.notification) {
      return false;
    }

    return (!!config.notification['slack:token']);
  };

  configSchema.statics.getLocalconfig = function() { // CONF.RF: これも別のメソッドにする
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
      hasSlackConfig: crowi.configManager.getConfig('crowi', 'customize:behavior'),
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

  configSchema.statics.userUpperLimit = function(crowi) {
    const key = 'USER_UPPER_LIMIT';
    const env = crowi.env[key];

    if (undefined === crowi.env || undefined === crowi.env[key]) {
      return 0;
    }
    return Number(env);
  };

  /*
  configSchema.statics.isInstalled = function(config)
  {
    if (!config.crowi) {
      return false;
    }

    if (config.crowi['app:installed']
       && config.crowi['app:installed'] !== '0.0.0') {
      return true;
    }

    return false;
  }
  */

  Config = mongoose.model('Config', configSchema);
  Config.SECURITY_REGISTRATION_MODE_OPEN = SECURITY_REGISTRATION_MODE_OPEN;
  Config.SECURITY_REGISTRATION_MODE_RESTRICTED = SECURITY_REGISTRATION_MODE_RESTRICTED;
  Config.SECURITY_REGISTRATION_MODE_CLOSED = SECURITY_REGISTRATION_MODE_CLOSED;


  return Config;
};
