/**
 * Crowi::app.js
 *
 * @package Crowi
 * @author  Sotaro KARASAWA <sotarok@crocos.co.jp>
 */

var express  = require('express')
  , cons     = require('consolidate')
  , swig     = require('swig')
  , flash    = require('connect-flash')
  , http     = require('http')
  , facebook = require('facebook-node-sdk')
  , mongo    = require('mongoose')
  , socketio = require('socket.io')
  , middleware = require('./lib/middlewares')
  , time     = require('time')
  , async    = require('async')
  , models
  , config
  , server
  ;


time.tzset('Asia/Tokyo');

var app = express();
var env = app.get('env');

// mongoUri = mongodb://user:password@host/dbname
var mongoUri = process.env.MONGOLAB_URI
  || process.env.MONGOHQ_URL
  || process.env.MONGO_URI
  || 'mongodb://localhost/crowi';

mongo.connect(mongoUri);

app.set('port', process.env.SERVER_PORT || 3000);
app.engine('html', cons.swig);
app.set('view cache', false);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
  rolling: true,
  secret: process.env.SECRET_TOKEN || 'this is default session secret',
}));
app.use(flash());
app.use(express.static(__dirname + '/public'));

config = require('./models/config')(app);

async.series([
  function (next) {
    config.getConfigArray(function(err, doc) {
      app.set('config', doc);

      return next();
    });
  }, function (next) {
    models = require('./models')(app);
    models.Config = config;

    // configure application
    app.use(function(req, res, next) {
      var days = (1000*3600*24*30)
        , now = new Date()
        , fbparams = {}
        , config = app.set('config');

      tzoffset = -(config.crowi['app:timezone'] || 9) * 60; // for datez
      app.set('tzoffset', tzoffset);

      req.config = config;

      req.session.cookie.expires = new Date(Date.now() + days);
      req.session.cookie.maxAge = days;

      req.baseUrl = (req.headers['x-forwarded-proto'] == 'https' ? 'https' : req.protocol) + "://" + req.get('host');
      res.locals({
        req: req,
        baseUrl: req.baseUrl,
        config: config,
        env: app.get('env'),
        now: now,
        tzoffset: tzoffset,
        facebook: {appId: config.crowi['facebook:appId'] || ''},
        consts: {
          pageGrants: models.Page.getGrantLabels(),
          userStatus: models.User.getUserStatusLabels(),
        },
      });

      if (config.crowi['facebook:appId']) {
        app.use(facebook.middleware({
          appId: config.crowi['facebook:appId'],
          secret: config.crowi['facebook:secret']
        }));
      }
      next();
    });

    // register swig function
    app.use(middleware.swigFilters(app, swig));
    app.use(middleware.swigFunctions(app));

    app.use(middleware.loginChecker(app, models));

    app.use(app.router);

    next();
  }, function(next) {

    if (env == 'development') {
      swig.setDefaults({ cache: false });
      app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

      server = http.createServer(app).listen(app.get('port'), function(){
        console.log("[" + app.get('env') + "] Express server listening on port " + app.get('port'));
      });
    }

    if (env == 'production') {
      var oneYear = 31557600000;
      app.use(function (err, req, res, next) {
        res.status(500);
        res.render('500', { error: err });
      });

      server = http.createServer(app).listen(app.get('port'), '127.0.0.1', function(){
        console.log("[" + app.get('env') + "] Express server listening on port " + app.get('port'));
      });
    }

    var io = socketio.listen(server);
    io.sockets.on('connection', function (socket) {
    });

    app.set('io', io);
    require('./routes')(app);

    next();
  }
]);

