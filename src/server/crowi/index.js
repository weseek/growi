const debug = require('debug')('growi:crowi');
const logger = require('@alias/logger')('growi:crowi');
const pkg = require('@root/package.json');
const InterceptorManager = require('@commons/service/interceptor-manager');
const CdnResourcesService = require('@commons/service/cdn-resources-service');
const Xss = require('@commons/service/xss');
const { getMongoUri, mongoOptions } = require('@commons/util/mongoose-utils');

const path = require('path');

const mongoose = require('mongoose');

const models = require('../models');

const PluginService = require('../plugins/plugin.service');

const sep = path.sep;

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

  this.express = null;

  this.config = {};
  this.configManager = null;
  this.s2sMessagingService = null;
  this.mailService = null;
  this.passportService = null;
  this.globalNotificationService = null;
  this.slackNotificationService = null;
  this.xssService = null;
  this.aclService = null;
  this.appService = null;
  this.fileUploadService = null;
  this.restQiitaAPIService = null;
  this.growiBridgeService = null;
  this.exportService = null;
  this.importService = null;
  this.searchService = null;
  this.socketIoService = null;
  this.pageService = null;
  this.syncPageStatusService = null;
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
    bookmark: new (require(`${self.eventsDir}bookmark`))(this),
    tag: new (require(`${self.eventsDir}tag`))(this),
    admin: new (require(`${self.eventsDir}admin`))(this),
  };
}

Crowi.prototype.init = async function() {
  await this.setupDatabase();
  await this.setupModels();
  await this.setupSessionConfig();
  await this.setupConfigManager();

  // setup messaging services
  await this.setupS2sMessagingService();
  await this.setupSocketIoService();

  // customizeService depends on AppService and XssService
  // passportService depends on appService
  // slack depends on setUpSlacklNotification
  // export and import depends on setUpGrowiBridge
  await Promise.all([
    this.setUpApp(),
    this.setUpXss(),
    this.setUpSlacklNotification(),
    this.setUpGrowiBridge(),
  ]);

  await Promise.all([
    this.scanRuntimeVersions(),
    this.setupPassport(),
    this.setupSearcher(),
    this.setupMailer(),
    this.setupSlack(),
    this.setupCsrf(),
    this.setUpFileUpload(),
    this.setUpFileUploaderSwitchService(),
    this.setupAttachmentService(),
    this.setUpAcl(),
    this.setUpCustomize(),
    this.setUpRestQiitaAPI(),
    this.setupUserGroup(),
    this.setupExport(),
    this.setupImport(),
    this.setupPageService(),
    this.setupSyncPageStatusService(),
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
    // this.setUpGrowiBridge(),
  ]);

  await Promise.all([
    // this.scanRuntimeVersions(),
    this.setupPassport(),
    // this.setupSearcher(),
    // this.setupMailer(),
    // this.setupSlack(),
    // this.setupCsrf(),
    // this.setUpFileUpload(),
    // this.setupAttachmentService(),
    this.setUpAcl(),
    // this.setUpCustomize(),
    // this.setUpRestQiitaAPI(),
    // this.setupUserGroup(),
    // this.setupExport(),
    // this.setupImport(),
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
  mongoose.Promise = global.Promise;

  // mongoUri = mongodb://user:password@host/dbname
  const mongoUri = getMongoUri();

  return mongoose.connect(mongoUri, mongoOptions);
};

Crowi.prototype.setupSessionConfig = async function() {
  const session = require('express-session');
  const sessionAge = (1000 * 3600 * 24 * 30);
  const redisUrl = this.env.REDISTOGO_URL || this.env.REDIS_URI || this.env.REDIS_URL || null;
  const uid = require('uid-safe').sync;

  // generate pre-defined uid for healthcheck
  const healthcheckUid = uid(24);

  const sessionConfig = {
    rolling: true,
    secret: this.env.SECRET_TOKEN || 'this is default session secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: sessionAge,
    },
    genid(req) {
      // return pre-defined uid when healthcheck
      if (req.path === '/_api/v3/healthcheck') {
        return healthcheckUid;
      }
      return uid(24);
    },
  };

  if (this.env.SESSION_NAME) {
    sessionConfig.name = this.env.SESSION_NAME;
  }

  // use Redis for session store
  if (redisUrl) {
    const redis = require('redis');
    const redisClient = redis.createClient({ url: redisUrl });
    const RedisStore = require('connect-redis')(session);
    sessionConfig.store = new RedisStore({ client: redisClient });
  }
  // use MongoDB for session store
  else {
    const MongoStore = require('connect-mongo')(session);
    sessionConfig.store = new MongoStore({ mongooseConnection: mongoose.connection });
  }

  this.sessionConfig = sessionConfig;
};

Crowi.prototype.setupConfigManager = async function() {
  const ConfigManager = require('../service/config-manager');
  this.configManager = new ConfigManager(this.model('Config'));
  return this.configManager.loadConfigs();
};

Crowi.prototype.setupS2sMessagingService = async function() {
  const s2sMessagingService = require('../service/s2s-messaging')(this);
  if (s2sMessagingService != null) {
    s2sMessagingService.subscribe();
    this.configManager.setS2sMessagingService(s2sMessagingService);
    // add as a message handler
    s2sMessagingService.addMessageHandler(this.configManager);

    this.s2sMessagingService = s2sMessagingService;
  }
};

Crowi.prototype.setupSocketIoService = async function() {
  const SocketIoService = require('../service/socket-io');
  if (this.socketIoService == null) {
    this.socketIoService = new SocketIoService(this);
  }
};

Crowi.prototype.setupModels = async function() {
  Object.keys(models).forEach((key) => {
    return this.model(key, models[key](this));
  });
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
    this.passportService.setupStrategyById('local');
    this.passportService.setupStrategyById('ldap');
    this.passportService.setupStrategyById('saml');
    this.passportService.setupStrategyById('oidc');
    this.passportService.setupStrategyById('basic');
    this.passportService.setupStrategyById('google');
    this.passportService.setupStrategyById('github');
    this.passportService.setupStrategyById('twitter');
  }
  catch (err) {
    logger.error(err);
  }

  // add as a message handler
  if (this.s2sMessagingService != null) {
    this.s2sMessagingService.addMessageHandler(this.passportService);
  }

  return Promise.resolve();
};

