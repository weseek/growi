'use strict';


const debug = require('debug')('growi:crowi')
  , logger = require('@alias/logger')('growi:crowi')
  , pkg = require('@root/package.json')
  , InterceptorManager = require('@commons/service/interceptor-manager')
  , Xss = require('@commons/service/xss')
  , path = require('path')
  , sep = path.sep

  , mongoose    = require('mongoose')

  , models = require('../models')

  ;

function Crowi(rootdir, env) {
  const self = this;

  this.version = pkg.version;
  this.runtimeVersions = undefined;   // initialized by scanRuntimeVersions()

  this.rootDir     = rootdir;
  this.pluginDir   = path.join(this.rootDir, 'node_modules') + sep;
  this.publicDir   = path.join(this.rootDir, 'public') + sep;
  this.libDir      = path.join(this.rootDir, 'src/server') + sep;
  this.eventsDir   = path.join(this.libDir, 'events') + sep;
  this.viewsDir    = path.join(this.libDir, 'views') + sep;
  this.mailDir     = path.join(this.viewsDir, 'mail') + sep;
  this.resourceDir = path.join(this.rootDir, 'resource') + sep;
  this.localeDir   = path.join(this.resourceDir, 'locales') + sep;
  this.tmpDir      = path.join(this.rootDir, 'tmp') + sep;
  this.cacheDir    = path.join(this.tmpDir, 'cache');

  this.config = {};
  this.searcher = null;
  this.mailer = {};
  this.passportService = null;
  this.globalNotificationService = null;

  this.interceptorManager = new InterceptorManager();
  this.xss = new Xss();

  this.tokens = null;

  this.models = {};

  this.env = env;
  this.node_env = this.env.NODE_ENV || 'development';

  this.port = this.env.PORT || 3000;

  this.events = {
    user: new (require(self.eventsDir + 'user'))(this),
    page: new (require(self.eventsDir + 'page'))(this),
  };

}

function getMongoUrl(env) {
  return env.MONGOLAB_URI || // for B.C.
    env.MONGODB_URI || // MONGOLAB changes their env name
    env.MONGOHQ_URL ||
    env.MONGO_URI ||
    ((process.env.NODE_ENV === 'test') ? 'mongodb://localhost/growi_test' : 'mongodb://localhost/growi');
}

Crowi.prototype.init = function() {
  var self = this;

  return Promise.resolve()
    .then(function() {
      // setup database server and load all modesl
      return self.setupDatabase();
    }).then(function() {
      return self.setupModels();
    }).then(function() {
      return self.setupSessionConfig();
    }).then(function() {
      return self.setupAppConfig();
    }).then(function() {
      return self.scanRuntimeVersions();
    }).then(function() {
      return self.setupPassport();
    }).then(function() {
      return self.setupSearcher();
    }).then(function() {
      return self.setupMailer();
    }).then(function() {
      return self.setupSlack();
    }).then(function() {
      return self.setupCsrf();
    }).then(function() {
      return self.setUpGlobalNotification();
    });
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
  if (model) {
    return this.models[name] = model;
  }

  return this.models[name];
};

// getter/setter of event instance
Crowi.prototype.event = function(name, event) {
  if (event) {
    return this.events[name] = event;
  }

  return this.events[name];
};

Crowi.prototype.setupDatabase = function() {
  // mongoUri = mongodb://user:password@host/dbname
  mongoose.Promise = global.Promise;

  const mongoUri = getMongoUrl(this.env);

  return mongoose.connect(mongoUri);
};

Crowi.prototype.setupSessionConfig = function() {
  var self = this
    , session  = require('express-session')
    , sessionConfig
    , sessionAge = (1000*3600*24*30)
    , redisUrl = this.env.REDISTOGO_URL || this.env.REDIS_URI || this.env.REDIS_URL || null
    , mongoUrl = getMongoUrl(this.env)
    ;

  return new Promise(function(resolve, reject) {
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
  });
};

Crowi.prototype.setupAppConfig = function() {
  return new Promise((resolve, reject) => {
    this.model('Config', require('../models/config')(this));
    var Config = this.model('Config');
    Config.loadAllConfig((err, doc) => {
      if (err) {
        return reject();
      }

      this.setConfig(doc);

      return resolve();
    });
  });
};

Crowi.prototype.setupModels = function() {
  var self = this
    ;

  return new Promise(function(resolve, reject) {
    Object.keys(models).forEach(function(key) {
      self.model(key, models[key](self));
    });
    resolve();
  });
};

