/* eslint-disable @typescript-eslint/no-this-alias */
import http from 'http';
import path from 'path';

import { createTerminus } from '@godaddy/terminus';
import attachmentRoutes from '@growi/remark-attachment-refs/dist/server';
import lsxRoutes from '@growi/remark-lsx/dist/server';
import mongoose from 'mongoose';
import next from 'next';

import pkg from '^/package.json';

import QuestionnaireService from '~/features/questionnaire/server/service/questionnaire';
import QuestionnaireCronService from '~/features/questionnaire/server/service/questionnaire-cron';
import CdnResourcesService from '~/services/cdn-resources-service';
import Xss from '~/services/xss';
import loggerFactory from '~/utils/logger';
import { projectRoot } from '~/utils/project-dir-utils';


import Activity from '../models/activity';
import PageRedirect from '../models/page-redirect';
import Tag from '../models/tag';
import UserGroup from '../models/user-group';
import { aclService as aclServiceSingletonInstance } from '../service/acl';
import AppService from '../service/app';
import AttachmentService from '../service/attachment';
import { configManager as configManagerSingletonInstance } from '../service/config-manager';
import { G2GTransferPusherService, G2GTransferReceiverService } from '../service/g2g-transfer';
import { InstallerService } from '../service/installer';
import PageService from '../service/page';
import PageGrantService from '../service/page-grant';
import PageOperationService from '../service/page-operation';
import SearchService from '../service/search';
import { SlackIntegrationService } from '../service/slack-integration';
import { UserNotificationService } from '../service/user-notification';
import { getMongoUri, mongoOptions } from '../util/mongoose-utils';


const logger = loggerFactory('growi:crowi');
const httpErrorHandler = require('../middlewares/http-error-handler');
const models = require('../models');

const sep = path.sep;

function Crowi() {
  this.version = pkg.version;
  this.runtimeVersions = undefined; // initialized by scanRuntimeVersions()

  this.publicDir = path.join(projectRoot, 'public') + sep;
  this.resourceDir = path.join(projectRoot, 'resource') + sep;
  this.localeDir = path.join(this.resourceDir, 'locales') + sep;
  this.viewsDir = path.resolve(__dirname, '../views') + sep;
  this.tmpDir = path.join(projectRoot, 'tmp') + sep;
  this.cacheDir = path.join(this.tmpDir, 'cache');

  this.express = null;

  this.config = {};
  this.configManager = null;
  this.s2sMessagingService = null;
  this.g2gTransferPusherService = null;
  this.g2gTransferReceiverService = null;
  this.mailService = null;
  this.passportService = null;
  this.globalNotificationService = null;
  this.userNotificationService = null;
  this.xssService = null;
  this.aclService = null;
  this.appService = null;
  this.fileUploadService = null;
  this.restQiitaAPIService = null;
  this.growiBridgeService = null;
  this.exportService = null;
  this.importService = null;
  this.pluginService = null;
  this.searchService = null;
  this.socketIoService = null;
  this.pageService = null;
  this.syncPageStatusService = null;
  this.cdnResourcesService = new CdnResourcesService();
  this.slackIntegrationService = null;
  this.inAppNotificationService = null;
  this.activityService = null;
  this.commentService = null;
  this.xss = new Xss();
  this.questionnaireService = null;
  this.questionnaireCronService = null;

  this.tokens = null;

  this.models = {};

  this.env = process.env;
  this.node_env = this.env.NODE_ENV || 'development';

  this.port = this.env.PORT || 3000;

  this.events = {
    user: new (require('../events/user'))(this),
    page: new (require('../events/page'))(this),
    activity: new (require('../events/activity'))(this),
    bookmark: new (require('../events/bookmark'))(this),
    comment: new (require('../events/comment'))(this),
    tag: new (require('../events/tag'))(this),
    admin: new (require('../events/admin'))(this),
  };
}

Crowi.prototype.init = async function() {
  await this.setupDatabase();
  await this.setupModels();
  await this.setupConfigManager();
  await this.setupSessionConfig();
  this.setupCron();

  // setup messaging services
  await this.setupS2sMessagingService();
  await this.setupSocketIoService();

  // customizeService depends on AppService and XssService
  // passportService depends on appService
  // export and import depends on setUpGrowiBridge
  await Promise.all([
    this.setUpApp(),
    this.setUpXss(),
    this.setUpGrowiBridge(),
  ]);

  await Promise.all([
    this.scanRuntimeVersions(),
    this.setupPassport(),
    this.setupSearcher(),
    this.setupMailer(),
    this.setupSlackIntegrationService(),
    this.setupG2GTransferService(),
    this.setUpFileUpload(),
    this.setUpFileUploaderSwitchService(),
    this.setupAttachmentService(),
    this.setUpAcl(),
    this.setUpRestQiitaAPI(),
    this.setupUserGroupService(),
    this.setupExport(),
    this.setupImport(),
    this.setupGrowiPluginService(),
    this.setupPageService(),
    this.setupInAppNotificationService(),
    this.setupActivityService(),
    this.setupCommentService(),
    this.setupSyncPageStatusService(),
    this.setupQuestionnaireService(),
    this.setUpCustomize(), // depends on pluginService
  ]);

  // globalNotification depends on slack and mailer
  await Promise.all([
    this.setUpGlobalNotification(),
    this.setUpUserNotification(),
  ]);

  await this.autoInstall();
};