Crowi.prototype.setupSearcher = async function() {
  const SearchService = require('@server/service/search');
  this.searchService = new SearchService(this);
};

Crowi.prototype.setupMailer = async function() {
  const MailService = require('@server/service/mail');
  this.mailService = new MailService(this);

  // add as a message handler
  if (this.s2sMessagingService != null) {
    this.s2sMessagingService.addMessageHandler(this.mailService);
  }
};

Crowi.prototype.setupSlack = async function() {
  const self = this;

  return new Promise(((resolve, reject) => {
    self.slack = require('../util/slack')(self);
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
  await this.buildServer();

  const { express } = this;

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

  this.socketIoService.attachServer(serverListening);

  // setup Express Routes
  this.setupRoutesAtLast();

  return serverListening;
};

Crowi.prototype.buildServer = async function() {
  const env = this.node_env;
  const express = require('express')();

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

  this.express = express;
};

/**
 * setup Express Routes
 * !! this must be at last because it includes '/*' route !!
 */
Crowi.prototype.setupRoutesAtLast = function() {
  require('../routes')(this, this.express);
};

Crowi.prototype.setupAfterInstall = function() {
  this.pluginService.autoDetectAndLoadPlugins();
  this.setupRoutesAtLast();
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
    this.customizeService = new CustomizeService(this);
    this.customizeService.initCustomCss();
    this.customizeService.initCustomTitle();

    // add as a message handler
    if (this.s2sMessagingService != null) {
      this.s2sMessagingService.addMessageHandler(this.customizeService);
    }
  }
};

/**
 * setup AppService
 */
Crowi.prototype.setUpApp = async function() {
  const AppService = require('../service/app');
  if (this.appService == null) {
    this.appService = new AppService(this);

    // add as a message handler
    const isInstalled = this.configManager.getConfig('crowi', 'app:installed');
    if (this.s2sMessagingService != null && !isInstalled) {
      this.s2sMessagingService.addMessageHandler(this.appService);
    }
  }
};

/**
 * setup FileUploadService
 */
Crowi.prototype.setUpFileUpload = async function(isForceUpdate = false) {
  if (this.fileUploadService == null || isForceUpdate) {
    this.fileUploadService = require('../service/file-uploader')(this);
  }
};

/**
 * setup FileUploaderSwitchService
 */
Crowi.prototype.setUpFileUploaderSwitchService = async function() {
  const FileUploaderSwitchService = require('../service/file-uploader-switch');
  this.fileUploaderSwitchService = new FileUploaderSwitchService(this);
  // add as a message handler
  if (this.s2sMessagingService != null) {
    this.s2sMessagingService.addMessageHandler(this.fileUploaderSwitchService);
  }
};

/**
 * setup AttachmentService
 */
Crowi.prototype.setupAttachmentService = async function() {
  const AttachmentService = require('../service/attachment');
  if (this.attachmentService == null) {
    this.attachmentService = new AttachmentService(this);
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

Crowi.prototype.setUpGrowiBridge = async function() {
  const GrowiBridgeService = require('../service/growi-bridge');
  if (this.growiBridgeService == null) {
    this.growiBridgeService = new GrowiBridgeService(this);
  }
};

Crowi.prototype.setupExport = async function() {
  const ExportService = require('../service/export');
  if (this.exportService == null) {
    this.exportService = new ExportService(this);
  }
};

Crowi.prototype.setupImport = async function() {
  const ImportService = require('../service/import');
  if (this.importService == null) {
    this.importService = new ImportService(this);
  }
};

Crowi.prototype.setupPageService = async function() {
  const PageEventService = require('../service/page');
  if (this.pageService == null) {
    this.pageService = new PageEventService(this);
  }
};

Crowi.prototype.setupSyncPageStatusService = async function() {
  const SyncPageStatusService = require('../service/system-events/sync-page-status');
  if (this.syncPageStatusService == null) {
    this.syncPageStatusService = new SyncPageStatusService(this, this.s2sMessagingService, this.socketIoService);

    // add as a message handler
    if (this.s2sMessagingService != null) {
      this.s2sMessagingService.addMessageHandler(this.syncPageStatusService);
    }
  }
};

module.exports = Crowi;
