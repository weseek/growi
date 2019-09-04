

const debug = require('debug')('growi:crowi');
const logger = require('@alias/logger')('growi:crowi');
const pkg = require('@root/package.json');
const InterceptorManager = require('@commons/service/interceptor-manager');
const CdnResourcesService = require('@commons/service/cdn-resources-service');
const Xss = require('@commons/service/xss');

const path = require('path');

const sep = path.sep;

const mongoose = require('mongoose');

const models = require('../models');

const PluginService = require('../plugins/plugin.service');

function Crowi(rootdir) {
  const self = this;

  this.version = pkg.version;
  this.runtimeVersions = undefined; // initialized by scanRuntimeVersions()

  this.rootDir = rootdir;
  this.pluginDir = path.join(this.rootDir, 'node_modules') + sep;
  this.publicDir = path.join(this.rootDir, 'public') + sep;
  this.libDir = path.join(this.rootDir, 'src/server') + sep;
  this.eventsDir = path.join(this.libDir, 'events') + sep;
  this.viewsDir = path.join(this.libDir, 'views') + sep;
  this.resourceDir = path.join(this.rootDir, 'resource') + sep;
  this.localeDir = path.join(this.resourceDir, 'locales') + sep;
  this.tmpDir = path.join(this.rootDir, 'tmp') + sep;
  this.cacheDir = path.join(this.tmpDir, 'cache');

  this.config = {};
  this.configManager = null;
  this.searcher = null;
  this.mailer = {};
  this.passportService = null;
  this.globalNotificationService = null;
  this.slackNotificationService = null;
  this.xssService = null;
  this.aclService = null;
  this.appService = null;
  this.fileUploadService = null;
  this.restQiitaAPIService = null;
  this.exportService = null;
  this.cdnResourcesService = new CdnResourcesService();
  this.interceptorManager = new InterceptorManager();
  this.xss = new Xss();

  this.tokens = null;

  this.models = {};

  this.env = process.env;
  this.node_env = this.env.NODE_ENV || 'development';

  this.port = this.env.PORT || 3000;

  this.events = {
    user: new (require(`${self.eventsDir}user`))(this),
    page: new (require(`${self.eventsDir}page`))(this),
    search: new (require(`${self.eventsDir}search`))(this),
    bookmark: new (require(`${self.eventsDir}bookmark`))(this),
    tag: new (require(`${self.eventsDir}tag`))(this),
  };
}

function getMongoUrl(env) {
  return env.MONGOLAB_URI // for B.C.
    || env.MONGODB_URI // MONGOLAB changes their env name
    || env.MONGOHQ_URL
    || env.MONGO_URI
    || ((process.env.NODE_ENV === 'test') ? 'mongodb://localhost/growi_test' : 'mongodb://localhost/growi');
}

Crowi.prototype.init = async function() {
  await this.setupDatabase();
  await this.setupModels();
  await this.setupSessionConfig();
  await this.setupConfigManager();

  // customizeService depends on AppService and XssService
  // passportService depends on appService
  // slack depends on setUpSlacklNotification
  await Promise.all([
    this.setUpApp(),
    this.setUpXss(),
    this.setUpSlacklNotification(),
  ]);

  await Promise.all([
    this.scanRuntimeVersions(),
    this.setupPassport(),
    this.setupSearcher(),
    this.setupMailer(),
    this.setupSlack(),
    this.setupCsrf(),
    this.setUpFileUpload(),
    this.setUpAcl(),
    this.setUpCustomize(),
    this.setUpRestQiitaAPI(),
    this.setupUserGroup(),
    this.setupExport(),
  ]);

  // globalNotification depends on slack and mailer
  await Promise.all([
    this.setUpGlobalNotification(),
  ]);
};

Crowi.prototype.initForTest = async function() {
  await this.setupModels();
  await this.setupConfigManager();

  // // customizeService depends on AppService and XssService
  // // passportService depends on appService
  // // slack depends on setUpSlacklNotification
  await Promise.all([
    this.setUpApp(),
    // this.setUpXss(),
    // this.setUpSlacklNotification(),
  ]);

  await Promise.all([
  //   this.scanRuntimeVersions(),
  //   this.setupPassport(),
  //   this.setupSearcher(),
  //   this.setupMailer(),
  //   this.setupSlack(),
  //   this.setupCsrf(),
  //   this.setUpFileUpload(),
    this.setUpAcl(),
  //   this.setUpCustomize(),
  //   this.setUpRestQiitaAPI(),
  ]);

  // globalNotification depends on slack and mailer
  // await Promise.all([
  //   this.setUpGlobalNotification(),
  // ]);
};

Crowi.prototype.isPageId = function(pageId) {
  if (!pageId) {
    return false;
  }

  if (typeof pageId === 'string' && pageId.match(/^[\da-f]{24}$/)) {
    return true;
  }

  return false;
};