/**
 * Execute functions that should be run after the express server is ready.
 */
Crowi.prototype.asyncAfterExpressServerReady = async function() {
  if (this.pageOperationService != null) {
    await this.pageOperationService.afterExpressServerReady();
  }
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
  const sessionMaxAge = this.configManager.getConfig('crowi', 'security:sessionMaxAge') || 2592000000; // default: 30days
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
      maxAge: sessionMaxAge,
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
    const MongoStore = require('connect-mongo');
    sessionConfig.store = MongoStore.create({ client: mongoose.connection.getClient() });
  }

  this.sessionConfig = sessionConfig;
};

Crowi.prototype.setupConfigManager = async function() {
  this.configManager = configManagerSingletonInstance;
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
  let allModels = {};

  // include models that dependent on crowi
  allModels = models;

  // include models that independent from crowi
  allModels.Activity = Activity;
  allModels.Tag = Tag;
  allModels.UserGroup = UserGroup;
  allModels.PageRedirect = PageRedirect;

  Object.keys(allModels).forEach((key) => {
    return this.model(key, models[key](this));
  });

};

Crowi.prototype.setupCron = function() {
  this.questionnaireCronService = new QuestionnaireCronService(this);
  this.questionnaireCronService.startCron();
};

Crowi.prototype.setupQuestionnaireService = function() {
  this.questionnaireService = new QuestionnaireService(this);
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

Crowi.prototype.getSlackLegacy = function() {
  return this.slackLegacy;
};

Crowi.prototype.getGlobalNotificationService = function() {
  return this.globalNotificationService;
};

Crowi.prototype.getUserNotificationService = function() {
  return this.userNotificationService;
};

Crowi.prototype.getRestQiitaAPIService = function() {
  return this.restQiitaAPIService;
};

Crowi.prototype.setupPassport = async function() {
  logger.debug('Passport is enabled');

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
    this.passportService.setupStrategyById('google');
    this.passportService.setupStrategyById('github');
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
  this.searchService = new SearchService(this);
};

Crowi.prototype.setupMailer = async function() {
  const MailService = require('~/server/service/mail');
  this.mailService = new MailService(this);

  // add as a message handler
  if (this.s2sMessagingService != null) {
    this.s2sMessagingService.addMessageHandler(this.mailService);
  }
};

Crowi.prototype.autoInstall = function() {
  const isInstalled = this.configManager.getConfig('crowi', 'app:installed');
  const username = this.configManager.getConfig('crowi', 'autoInstall:adminUsername');

  if (isInstalled || username == null) {
    return;
  }

  logger.info('Start automatic installation');

  const firstAdminUserToSave = {
    username,
    name: this.configManager.getConfig('crowi', 'autoInstall:adminName'),
    email: this.configManager.getConfig('crowi', 'autoInstall:adminEmail'),
    password: this.configManager.getConfig('crowi', 'autoInstall:adminPassword'),
    admin: true,
  };
  const globalLang = this.configManager.getConfig('crowi', 'autoInstall:globalLang');
  const allowGuestMode = this.configManager.getConfig('crowi', 'autoInstall:allowGuestMode');
  const serverDate = this.configManager.getConfig('crowi', 'autoInstall:serverDate');

  const installerService = new InstallerService(this);

  try {
    installerService.install(firstAdminUserToSave, globalLang ?? 'en_US', {
      allowGuestMode,
      serverDate,
    });
  }
  catch (err) {
    logger.warn('Automatic installation failed.', err);
  }
};

Crowi.prototype.getTokens = function() {
  return this.tokens;
};

Crowi.prototype.start = async function() {
  const dev = process.env.NODE_ENV !== 'production';

  await this.init();
  await this.buildServer();

  // setup Next.js
  this.nextApp = next({ dev });
  await this.nextApp.prepare();

  // setup CrowiDev
  if (dev) {
    const CrowiDev = require('./dev');
    this.crowiDev = new CrowiDev(this);
    this.crowiDev.init();
  }

  const { express, configManager } = this;

  const app = (this.node_env === 'development') ? this.crowiDev.setupServer(express) : express;

  const httpServer = http.createServer(app);

  // setup terminus
  this.setupTerminus(httpServer);
  // attach to socket.io
  this.socketIoService.attachServer(httpServer);

  // listen
  const serverListening = httpServer.listen(this.port, () => {
    logger.info(`[${this.node_env}] Express server is listening on port ${this.port}`);
    if (this.node_env === 'development') {
      this.crowiDev.setupExpressAfterListening(express);
    }
  });
  // listen for promster
  if (configManager.getConfig('crowi', 'promster:isEnabled')) {
    const { createServer } = require('@promster/server');
    const promsterPort = configManager.getConfig('crowi', 'promster:port');

    createServer({ port: promsterPort }).then(() => {
      logger.info(`[${this.node_env}] Promster server is listening on port ${promsterPort}`);
    });
  }

  // setup Express Routes
  this.setupRoutesForPlugins();
  this.setupRoutesAtLast();

  // setup Global Error Handlers
  this.setupGlobalErrorHandlers();

  // Execute this asynchronously after the express server is ready so it does not block the ongoing process
  this.asyncAfterExpressServerReady();

  return serverListening;
};

Crowi.prototype.buildServer = async function() {
  const env = this.node_env;
  const express = require('express')();

  require('./express-init')(this, express);

  // use bunyan
  if (env === 'production') {
    const expressBunyanLogger = require('express-bunyan-logger');
    const logger = loggerFactory('express');
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

Crowi.prototype.setupTerminus = function(server) {
  createTerminus(server, {
    signals: ['SIGINT', 'SIGTERM'],
    onSignal: async() => {
      logger.info('Server is starting cleanup');

      await mongoose.disconnect();
      return;
    },
    onShutdown: async() => {
      logger.info('Cleanup finished, server is shutting down');
    },
  });
};

Crowi.prototype.setupRoutesForPlugins = function() {
  lsxRoutes(this, this.express);
  attachmentRoutes(this, this.express);
};

/**
 * setup Express Routes
 * !! this must be at last because it includes '/*' route !!
 */
Crowi.prototype.setupRoutesAtLast = function() {
  require('../routes')(this, this.express);
};

/**
 * setup global error handlers
 * !! this must be after the Routes setup !!
 */
Crowi.prototype.setupGlobalErrorHandlers = function() {
  this.express.use(httpErrorHandler);
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
 * setup UserNotificationService
 */
Crowi.prototype.setUpUserNotification = async function() {
  if (this.userNotificationService == null) {
    this.userNotificationService = new UserNotificationService(this);
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
  this.aclService = aclServiceSingletonInstance;
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
    this.customizeService.initGrowiTheme();

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

Crowi.prototype.setupUserGroupService = async function() {
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

Crowi.prototype.setupGrowiPluginService = async function() {
  const { growiPluginService } = require('~/features/growi-plugin/services');

  // download plugin repositories, if document exists but there is no repository
  // TODO: Cannot download unless connected to the Internet at setup.
  await growiPluginService.downloadNotExistPluginRepositories();
};

Crowi.prototype.setupPageService = async function() {
  if (this.pageService == null) {
    this.pageService = new PageService(this);
  }
  if (this.pageGrantService == null) {
    this.pageGrantService = new PageGrantService(this);
  }
  if (this.pageOperationService == null) {
    this.pageOperationService = new PageOperationService(this);
    await this.pageOperationService.init();
  }
};

Crowi.prototype.setupInAppNotificationService = async function() {
  const InAppNotificationService = require('../service/in-app-notification');
  if (this.inAppNotificationService == null) {
    this.inAppNotificationService = new InAppNotificationService(this);
  }
};

Crowi.prototype.setupActivityService = async function() {
  const ActivityService = require('../service/activity');
  if (this.activityService == null) {
    this.activityService = new ActivityService(this);
    await this.activityService.createTtlIndex();
  }
};

Crowi.prototype.setupCommentService = async function() {
  const CommentService = require('../service/comment');
  if (this.commentService == null) {
    this.commentService = new CommentService(this);
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

Crowi.prototype.setupSlackIntegrationService = async function() {
  if (this.slackIntegrationService == null) {
    this.slackIntegrationService = new SlackIntegrationService(this);
  }

  // add as a message handler
  if (this.s2sMessagingService != null) {
    this.s2sMessagingService.addMessageHandler(this.slackIntegrationService);
  }
};

Crowi.prototype.setupG2GTransferService = async function() {
  if (this.g2gTransferPusherService == null) {
    this.g2gTransferPusherService = new G2GTransferPusherService(this);
  }
  if (this.g2gTransferReceiverService == null) {
    this.g2gTransferReceiverService = new G2GTransferReceiverService(this);
  }
};

export default Crowi;
