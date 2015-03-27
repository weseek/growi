/**
 * Crowi::app.js
 *
 * @package Crowi
 * @author  Sotaro KARASAWA <sotarok@crocos.co.jp>
 */

var express  = require('express')
  , bodyParser = require('body-parser')
  , multer   = require('multer')
  , morgan   = require('morgan')
  , cookieParser = require('cookie-parser')
  , methodOverride = require('method-override')
  , errorHandler = require('errorhandler')
  , cons     = require('consolidate')
  , swig     = require('swig')
  , flash    = require('connect-flash')
  , http     = require('http')
  , facebook = require('facebook-node-sdk')
  , mongo    = require('mongoose')
  , middleware = require('./lib/util/middlewares')
  , time     = require('time')
  , async    = require('async')
  , session  = require('express-session')
  , basicAuth = require('basic-auth-connect')
  , debug    = require('debug')('crowi:appjs')
  , models
  , config
  , configModel
  , server
  , sessionConfig
  , RedisStore
  ;

time.tzset('Asia/Tokyo');

var app = express();
var env = app.get('env');
var days = (1000*3600*24*30);

// mongoUri = mongodb://user:password@host/dbname
var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  process.env.MONGO_URI ||
  'mongodb://localhost/crowi'
  ;

mongo.connect(mongoUri);

sessionConfig = {
  rolling: true,
  secret: process.env.SECRET_TOKEN || 'this is default session secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: days,
  },
};
var redisUrl = process.env.REDISTOGO_URL ||
  process.env.REDIS_URL ||
  null;

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

app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));
app.engine('html', cons.swig);
app.set('view cache', false);
app.set('view engine', 'html');
app.set('views', __dirname + '/lib/views');
app.use(methodOverride());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(multer());
app.use(session(sessionConfig));
app.use(flash());

configModel = require('./lib/models/config')(app);

async.series([
  function (next) {
    configModel.loadAllConfig(function(err, doc) {
      app.set('config', doc);

      return next();
    });
  }, function (next) {
    var config = app.set('config')
      , tzoffset
      ;


    app.set('mailer', require('./lib/util/mailer')(app));

    models = require('./lib/models')(app);
    models.Config = configModel;

    // configure application
    app.use(function(req, res, next) {
      var now = new Date()
        , fbparams = {}
        , baseUrl
        , config = app.set('config');

      tzoffset = -(config.crowi['app:timezone'] || 9) * 60; // for datez
      app.set('tzoffset', tzoffset);

      req.config = config;

      config.crowi['app:url'] = baseUrl = (req.headers['x-forwarded-proto'] == 'https' ? 'https' : req.protocol) + '://' + req.get('host');

      res.locals.req      = req;
      res.locals.baseUrl  = baseUrl;
      res.locals.config   = config;
      res.locals.env      = app.get('env');
      res.locals.now      = now;
      res.locals.tzoffset = tzoffset;
      res.locals.facebook = {appId: config.crowi['facebook:appId'] || ''};
      res.locals.consts   = {
          pageGrants: models.Page.getGrantLabels(),
          userStatus: models.User.getUserStatusLabels(),
          registrationMode: models.Config.getRegistrationModeLabels(),
      };

      next();
    });

    app.use(function(req, res, next) {
      if (config.crowi['security:basicName'] && config.crowi['security:basicSecret']) {
        return basicAuth(
          config.crowi['security:basicName'],
          config.crowi['security:basicSecret'])(req, res, next);
      } else {
        next();
      }
    });

    app.use(function(req, res, next) {
      var config = app.set('config');
      if (config.crowi['facebook:appId'] && config.crowi['facebook:secret']) {
        return facebook.middleware({
          appId: config.crowi['facebook:appId'],
          secret: config.crowi['facebook:secret']
        })(req, res, next);
      } else {
        return next();
      }
    });

    // register swig function
    app.use(middleware.swigFilters(app, swig));
    app.use(middleware.swigFunctions(app));

    app.use(middleware.loginChecker(app, models));

    next();
  }, function(next) {

    if (env == 'development') {
      swig.setDefaults({ cache: false });
      app.use(errorHandler({ dumpExceptions: true, showStack: true }));
      app.use(morgan('dev'));

      server = http.createServer(app).listen(app.get('port'), function(){
        console.log('[' + app.get('env') + '] Express server listening on port ' + app.get('port'));
      });
    }

    if (env == 'production') {
      var oneYear = 31557600000;
      app.use(morgan('combined'));
      app.use(function (err, req, res, next) {
        res.status(500);
        res.render('500', { error: err });
      });

      server = http.createServer(app).listen(app.get('port'), function(){
        console.log('[' + app.get('env') + '] Express server listening on port ' + app.get('port'));
      });
    }

    require('./lib/routes')(app);

    var io = require('socket.io')(server);
    io.sockets.on('connection', function (socket) {
    });

    app.set('io', io);

    next();
  }
]);

