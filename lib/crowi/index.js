'use strict';


var debug = require('debug')('crowi:crowi')
  , pkg = require('../../package.json')
  , path = require('path')
  , fs = require('fs')
  , sep = path.sep

  , mongoose    = require('mongoose')

  , helpers = require('./helpers')
  , models = require('../models')
  ;

function Crowi (rootdir, env)
{
  var self = this;

  this.version = pkg.version;
  this.runtimeVersions = undefined;   // initialized by scanRuntimeVersions()

  this.rootDir     = rootdir;
  this.pluginDir   = path.join(this.rootDir, 'node_modules') + sep;
  this.publicDir   = path.join(this.rootDir, 'public') + sep;
  this.libDir      = path.join(this.rootDir, 'lib') + sep;
  this.eventsDir   = path.join(this.libDir, 'events') + sep;
  this.localeDir   = path.join(this.libDir, 'locales') + sep;
  this.resourceDir = path.join(this.rootDir, 'resource') + sep;
  this.viewsDir    = path.join(this.libDir, 'views') + sep;
  this.mailDir     = path.join(this.viewsDir, 'mail') + sep;
  this.tmpDir      = path.join(this.rootDir, 'tmp') + sep;
  this.cacheDir    = path.join(this.tmpDir, 'cache');

  this.config = {};
  this.searcher = null;
  this.mailer = {};
  this.interceptorManager = {};
  this.passportService = null;

  this.tokens = null;

  this.models = {};

  this.env = env;
  this.node_env = this.env.NODE_ENV || 'development';
  if (helpers.hasProcessFlag('prod') || helpers.hasProcessFlag('production')) {
    this.node_env = process.env.NODE_ENV = 'production';
  }

  this.port = this.env.PORT || 3000;

  this.events = {
    user: new (require(self.eventsDir + 'user'))(this),
    page: new (require(self.eventsDir + 'page'))(this),
  };

  if (this.node_env == 'development') {
  }
};

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
    return self.setupInterceptorManager();
  }).then(function() {
    return self.setupSlack();
  }).then(function() {
    return self.setupCsrf();
  });
}

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

  var mongoUri = this.env.MONGOLAB_URI || // for B.C.
    this.env.MONGODB_URI || // MONGOLAB changes their env name
    this.env.MONGOHQ_URL ||
    this.env.MONGO_URI ||
    ((process.env.NODE_ENV === 'test') ? 'mongodb://localhost/crowi_test' : 'mongodb://localhost/crowi')
    ;

  return mongoose.connect(mongoUri).then(
    () => {},
    err => {
      debug('DB Connect Error: ', err);
      debug('DB Connect Error: ', mongoUri);
    }
  );
};

Crowi.prototype.setupSessionConfig = function() {
  var self = this
    , session  = require('express-session')
    , sessionConfig
    , sessionAge = (1000*3600*24*30)
    , redisUrl = this.env.REDISTOGO_URL || this.env.REDIS_URL || null
    , RedisStore
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

    if (redisUrl) {
      var ru   = require('url').parse(redisUrl);
      var redis = require('redis');
      var redisClient = redis.createClient(ru.port, ru.hostname);
      if (ru.auth) {
        redisClient.auth(ru.auth.split(':')[1]);
      }

      RedisStore = require('connect-redis')(session);
      sessionConfig.store = new RedisStore({
        prefix: 'crowi:sess:',
        client: redisClient,
      });
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
}

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
    })
  });
}

Crowi.prototype.getSearcher = function() {
  return this.searcher;
};

Crowi.prototype.getMailer = function() {
  return this.mailer;
};

Crowi.prototype.getInterceptorManager = function() {
  return this.interceptorManager;
}

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
  this.passportService.setupLdapStrategy();

  return Promise.resolve();
}

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
      } catch (e) {
        debug('Error on setup searcher', e);
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

Crowi.prototype.setupInterceptorManager = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    const InterceptorManager = require('../util/interceptor-manager');
    self.interceptorManager = new InterceptorManager();
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
    } else {
      self.slack = require('../util/slack')(self);
    }

    resolve();
  });
};

Crowi.prototype.setupCsrf = function() {
  var Tokens = require('csrf');
  var tokens = this.tokens = new Tokens();

  return Promise.resolve();
};

Crowi.prototype.getTokens = function() {
  return this.tokens;
};

Crowi.prototype.start = function() {
  var self = this
    , http = require('http')
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
      return self.init()
    })
    .then(function() {
      return self.buildServer();
    })
    .then(function(app) {
      server = http.createServer(app).listen(self.port, function() {
        debug(`[${self.node_env}] Express server listening on port ${self.port}`);
      });

      // setup
      if (self.node_env === 'development') {
        self.crowiDev.setup(server, app);
      }

      io = require('socket.io')(server);
      io.sockets.on('connection', function (socket) {
      });
      self.io = io;

      // setup Express Routes
      self.setupRoutesAtLast(app);

      return app;
    });
};

Crowi.prototype.buildServer = function() {
  var express  = require('express')
    , app = express()
    , env = this.node_env
    ;

  require('./express-init')(this, app);

  // import plugins
  var Config = this.model('Config');
  var isEnabledPlugins = Config.isEnabledPlugins(this.config);
  if (isEnabledPlugins) {
    debug('Plugins are enabled');
    var PluginService = require('../plugins/plugin.service');
    var pluginService = new PluginService(this, app);
    pluginService.autoDetectAndLoadPlugins();

    if (env == 'development') {
      this.crowiDev.loadPlugins(app);
    }
  }

  if (env == 'development') {
    //swig.setDefaults({ cache: false });   // moved to dev.js -- 2017.07.09 Yuki Takei
    const morgan = require('morgan');
    app.use(morgan('dev'));
  }

  if (env == 'production') {
    /*
     * commented out morgan because of using pino  -- 2017.06.27 Yuki Takei
     *
    var oneYear = 31557600000;
    app.use(morgan('combined'));
    app.use(function (err, req, res, next) {
      res.status(500);
      res.render('500', { error: err });
    });
     */
    const pino = require('pino')({extreme: true}, process.stdout);
    const expressPino = require('express-pino-logger')({pino});
    app.use(expressPino);
  }

  return Promise.resolve(app);
};

/**
 * setup Express Routes
 * !! this must be at last because it includes '/*' route !!
 */
Crowi.prototype.setupRoutesAtLast = function(app) {
  require('../routes')(this, app);
}

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
}

Crowi.prototype.exitOnError = function(err) {
  debug('Critical error occured.');
  console.error(err);
  console.error(err.stack);
  process.exit(1);
};


module.exports = Crowi;
