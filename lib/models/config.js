module.exports = function(crowi) {
  var mongoose = require('mongoose')
    , debug = require('debug')('crowi:models:config')
    , ObjectId = mongoose.Schema.Types.ObjectId
    , configSchema
    , Config

    , SECURITY_REGISTRATION_MODE_OPEN = 'Open'
    , SECURITY_REGISTRATION_MODE_RESTRICTED = 'Resricted'
    , SECURITY_REGISTRATION_MODE_CLOSED = 'Closed'
  ;

  configSchema = new mongoose.Schema({
    ns: { type: String, required: true, index: true },
    key: { type: String, required: true, index: true },
    value: { type: String, required: true }
  });

  function getArrayForInstalling()
  {
    return {
      //'app:installed'     : "0.0.0",
      'app:title'         : 'Crowi',
      'app:confidential'  : '',

      'app:fileUpload'    : false,

      'security:registrationMode'      : 'Open',
      'security:registrationWhiteList' : [],

      'aws:bucket'          : 'crowi',
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

    };
  }

  configSchema.statics.getRegistrationModeLabels = function()
  {
    var labels = {};
    labels[SECURITY_REGISTRATION_MODE_OPEN]       = '公開 (だれでも登録可能)';
    labels[SECURITY_REGISTRATION_MODE_RESTRICTED] = '制限 (登録完了には管理者の承認が必要)';
    labels[SECURITY_REGISTRATION_MODE_CLOSED]     = '非公開 (登録には管理者による招待が必要)';

    return labels;
  };

  configSchema.statics.updateConfigCache = function(ns, config)
  {
    var originalConfig = crowi.getConfig();
    var newNSConfig = originalConfig[ns] || {};
    Object.keys(config).forEach(function (key) {
      if (config[key] || config[key] === '') {
        newNSConfig[key] = config[key];
      }
    });

    originalConfig[ns] = newNSConfig;
    crowi.setConfig(originalConfig);
  };

  // Execute only once for installing application
  configSchema.statics.applicationInstall = function(callback)
  {
    var Config = this;
    Config.count({ ns: 'crowi' }, function (err, count) {
      if (count > 0) {
        return callback(new Error('Application already installed'), null);
      }
      Config.updateNamespaceByArray('crowi', getArrayForInstalling(), function(err, configs) {

        Config.updateConfigCache('crowi', configs);
        return callback(err, configs);
      });
    });
  };

  configSchema.statics.setupCofigFormData = function(ns, config)
  {
    var defaultConfig = {};
    if (ns === 'crowi') {
      defaultConfig  = getArrayForInstalling();
    }
    if (!defaultConfig[ns]) {
      defaultConfig[ns] = {};
    }
    Object.keys(config[ns] || {}).forEach(function (key) {
      if (config[ns][key]) {
        defaultConfig[key] = config[ns][key];
      }

    });
    return defaultConfig;
  };


  configSchema.statics.updateNamespaceByArray = function(ns, configs, callback)
  {
    var Config = this;
    if (configs.length < 0) {
      return callback(new Error('Argument #1 is not array.'), null);
    }

    Object.keys(configs).forEach(function (key) {
      var value = configs[key];

      Config.findOneAndUpdate(
        { ns: ns, key: key },
        { ns: ns, key: key, value: JSON.stringify(value) },
        { upsert: true, },
        function (err, config) {
          debug('Config.findAndUpdate', err, config);
      });
    });

    return callback(null, configs);
  };

  configSchema.statics.findAndUpdate = function(ns, key, value, callback)
  {
    var Config = this;
    Config.findOneAndUpdate(
      { ns: ns, key: key },
      { ns: ns, key: key, value: JSON.stringify(value) },
      { upsert: true, },
      function (err, config) {
        debug('Config.findAndUpdate', err, config);
        callback(err, config);
    });
  };

  configSchema.statics.getConfig = function(callback)
  {
  };

  configSchema.statics.loadAllConfig = function(callback)
  {
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
        return callback(null, config);
      });
  };

  configSchema.statics.isUploadable = function(config)
  {
    var method = crowi.env.FILE_UPLOAD || 'aws';

    if (method == 'aws' && (
        !config.crowi['aws:accessKeyId'] ||
        !config.crowi['aws:secretAccessKey'] ||
        !config.crowi['aws:region'] ||
        !config.crowi['aws:bucket'])) {
      return false;
    }

    return method != 'none';
  };

  configSchema.statics.fileUploadEnabled = function(config)
  {
    const Config = this;

    if (!Config.isUploadable(config)) {
      return false;
    }

    return config.crowi['app:fileUpload'] || false;
  };

  configSchema.statics.hasSlackConfig = function(config)
  {
    if (!config.notification) {
      return false;
    }
    if (!config.notification['slack:clientId'] ||
        !config.notification['slack:clientSecret']) {
      return false;
    }

    return true;
  };

  configSchema.statics.hasSlackToken = function(config)
  {
    if (!this.hasSlackConfig(config)) {
      return false;
    }

    if (!config.notification['slack:token']) {
      return false;
    }

    return true;
  };

  configSchema.statics.getLocalconfig = function(config)
  {
    const Config = this;

    const local_config = {
      crowi: {
        title: config.crowi['app:title'],
        url: config.crowi['app:url'] || '',
      },
      upload: {
        image: Config.isUploadable(config),
        file: Config.fileUploadEnabled(config),
      },
    };

    return local_config;
  }

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
