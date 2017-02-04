'use strict';


var debug = require('debug')('crowi:crowi')
  , pkg = require('../../package.json')
  , path = require('path')
  , fs = require('fs')
  , sep = path.sep

  , mongoose    = require('mongoose')

  , models = require('../models')
  ;

function Crowi (rootdir, env)
{
  var self = this;

  this.version = pkg.version;

  this.rootDir   = rootdir;
  this.pluginDir = path.join(this.rootDir, 'node_modules') + sep;
  this.publicDir = path.join(this.rootDir, 'public') + sep;
  this.libDir    = path.join(this.rootDir, 'lib') + sep;
  this.eventsDir = path.join(this.libDir, 'events') + sep;
  this.localeDir = path.join(this.rootDir, 'locales') + sep;
  this.resourceDir = path.join(this.rootDir, 'resource') + sep;
  this.viewsDir  = path.join(this.libDir, 'views') + sep;
  this.mailDir   = path.join(this.viewsDir, 'mail') + sep;
  this.tmpDir    = path.join(this.rootDir, 'tmp') + sep;
  this.cacheDir  = path.join(this.tmpDir, 'cache');

  this.assets    = {};
  try {
    this.assets = require(this.publicDir + '/js/manifest.json') || {};
  } catch (e) {
    // ignore
  }

  this.config = {};
  this.searcher = null;
  this.mailer = {};

  this.tokens = null;

  this.models = {};

  this.env = env;
  this.node_env = this.env.NODE_ENV || 'development';
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
    return new Promise(function(resolve, reject) {
      self.model('Config', require('../models/config')(self));
      var Config = self.model('Config');
      Config.loadAllConfig(function(err, doc) {
        if (err) {
          return reject();
        }

        self.setConfig(doc);

        return resolve();
      });
    });
  }).then(function() {
    return self.setupSearcher();
  }).then(function() {
    return self.setupMailer();
  }).then(function() {
    return self.setupSlack();
  }).then(function() {
    return self.setupCsrf();
  }).then(function() {
    return self.buildServer();
  });
}

Crowi.prototype.setConfig = function(config) {
  this.config = config;
};

Crowi.prototype.getConfig = function() {
  return this.config;
};

Crowi.prototype.getAssetList = function() {
  if (this.node_env !== 'development') {
    return this.assets;
  }

  // reload manifest
  try {
    this.assets = JSON.parse(fs.readFileSync(this.publicDir + '/js/manifest.json'))|| {};
  } catch (e) {
    // ignore
    debug('Failed to reload assets on development', e);
  }
  return this.assets;
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
    'mongodb://localhost/crowi'
    ;

  return new Promise(function(resolve, reject) {
    mongoose.connect(mongoUri, function(e) {
      if (e) {
        debug('DB Connect Error: ', e);
        debug('DB Connect Error: ', mongoUri);
        return reject(new Error('Cann\'t connect to Database Server.'));
      }
      return resolve();
    });
  });
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

Crowi.prototype.getSearcher = function() {
  return this.searcher;
};

Crowi.prototype.getMailer = function() {
  return this.mailer;
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

  return self.buildServer()
    .then(function(app) {
      server = http.createServer(app).listen(self.port, function() {
        console.log('[' + self.node_env + '] Express server listening on port ' + self.port);
      });

      io = require('socket.io')(server);
      io.sockets.on('connection', function (socket) {
      });
      self.io = io;

      return app;
    });
};

Crowi.prototype.buildServer = function() {
  var express  = require('express')
    , errorHandler   = require('errorhandler')
    , morgan         = require('morgan')
    , app = express()
    , env = this.node_env
    ;

  require('./express-init')(this, app);
  require('../routes')(this, app);

  if (env == 'development') {
    //swig.setDefaults({ cache: false });
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(morgan('dev'));
  }

  if (env == 'production') {
    var oneYear = 31557600000;
    app.use(morgan('combined'));
    app.use(function (err, req, res, next) {
      res.status(500);
      res.render('500', { error: err });
    });
  }

  return Promise.resolve(app);
};

Crowi.prototype.exitOnError = function(err) {
  debug('Critical error occured.');
  console.error(err);
  console.error(err.stack);
  process.exit(1);
};


module.exports = Crowi;
