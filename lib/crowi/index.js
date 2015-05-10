'use strict';


var debug = require('debug')('crowi:crowi')
  , pkg = require('../../package.json')
  , path = require('path')
  , sep = path.sep
  , Promise = require('bluebird')

  , http     = require('http')
  , express  = require('express')

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
  this.viewsDir  = path.join(this.libDir, 'views') + sep;
  this.mailDir   = path.join(this.viewsDir, 'mail') + sep;

  this.config = {};
  this.mailer = {};

  this.models = {};

  this.env = env;
  this.node_env = this.env.NODE_ENV || 'development';
  this.port = this.env.PORT || 3000;

  if (this.node_env == 'development') {
    Promise.longStackTraces();
  }

  //time.tzset('Asia/Tokyo');
};

Crowi.prototype.init = function() {
  var self = this;

  return new Promise.resolve()
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
    return self.setupMailer();
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

// getter/setter of model instance
//
Crowi.prototype.model = function(name, model) {
  if (model) {
    return this.models[name] = model;
  }

  return this.models[name];
};

Crowi.prototype.setupDatabase = function() {
  // mongoUri = mongodb://user:password@host/dbname
  var mongoUri = this.env.MONGOLAB_URI ||
    this.env.MONGOHQ_URL ||
    this.env.MONGO_URI ||
    'mongodb://localhost/crowi'
    ;

  return new Promise(function(resolve, reject) {
    mongoose.connect(mongoUri, function(e) {
      if (e) {
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

Crowi.prototype.getMailer = function() {
  return this.mailer;
};

Crowi.prototype.setupMailer = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.mailer = require('../util/mailer')(self);
    resolve();
  });
};


Crowi.prototype.start = function(app) {
  var self = this
    , server
    , io;

  server = http.createServer(app).listen(self.port, function() {
    console.log('[' + self.node_env + '] Express server listening on port ' + self.port);
  });

  io = require('socket.io')(server);
  io.sockets.on('connection', function (socket) {
  });
  this.io = io;
};

Crowi.prototype.buildServer = function() {
  var app            = express()
    , env            = this.node_env
    , sessionConfig  = this.setupSessionConfig();
    ;

  require('./express-init')(this, app);
  require('../routes')(this, app);

  return new Promise.resolve(app);
};

Crowi.prototype.exitOnError = function(err) {
  debug('Critical error occured.');
  console.error(err);
  console.error(err.stack);
  process.exit(1);
};


module.exports = Crowi;