Crowi.prototype.getIo = function() {
  return this.io;
};

Crowi.prototype.scanRuntimeVersions = function() {
  var self = this
    , check = require('check-node-version')
    ;


  return new Promise((resolve, reject) => {
    check((err, result) => {
      if (err) {
        reject();
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

Crowi.prototype.getInterceptorManager = function() {
  return this.interceptorManager;
};

Crowi.prototype.getGlobalNotificationService = function() {
  return this.globalNotificationService;
};

Crowi.prototype.setupPassport = function() {
  const config = this.getConfig();
  const Config = this.model('Config');

  if (!Config.isEnabledPassport(config)) {
    // disabled
    return;
  }

  debug('Passport is enabled');

  // initialize service
  const PassportService = require('../service/passport');
  if (this.passportService == null) {
    this.passportService = new PassportService(this);
  }
  this.passportService.setupSerializer();
  // setup strategies
  this.passportService.setupLocalStrategy();
  try {
    this.passportService.setupLdapStrategy();
    this.passportService.setupGoogleStrategy();
    this.passportService.setupGitHubStrategy();
    this.passportService.setupTwitterStrategy();
  }
  catch (err) {
    logger.error(err);
  }
  return Promise.resolve();
};

Crowi.prototype.setupSearcher = function() {
  var self = this;
  var searcherUri = this.env.ELASTICSEARCH_URI
    || this.env.BONSAI_URL
    || null
    ;

  return new Promise(function(resolve, reject) {
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
  });
};

Crowi.prototype.setupMailer = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.mailer = require('../util/mailer')(self);
    resolve();
  });
};

Crowi.prototype.setupSlack = function() {
  var self = this;
  var config = this.getConfig();
  var Config = this.model('Config');

  return new Promise(function(resolve, reject) {
    if (!Config.hasSlackConfig(config)) {
      self.slack = {};
    }
    else {
      self.slack = require('../util/slack')(self);
    }

    resolve();
  });
};

Crowi.prototype.setupCsrf = function() {
  var Tokens = require('csrf');
  this.tokens = new Tokens();

  return Promise.resolve();
};

Crowi.prototype.getTokens = function() {
  return this.tokens;
};

Crowi.prototype.start = function() {
  var self = this
    , server
    , io;

  // init CrowiDev
  if (self.node_env === 'development') {
    const CrowiDev = require('./dev');
    this.crowiDev = new CrowiDev(self);
    this.crowiDev.init();
  }

  return Promise.resolve()
    .then(function() {
      return self.init();
    })
    .then(function() {
      return self.buildServer();
    })
    .then(function(express) {
      return new Promise((resolve) => {
        server = express.listen(self.port, function() {
          logger.info(`[${self.node_env}] Express server listening on port ${self.port}`);

          // setup for dev
          if (self.node_env === 'development') {
            const eazyLogger = require('eazy-logger').Logger({
              prefix: '[{green:GROWI}] ',
              useLevelPrefixes: false,
            });

            eazyLogger.info('{bold:Server URLs:}');
            eazyLogger.unprefixed('info', '{grey:=======================================}');
            eazyLogger.unprefixed('info', `         APP: {magenta:http://localhost:${self.port}}`);
            eazyLogger.unprefixed('info', '{grey:=======================================}');

            self.crowiDev.setup(server, express);
          }
          resolve(server);
        });

        io = require('socket.io')(server);
        io.sockets.on('connection', function(socket) {
        });
        self.io = io;

        // setup Express Routes
        self.setupRoutesAtLast(express);
      });
    });
};

Crowi.prototype.buildServer = function() {
  var express = require('express')()
    , env = this.node_env
    ;
  require('./express-init')(this, express);

  // import plugins
  var Config = this.model('Config');
  var isEnabledPlugins = Config.isEnabledPlugins(this.config);
  if (isEnabledPlugins) {
    debug('Plugins are enabled');
    var PluginService = require('../plugins/plugin.service');
    var pluginService = new PluginService(this, express);
    pluginService.autoDetectAndLoadPlugins();

    if (env == 'development') {
      this.crowiDev.loadPlugins(express);
    }
  }

  // use bunyan
  if (env == 'production') {
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
Crowi.prototype.setUpGlobalNotification = function() {
  const GlobalNotificationService = require('../service/global-notification');
  if (this.globalNotificationService == null) {
    this.globalNotificationService = new GlobalNotificationService(this);
  }
};

module.exports = Crowi;