Crowi.prototype.setConfig = function(config) {
  this.config = config;
};

Crowi.prototype.getConfig = function() {
  return this.config;
};

Crowi.prototype.getEnv = function() {
  return this.env;
};

// getter/setter of model instance
//
Crowi.prototype.model = function(name, model) {
  if (model != null) {
    this.models[name] = model;
  }

  return this.models[name];
};

// getter/setter of event instance
Crowi.prototype.event = function(name, event) {
  if (event) {
    this.events[name] = event;
  }

  return this.events[name];
};

Crowi.prototype.setupDatabase = function() {
  // mongoUri = mongodb://user:password@host/dbname
  mongoose.Promise = global.Promise;

  const mongoUri = getMongoUrl(this.env);

  return mongoose.connect(mongoUri, { useNewUrlParser: true });
};

Crowi.prototype.setupSessionConfig = function() {
  const self = this;
  const session = require('express-session');
  const sessionAge = (1000 * 3600 * 24 * 30);
  const redisUrl = this.env.REDISTOGO_URL || this.env.REDIS_URI || this.env.REDIS_URL || null;

  const mongoUrl = getMongoUrl(this.env);
  let sessionConfig;

  return new Promise(((resolve, reject) => {
    sessionConfig = {
      rolling: true,
      secret: self.env.SECRET_TOKEN || 'this is default session secret',
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: sessionAge,
      },
    };

    if (self.env.SESSION_NAME) {
      sessionConfig.name = self.env.SESSION_NAME;
    }

    // use Redis for session store
    if (redisUrl) {
      const RedisStore = require('connect-redis')(session);
      sessionConfig.store = new RedisStore({ url: redisUrl });
    }
    // use MongoDB for session store
    else {
      const MongoStore = require('connect-mongo')(session);
      sessionConfig.store = new MongoStore({ url: mongoUrl });
    }

    self.sessionConfig = sessionConfig;
    resolve();
  }));
};

Crowi.prototype.setupConfigManager = async function() {
  const ConfigManager = require('../service/config-manager');
  this.configManager = new ConfigManager(this.model('Config'));
  return this.configManager.loadConfigs();
};

Crowi.prototype.setupModels = async function() {
  Object.keys(models).forEach((key) => {
    return this.model(key, models[key](this));
  });
};

Crowi.prototype.getIo = function() {
  return this.io;
};

Crowi.prototype.scanRuntimeVersions = async function() {
  const self = this;

  const check = require('check-node-version');
  return new Promise((resolve, reject) => {
    check((err, result) => {
      if (err) {
        reject(err);
      }
      self.runtimeVersions = result;
      resolve();
    });
  });
};

Crowi.prototype.getSearcher = function() {
  return this.searcher;
};

Crowi.prototype.getMailer = function() {
  return this.mailer;
};

Crowi.prototype.getSlack = function() {
  return this.slack;
};

Crowi.prototype.getInterceptorManager = function() {
  return this.interceptorManager;
};

Crowi.prototype.getGlobalNotificationService = function() {
  return this.globalNotificationService;
};

Crowi.prototype.getRestQiitaAPIService = function() {
  return this.restQiitaAPIService;
};

Crowi.prototype.setupPassport = async function() {
  debug('Passport is enabled');

  // initialize service
  const PassportService = require('../service/passport');
  if (this.passportService == null) {
    this.passportService = new PassportService(this);
  }
  this.passportService.setupSerializer();
  // setup strategies
  try {
    this.passportService.setupLocalStrategy();
    this.passportService.setupLdapStrategy();
    this.passportService.setupGoogleStrategy();
    this.passportService.setupGitHubStrategy();
    this.passportService.setupTwitterStrategy();
    this.passportService.setupOidcStrategy();
    this.passportService.setupSamlStrategy();
    this.passportService.setupBasicStrategy();
  }
  catch (err) {
    logger.error(err);
  }
  return Promise.resolve();
};

Crowi.prototype.setupSearcher = async function() {
  const self = this;
  const searcherUri = this.env.ELASTICSEARCH_URI
    || this.env.BONSAI_URL
    || null;
  return new Promise(((resolve, reject) => {
    if (searcherUri) {
      try {
        self.searcher = new (require(path.join(self.libDir, 'util', 'search')))(self, searcherUri);
      }
      catch (e) {
        logger.error('Error on setup searcher', e);
        self.searcher = null;
      }
    }
    resolve();
  }));
};

Crowi.prototype.setupMailer = async function() {
  const self = this;
  return new Promise(((resolve, reject) => {
    self.mailer = require('../util/mailer')(self);
    resolve();
  }));
};

Crowi.prototype.setupSlack = async function() {
  const self = this;

  return new Promise(((resolve, reject) => {
    if (this.slackNotificationService.hasSlackConfig()) {
      self.slack = require('../util/slack')(self);
    }

    resolve();
  }));
};

