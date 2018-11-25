module.exports = function(crowi) {
  const mongoose = require('mongoose')
    , debug = require('debug')('growi:models:config')
    , uglifycss = require('uglifycss')
    , recommendedXssWhiteList = require('@commons/service/xss/recommendedXssWhiteList')

    , SECURITY_RESTRICT_GUEST_MODE_DENY = 'Deny'
    , SECURITY_RESTRICT_GUEST_MODE_READONLY = 'Readonly'

    , SECURITY_REGISTRATION_MODE_OPEN = 'Open'
    , SECURITY_REGISTRATION_MODE_RESTRICTED = 'Resricted'
    , SECURITY_REGISTRATION_MODE_CLOSED = 'Closed'
  ;

  let configSchema;
  let Config;

  configSchema = new mongoose.Schema({
    ns: { type: String, required: true, index: true },
    key: { type: String, required: true, index: true },
    value: { type: String, required: true }
  });

  function validateCrowi() {
    if (crowi == null) {
      throw new Error('"crowi" is null. Init Config model with "crowi" argument first.');
    }
  }

  /**
   * default values when GROWI is cleanly installed
   */
  function getArrayForInstalling() {
    let config = getDefaultCrowiConfigs();

    // overwrite
    config['app:fileUpload'] = true;
    config['security:isEnabledPassport'] = true;
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
      //'app:installed'     : "0.0.0",
      'app:confidential'  : '',

      'app:fileUpload'    : false,
      'app:globalLang'    : 'en',

      'security:restrictGuestMode'      : 'Deny',

      'security:registrationMode'      : 'Open',
      'security:registrationWhiteList' : [],

      'security:isEnabledPassport' : false,
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

      'aws:bucket'          : 'growi',
      'aws:region'          : 'ap-northeast-1',
      'aws:accessKeyId'     : '',
      'aws:secretAccessKey' : '',

      'mail:from'         : '',
      'mail:smtpHost'     : '',
      'mail:smtpPort'     : '',
      'mail:smtpUser'     : '',
      'mail:smtpPassword' : '',

      'google:clientId'     : '',
      'google:clientSecret' : '',

      'plugin:isEnabledPlugins' : true,

      'customize:css' : '',
      'customize:script' : '',
      'customize:header' : '',
      'customize:title' : '',
      'customize:highlightJsStyle' : 'github',
      'customize:highlightJsStyleBorder' : false,
      'customize:theme' : 'default',
      'customize:behavior' : 'crowi',
      'customize:layout' : 'crowi',
      'customize:isEnabledTimeline' : true,
      'customize:isSavedStatesOfTabChanges' : true,
      'customize:isEnabledAttachTitleHeader' : false,
      'customize:showRecentCreatedNumber' : 10,

      'importer:esa:team_name': '',
      'importer:esa:access_token': '',
      'importer:qiita:team_name': '',
      'importer:qiita:access_token': '',
    };
    /* eslint-enable */
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
      'markdown:presentation:pageBreakCustomSeparator': '',
    };
  }

  function getValueForCrowiNS(config, key) {
    // return the default value if undefined
    if (undefined === config.crowi || undefined === config.crowi[key]) {
      return getDefaultCrowiConfigs()[key];
    }

    return config.crowi[key];
  }

  function getValueForMarkdownNS(config, key) {
    // return the default value if undefined
    if (undefined === config.markdown || undefined === config.markdown[key]) {
      return getDefaultMarkdownConfigs()[key];
    }

    return config.markdown[key];
  }

  configSchema.statics.getRestrictGuestModeLabels = function() {
    var labels = {};
    labels[SECURITY_RESTRICT_GUEST_MODE_DENY]     = 'security_setting.guest_mode.deny';
    labels[SECURITY_RESTRICT_GUEST_MODE_READONLY] = 'security_setting.guest_mode.readonly';

    return labels;
  };

  configSchema.statics.getRegistrationModeLabels = function() {
    var labels = {};
    labels[SECURITY_REGISTRATION_MODE_OPEN]       = 'security_setting.registration_mode.open';
    labels[SECURITY_REGISTRATION_MODE_RESTRICTED] = 'security_setting.registration_mode.restricted';
    labels[SECURITY_REGISTRATION_MODE_CLOSED]     = 'security_setting.registration_mode.closed';

    return labels;
  };

  configSchema.statics.updateConfigCache = function(ns, config) {
    validateCrowi();

    const originalConfig = crowi.getConfig();
    const newNSConfig = originalConfig[ns] || {};
    Object.keys(config).forEach(function(key) {
      if (config[key] || config[key] === '' || config[key] === false) {
        newNSConfig[key] = config[key];
      }
    });

    originalConfig[ns] = newNSConfig;
    crowi.setConfig(originalConfig);

    // initialize custom css/script
    Config.initCustomCss(originalConfig);
    Config.initCustomScript(originalConfig);
  };

  // Execute only once for installing application
  configSchema.statics.applicationInstall = function(callback) {
    var Config = this;
    Config.count({ ns: 'crowi' }, function(err, count) {
      if (count > 0) {
        return callback(new Error('Application already installed'), null);
      }
      Config.updateNamespaceByArray('crowi', getArrayForInstalling(), function(err, configs) {

        Config.updateConfigCache('crowi', configs);
        return callback(err, configs);
      });
    });
  };

  configSchema.statics.setupConfigFormData = function(ns, config) {
    var defaultConfig = {};

    // set Default Settings
    if (ns === 'crowi') {
      defaultConfig = getDefaultCrowiConfigs();
    }
    else if (ns === 'markdown') {
      defaultConfig = getDefaultMarkdownConfigs();
    }

    if (!defaultConfig[ns]) {
      defaultConfig[ns] = {};
    }
    Object.keys(config[ns] || {}).forEach(function(key) {
      if (config[ns][key] !== undefined) {
        defaultConfig[key] = config[ns][key];
      }
    });
    return defaultConfig;
  };


  configSchema.statics.updateNamespaceByArray = function(ns, configs, callback) {
    var Config = this;
    if (configs.length < 0) {
      return callback(new Error('Argument #1 is not array.'), null);
    }

    Object.keys(configs).forEach(function(key) {
      var value = configs[key];

      Config.findOneAndUpdate(
        { ns: ns, key: key },
        { ns: ns, key: key, value: JSON.stringify(value) },
        { upsert: true, },
        function(err, config) {
          debug('Config.findAndUpdate', err, config);
        });
    });

    return callback(null, configs);
  };

  configSchema.statics.findOneAndUpdateByNsAndKey = async function(ns, key, value) {
    return this.findOneAndUpdate(
      { ns: ns, key: key },
      { ns: ns, key: key, value: JSON.stringify(value) },
      { upsert: true, });
  };

  configSchema.statics.getConfig = function(callback) {
  };

  configSchema.statics.loadAllConfig = function(callback) {
    var Config = this
      , config = {};
    config.crowi = {}; // crowi namespace

    Config.find()
      .sort({ns: 1, key: 1})
      .exec(function(err, doc) {

        doc.forEach(function(el) {
          if (!config[el.ns]) {
            config[el.ns] = {};
          }
          config[el.ns][el.key] = JSON.parse(el.value);
        });

        debug('Config loaded', config);

        // initialize custom css/script
        Config.initCustomCss(config);
        Config.initCustomScript(config);

        return callback(null, config);
      });
  };

  configSchema.statics.appTitle = function(config) {
    const key = 'app:title';
    return getValueForCrowiNS(config, key) || 'GROWI';
  };

  configSchema.statics.globalLang = function(config) {
    const key = 'app:globalLang';
    return getValueForCrowiNS(config, key);
  };

  configSchema.statics.isEnabledPassport = function(config) {
    // always true if growi installed cleanly
    if (Object.keys(config.crowi).length == 0) {
      return true;
    }

    const key = 'security:isEnabledPassport';
    return getValueForCrowiNS(config, key);
  };

  configSchema.statics.isEnabledPassportLdap = function(config) {
    const key = 'security:passport-ldap:isEnabled';
    return getValueForCrowiNS(config, key);
  };

  configSchema.statics.isEnabledPassportSaml = function(config) {
    const key = 'security:passport-saml:isEnabled';
    return getValueForCrowiNS(config, key);
  };

  configSchema.statics.isEnabledPassportGoogle = function(config) {
    const key = 'security:passport-google:isEnabled';
    return getValueForCrowiNS(config, key);
  };

  configSchema.statics.isEnabledPassportGitHub = function(config) {
    const key = 'security:passport-github:isEnabled';
    return getValueForCrowiNS(config, key);
  };

  configSchema.statics.isEnabledPassportTwitter = function(config) {
    const key = 'security:passport-twitter:isEnabled';
    return getValueForCrowiNS(config, key);
  };

  configSchema.statics.isSameUsernameTreatedAsIdenticalUser = function(config, providerType) {
    const key = `security:passport-${providerType}:isSameUsernameTreatedAsIdenticalUser`;
    return getValueForCrowiNS(config, key);
  };

  configSchema.statics.isSameEmailTreatedAsIdenticalUser = function(config, providerType) {
    const key = `security:passport-${providerType}:isSameEmailTreatedAsIdenticalUser`;
    return getValueForCrowiNS(config, key);
  };

  configSchema.statics.isUploadable = function(config) {
    const method = process.env.FILE_UPLOAD || 'aws';

    if (method == 'aws' && (
      !config.crowi['aws:accessKeyId'] ||
        !config.crowi['aws:secretAccessKey'] ||
        !config.crowi['aws:region'] ||
        !config.crowi['aws:bucket'])) {
      return false;
    }

    return method != 'none';
  };

  configSchema.statics.isGuesstAllowedToRead = function(config) {
    // return true if puclic wiki mode
    if (Config.isPublicWikiOnly(config)) {
      return true;
    }

    // return false if undefined
    if (undefined === config.crowi || undefined === config.crowi['security:restrictGuestMode']) {
      return false;
    }

    return SECURITY_RESTRICT_GUEST_MODE_READONLY === config.crowi['security:restrictGuestMode'];
  };

  configSchema.statics.isEnabledPlugins = function(config) {
    const key = 'plugin:isEnabledPlugins';
    return getValueForCrowiNS(config, key);
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
    if ( publicWikiOnly === 'true' || publicWikiOnly == 1) {
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
          return recommendedXssWhiteList.tags;

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
          return recommendedXssWhiteList.attrs;

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

  /**
   * initialize custom css strings
   */
  configSchema.statics.initCustomCss = function(config) {
    const key = 'customize:css';
    const rawCss = getValueForCrowiNS(config, key);
    // uglify and store
    this._customCss = uglifycss.processString(rawCss);
  };

  configSchema.statics.customCss = function(config) {
    return this._customCss;
  };

  configSchema.statics.initCustomScript = function(config) {
    const key = 'customize:script';
    const rawScript = getValueForCrowiNS(config, key);
    // store as is
    this._customScript = rawScript;
  };

  configSchema.statics.customScript = function(config) {
    return this._customScript;
  };

  configSchema.statics.customHeader = function(config) {
    const key = 'customize:header';
    return getValueForCrowiNS(config, key);
  };

  configSchema.statics.theme = function(config) {
    const key = 'customize:theme';
    return getValueForCrowiNS(config, key);
  };

  configSchema.statics.customTitle = function(config, page) {
    validateCrowi();

    const key = 'customize:title';
    let customTitle = getValueForCrowiNS(config, key);

    if (customTitle == null || customTitle.trim().length == 0) {
      customTitle = '{{page}} - {{sitename}}';
    }

    // replace
    customTitle = customTitle
      .replace('{{sitename}}', this.appTitle(config))
      .replace('{{page}}', page);

    return crowi.xss.process(customTitle);
  };

  configSchema.statics.behaviorType = function(config) {
    const key = 'customize:behavior';
    return getValueForCrowiNS(config, key);
  };

  configSchema.statics.layoutType = function(config) {
    const key = 'customize:layout';
    return getValueForCrowiNS(config, key);
  };

  configSchema.statics.highlightJsStyle = function(config) {
    const key = 'customize:highlightJsStyle';
    return getValueForCrowiNS(config, key);
  };

  configSchema.statics.highlightJsStyleBorder = function(config) {
    const key = 'customize:highlightJsStyleBorder';
    return getValueForCrowiNS(config, key);
  };

  configSchema.statics.isEnabledTimeline = function(config) {
    const key = 'customize:isEnabledTimeline';
    return getValueForCrowiNS(config, key);
  };

  configSchema.statics.isSavedStatesOfTabChanges = function(config) {
    const key = 'customize:isSavedStatesOfTabChanges';
    return getValueForCrowiNS(config, key);
  };

  configSchema.statics.isEnabledAttachTitleHeader = function(config) {
    const key = 'customize:isEnabledAttachTitleHeader';
    return getValueForCrowiNS(config, key);
  };

  configSchema.statics.showRecentCreatedNumber = function(config) {
    const key = 'customize:showRecentCreatedNumber';
    return getValueForCrowiNS(config, key);
  };

  configSchema.statics.fileUploadEnabled = function(config) {
    const Config = this;

    if (!Config.isUploadable(config)) {
      return false;
    }

    // convert to boolean
    return !!config.crowi['app:fileUpload'];
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
    return (config.notification['slack:incomingWebhookUrl'] ? true : false);
  };

  configSchema.statics.isIncomingWebhookPrioritized = function(config) {
    if (!config.notification) {
      return false;
    }
    return (config.notification['slack:isIncomingWebhookPrioritized'] ? true : false);
  };

  configSchema.statics.hasSlackToken = function(config) {
    if (!config.notification) {
      return false;
    }

    return (config.notification['slack:token'] ? true : false);
  };

  configSchema.statics.getLocalconfig = function(config) {
    const Config = this;
    const env = process.env;

    const local_config = {
      crowi: {
        title: Config.appTitle(crowi),
        url: config.crowi['app:siteUrl:fixed'] || '',
      },
      upload: {
        image: Config.isUploadable(config),
        file: Config.fileUploadEnabled(config),
      },
      behaviorType: Config.behaviorType(config),
      layoutType: Config.layoutType(config),
      isEnabledLinebreaks: Config.isEnabledLinebreaks(config),
      isEnabledLinebreaksInComments: Config.isEnabledLinebreaksInComments(config),
      isEnabledXssPrevention: Config.isEnabledXssPrevention(config),
      xssOption: Config.xssOption(config),
      tagWhiteList: Config.tagWhiteList(config),
      attrWhiteList: Config.attrWhiteList(config),
      highlightJsStyleBorder: Config.highlightJsStyleBorder(config),
      isSavedStatesOfTabChanges: Config.isSavedStatesOfTabChanges(config),
      hasSlackConfig: Config.hasSlackConfig(config),
      env: {
        PLANTUML_URI: env.PLANTUML_URI || null,
        BLOCKDIAG_URI: env.BLOCKDIAG_URI || null,
        HACKMD_URI: env.HACKMD_URI || null,
        MATHJAX: env.MATHJAX || null,
      },
      recentCreatedLimit: Config.showRecentCreatedNumber(config),
      isAclEnabled: !Config.isPublicWikiOnly(config),
      globalLang: Config.globalLang(config),
    };

    return local_config;
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
  Config.SECURITY_REGISTRATION_MODE_OPEN       = SECURITY_REGISTRATION_MODE_OPEN;
  Config.SECURITY_REGISTRATION_MODE_RESTRICTED = SECURITY_REGISTRATION_MODE_RESTRICTED;
  Config.SECURITY_REGISTRATION_MODE_CLOSED     = SECURITY_REGISTRATION_MODE_CLOSED;


  return Config;
};