Crowi.prototype.setupCsrf = async function() {
  const Tokens = require('csrf');
  this.tokens = new Tokens();

  return Promise.resolve();
};

Crowi.prototype.getTokens = function() {
  return this.tokens;
};

Crowi.prototype.start = async function() {
  // init CrowiDev
  if (this.node_env === 'development') {
    const CrowiDev = require('./dev');
    this.crowiDev = new CrowiDev(this);
    this.crowiDev.init();
  }

  await this.init();
  const express = await this.buildServer();

  // setup plugins
  this.pluginService = new PluginService(this, express);
  this.pluginService.autoDetectAndLoadPlugins();

  const server = (this.node_env === 'development') ? this.crowiDev.setupServer(express) : express;

  // listen
  const serverListening = server.listen(this.port, () => {
    logger.info(`[${this.node_env}] Express server is listening on port ${this.port}`);
    if (this.node_env === 'development') {
      this.crowiDev.setupExpressAfterListening(express);
    }
  });

  // setup WebSocket
  const io = require('socket.io')(serverListening);
  io.sockets.on('connection', (socket) => {
  });
  this.io = io;

  // setup Express Routes
  this.setupRoutesAtLast(express);

  return serverListening;
};

Crowi.prototype.buildServer = function() {
  const express = require('express')();
  const env = this.node_env;

  require('./express-init')(this, express);

  // use bunyan
  if (env === 'production') {
    const expressBunyanLogger = require('express-bunyan-logger');
    const logger = require('@alias/logger')('express');
    express.use(expressBunyanLogger({
      logger,
      excludes: ['*'],
    }));
  }
  // use morgan
  else {
    const morgan = require('morgan');
    express.use(morgan('dev'));
  }

  return Promise.resolve(express);
};

/**
 * setup Express Routes
 * !! this must be at last because it includes '/*' route !!
 */
Crowi.prototype.setupRoutesAtLast = function(app) {
  require('../routes')(this, app);
};

/**
 * require API for plugins
 *
 * @param {string} modulePath relative path from /lib/crowi/index.js
 * @return {module}
 *
 * @memberof Crowi
 */
Crowi.prototype.require = function(modulePath) {
  return require(modulePath);
};

/**
 * setup GlobalNotificationService
 */
Crowi.prototype.setUpGlobalNotification = async function() {
  const GlobalNotificationService = require('../service/global-notification');
  if (this.globalNotificationService == null) {
    this.globalNotificationService = new GlobalNotificationService(this);
  }
};

/**
 * setup SlackNotificationService
 */
Crowi.prototype.setUpSlacklNotification = async function() {
  const SlackNotificationService = require('../service/slack-notification');
  if (this.slackNotificationService == null) {
    this.slackNotificationService = new SlackNotificationService(this.configManager);
  }
};

/**
 * setup XssService
 */
Crowi.prototype.setUpXss = async function() {
  const XssService = require('../service/xss');
  if (this.xssService == null) {
    this.xssService = new XssService(this.configManager);
  }
};

/**
 * setup AclService
 */
Crowi.prototype.setUpAcl = async function() {
  const AclService = require('../service/acl');
  if (this.aclService == null) {
    this.aclService = new AclService(this.configManager);
  }
};

/**
 * setup CustomizeService
 */
Crowi.prototype.setUpCustomize = async function() {
  const CustomizeService = require('../service/customize');
  if (this.customizeService == null) {
    this.customizeService = new CustomizeService(this.configManager, this.appService, this.xssService);
    this.customizeService.initCustomCss();
    this.customizeService.initCustomTitle();
  }
};

/**
 * setup AppService
 */
Crowi.prototype.setUpApp = async function() {
  const AppService = require('../service/app');
  if (this.appService == null) {
    this.appService = new AppService(this.configManager);
  }
};

/**
 * setup FileUploadService
 */
Crowi.prototype.setUpFileUpload = async function() {
  if (this.fileUploadService == null) {
    this.fileUploadService = require('../service/file-uploader')(this);
  }
};

/**
 * setup RestQiitaAPIService
 */
Crowi.prototype.setUpRestQiitaAPI = async function() {
  const RestQiitaAPIService = require('../service/rest-qiita-API');
  if (this.restQiitaAPIService == null) {
    this.restQiitaAPIService = new RestQiitaAPIService(this);
  }
};

Crowi.prototype.setupUserGroup = async function() {
  const UserGroupService = require('../service/user-group');
  if (this.userGroupService == null) {
    this.userGroupService = new UserGroupService(this);
    return this.userGroupService.init();
  }
};

Crowi.prototype.setupExport = async function() {
  const ExportService = require('../service/export');
  if (this.exportService == null) {
    this.exportService = new ExportService(this);
  }
};

module.exports = Crowi;
